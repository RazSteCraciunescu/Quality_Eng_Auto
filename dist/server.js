import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import { calculateRisk } from "./risk.js";
import { ReleaseRepository } from "./repository.js";
const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const defaultProjectRoot = resolve(moduleDirectory, "..");
const startedAt = Date.now();
const counters = new Map();
const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".yaml": "application/yaml; charset=utf-8",
    ".yml": "application/yaml; charset=utf-8",
    ".txt": "text/plain; charset=utf-8"
};
function setCommonHeaders(response, requestId) {
    response.setHeader("X-Request-Id", requestId);
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
}
function json(response, status, body) {
    const payload = JSON.stringify(body, null, 2);
    response.statusCode = status;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Content-Length", Buffer.byteLength(payload));
    response.end(payload);
}
function text(response, status, body, contentType = "text/plain; charset=utf-8") {
    response.statusCode = status;
    response.setHeader("Content-Type", contentType);
    response.setHeader("Content-Length", Buffer.byteLength(body));
    response.end(body);
}
async function readBody(request, maximumBytes = 1_000_000) {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buffer.length;
        if (size > maximumBytes)
            throw new Error("Request body is too large");
        chunks.push(buffer);
    }
    return Buffer.concat(chunks).toString("utf8");
}
function metricKey(method, route, status) {
    return `${method}|${route}|${status}`;
}
function track(method, route, status) {
    const key = metricKey(method, route, status);
    counters.set(key, (counters.get(key) ?? 0) + 1);
}
function renderMetrics(repository) {
    const summary = repository.summary();
    const averageRisk = repository.releases.reduce((total, release) => total + release.riskScore, 0)
        / repository.releases.length;
    const lines = [
        "# HELP release_readiness_uptime_seconds Process uptime in seconds.",
        "# TYPE release_readiness_uptime_seconds gauge",
        `release_readiness_uptime_seconds ${Math.floor((Date.now() - startedAt) / 1000)}`,
        "# HELP release_readiness_releases Releases grouped by current readiness status.",
        "# TYPE release_readiness_releases gauge",
        `release_readiness_releases{status="ready"} ${summary.ready}`,
        `release_readiness_releases{status="conditional"} ${summary.conditional}`,
        `release_readiness_releases{status="blocked"} ${summary.blocked}`,
        "# HELP release_readiness_release_average_risk Average calculated risk score across releases.",
        "# TYPE release_readiness_release_average_risk gauge",
        `release_readiness_release_average_risk ${averageRisk.toFixed(1)}`,
        "# HELP release_readiness_http_requests_total HTTP requests handled by route and status.",
        "# TYPE release_readiness_http_requests_total counter"
    ];
    for (const [key, count] of [...counters.entries()].sort()) {
        const [method, route, status] = key.split("|");
        lines.push(`release_readiness_http_requests_total{method="${method}",route="${route}",status="${status}"} ${count}`);
    }
    return `${lines.join("\n")}\n`;
}
function safeStaticPath(publicDirectory, pathname) {
    const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const candidate = resolve(publicDirectory, relativePath);
    if (candidate !== publicDirectory && !candidate.startsWith(`${publicDirectory}${sep}`))
        return undefined;
    if (!existsSync(candidate) || !statSync(candidate).isFile())
        return undefined;
    return candidate;
}
function sendFile(response, path) {
    response.statusCode = 200;
    response.setHeader("Content-Type", mimeTypes[extname(path)] ?? "application/octet-stream");
    response.setHeader("Content-Length", statSync(path).size);
    createReadStream(path).pipe(response);
}
function parseMetrics(value) {
    if (!value || typeof value !== "object")
        return undefined;
    const record = value;
    const names = [
        "passRate",
        "coverage",
        "flakyRate",
        "criticalDefects",
        "highDefects",
        "escapedDefects"
    ];
    const metrics = {};
    const integerFields = new Set(["criticalDefects", "highDefects", "escapedDefects"]);
    for (const name of names) {
        const number = Number(record[name]);
        if (!Number.isFinite(number) || number < 0)
            return undefined;
        if (integerFields.has(name) && !Number.isInteger(number))
            return undefined;
        metrics[name] = number;
    }
    if (metrics.passRate > 100 || metrics.coverage > 100 || metrics.flakyRate > 100)
        return undefined;
    return metrics;
}
function releaseIdFromSoap(body) {
    const match = body.match(/<releaseId>\s*([^<]+?)\s*<\/releaseId>/i);
    return match?.[1]?.trim();
}
function xmlEscape(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}
export function createApplicationServer(options = {}) {
    const projectRoot = options.projectRoot ?? defaultProjectRoot;
    const repository = new ReleaseRepository(projectRoot);
    const publicDirectory = join(projectRoot, "public");
    return createHttpServer(async (request, response) => {
        const requestId = randomUUID();
        setCommonHeaders(response, requestId);
        const method = request.method ?? "GET";
        const requestUrl = new URL(request.url ?? "/", "http://localhost");
        const pathname = requestUrl.pathname;
        let route = pathname;
        try {
            if (method === "OPTIONS") {
                response.statusCode = 204;
                response.setHeader("Allow", "GET, POST, OPTIONS");
                response.end();
                track(method, route, 204);
                return;
            }
            if (method === "GET" && pathname === "/api/health") {
                const body = {
                    status: "ok",
                    service: "release-readiness-lab",
                    version: "1.0.0",
                    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
                    timestamp: new Date().toISOString()
                };
                json(response, 200, body);
                track(method, route, 200);
                return;
            }
            if (method === "GET" && pathname === "/api/releases") {
                const allowedStatuses = new Set(["all", "ready", "conditional", "blocked"]);
                const allowedSorts = new Set(["targetDate", "riskScore", "passRate", "name"]);
                const allowedDirections = new Set(["asc", "desc"]);
                const status = requestUrl.searchParams.get("status") ?? undefined;
                const query = requestUrl.searchParams.get("q") ?? undefined;
                const requestedSort = requestUrl.searchParams.get("sort") ?? "targetDate";
                const requestedDirection = requestUrl.searchParams.get("direction") ?? "asc";
                if (status && !allowedStatuses.has(status)) {
                    json(response, 400, { error: "invalid_status", requestId });
                    track(method, route, 400);
                    return;
                }
                if (query && query.length > 100) {
                    json(response, 400, { error: "query_too_long", requestId });
                    track(method, route, 400);
                    return;
                }
                if (!allowedSorts.has(requestedSort)) {
                    json(response, 400, { error: "invalid_sort", requestId });
                    track(method, route, 400);
                    return;
                }
                if (!allowedDirections.has(requestedDirection)) {
                    json(response, 400, { error: "invalid_direction", requestId });
                    track(method, route, 400);
                    return;
                }
                const sort = requestedSort;
                const direction = requestedDirection;
                const releases = repository.list({ status, q: query, sort, direction });
                json(response, 200, {
                    data: releases,
                    meta: {
                        count: releases.length,
                        summary: repository.summary(),
                        generatedAt: new Date().toISOString()
                    }
                });
                track(method, route, 200);
                return;
            }
            const releaseMatch = pathname.match(/^\/api\/releases\/([a-z0-9-]+)$/i);
            if (method === "GET" && releaseMatch?.[1]) {
                route = "/api/releases/:id";
                const release = repository.get(releaseMatch[1]);
                if (!release) {
                    json(response, 404, { error: "release_not_found", requestId });
                    track(method, route, 404);
                    return;
                }
                json(response, 200, { data: release });
                track(method, route, 200);
                return;
            }
            const evaluateMatch = pathname.match(/^\/api\/releases\/([a-z0-9-]+)\/evaluate$/i);
            if (method === "POST" && evaluateMatch?.[1]) {
                route = "/api/releases/:id/evaluate";
                const release = repository.get(evaluateMatch[1]);
                if (!release) {
                    json(response, 404, { error: "release_not_found", requestId });
                    track(method, route, 404);
                    return;
                }
                const rawBody = await readBody(request);
                let parsed;
                try {
                    parsed = rawBody ? JSON.parse(rawBody) : {};
                }
                catch {
                    json(response, 400, { error: "invalid_json", requestId });
                    track(method, route, 400);
                    return;
                }
                const payload = parsed;
                const metrics = payload.metrics === undefined ? release.metrics : parseMetrics(payload.metrics);
                if (!metrics) {
                    json(response, 422, { error: "invalid_metrics", requestId });
                    track(method, route, 422);
                    return;
                }
                json(response, 200, { data: calculateRisk(metrics) });
                track(method, route, 200);
                return;
            }
            if (method === "GET" && pathname === "/api/integrations") {
                json(response, 200, { data: repository.integrations });
                track(method, route, 200);
                return;
            }
            if (method === "GET" && pathname === "/metrics") {
                text(response, 200, renderMetrics(repository), "text/plain; version=0.0.4; charset=utf-8");
                track(method, route, 200);
                return;
            }
            if (method === "GET" && pathname === "/openapi.json") {
                const path = join(projectRoot, "api", "openapi.json");
                sendFile(response, path);
                track(method, route, 200);
                return;
            }
            if (method === "GET" && pathname === "/openapi.yaml") {
                const path = join(projectRoot, "api", "openapi.yaml");
                sendFile(response, path);
                track(method, route, 200);
                return;
            }
            if (method === "POST" && pathname === "/soap/release-readiness") {
                const body = await readBody(request);
                const releaseId = releaseIdFromSoap(body);
                if (!releaseId) {
                    text(response, 400, "<error>Missing releaseId</error>", "application/xml; charset=utf-8");
                    track(method, route, 400);
                    return;
                }
                const release = repository.get(releaseId);
                if (!release) {
                    text(response, 404, "<error>Release not found</error>", "application/xml; charset=utf-8");
                    track(method, route, 404);
                    return;
                }
                const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<releaseReadinessResponse>\n  <releaseId>${xmlEscape(release.id)}</releaseId>\n  <name>${xmlEscape(release.name)}</name>\n  <status>${release.status}</status>\n  <riskScore>${release.riskScore.toFixed(1)}</riskScore>\n  <passRate>${release.metrics.passRate.toFixed(1)}</passRate>\n</releaseReadinessResponse>\n`;
                text(response, 200, xml, "application/xml; charset=utf-8");
                track(method, route, 200);
                return;
            }
            if (method === "GET") {
                const staticPath = safeStaticPath(publicDirectory, pathname);
                if (staticPath) {
                    sendFile(response, staticPath);
                    track(method, "static", 200);
                    return;
                }
            }
            json(response, 404, { error: "not_found", requestId });
            track(method, route, 404);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unexpected error";
            json(response, message.includes("too large") ? 413 : 500, {
                error: message.includes("too large") ? "payload_too_large" : "internal_error",
                requestId
            });
            track(method, route, response.statusCode);
        }
    });
}
export async function startServer(options = {}) {
    const server = createApplicationServer(options);
    const host = options.host ?? process.env.HOST ?? "127.0.0.1";
    const port = options.port ?? Number(process.env.PORT ?? 4173);
    await new Promise((resolvePromise, reject) => {
        server.once("error", reject);
        server.listen(port, host, () => resolvePromise());
    });
    const address = server.address();
    if (!address || typeof address === "string")
        throw new Error("Could not determine listening address");
    return {
        server,
        baseUrl: `http://${host}:${address.port}`,
        close: () => new Promise((resolvePromise, reject) => {
            server.close((error) => error ? reject(error) : resolvePromise());
        })
    };
}
const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
    startServer()
        .then(({ baseUrl }) => {
        process.stdout.write(`Release Readiness Lab listening on ${baseUrl}\n`);
    })
        .catch((error) => {
        process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
        process.exitCode = 1;
    });
}
//# sourceMappingURL=server.js.map