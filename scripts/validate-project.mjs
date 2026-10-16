import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "README.md",
  "LICENSE",
  "package.json",
  "dist/server.js",
  "public/index.html",
  "data/releases.json",
  "data/integrations/manifest.json",
  "api/openapi.json",
  "api/openapi.yaml",
  "api/postman/release-readiness.postman_collection.json",
  "api/soapui/release-readiness-soapui-project.xml",
  "database/schema.sql",
  "infra/kubernetes/kustomization.yaml",
  "tests/e2e/visual.spec.ts-snapshots/release-workspace-chromium-linux.png",
  "wireshark/sample-http-session.pcap",
  "Jenkinsfile",
  "Dockerfile",
  ".github/workflows/ci.yml"
];

const failures = [];
for (const file of requiredFiles) {
  const path = join(root, file);
  if (!existsSync(path) || statSync(path).size === 0) failures.push(`Missing or empty required file: ${file}`);
}

function parseJson(relativePath) {
  try {
    return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
  } catch (error) {
    failures.push(`Invalid JSON in ${relativePath}: ${error.message}`);
    return undefined;
  }
}

const releases = parseJson("data/releases.json");
const integrations = parseJson("data/integrations/manifest.json");
const openapi = parseJson("api/openapi.json");
const postman = parseJson("api/postman/release-readiness.postman_collection.json");
parseJson("api/postman/local.postman_environment.json");
parseJson("api/schemas/release.schema.json");
parseJson("observability/grafana-dashboard.json");

if (!Array.isArray(releases) || releases.length !== 3) failures.push("Expected exactly three sample releases");
if (!Array.isArray(integrations) || integrations.length < 5) failures.push("Expected at least five integration samples");
if (openapi?.openapi !== "3.1.0") failures.push("OpenAPI document must use version 3.1.0");
if (!postman?.info?.schema?.includes("collection")) failures.push("Postman collection metadata is missing");

const releaseIds = new Set();
for (const release of releases ?? []) {
  if (releaseIds.has(release.id)) failures.push(`Duplicate release id: ${release.id}`);
  releaseIds.add(release.id);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(release.targetDate)) failures.push(`Invalid target date for ${release.id}`);
  const executionTotal = release.execution.passed + release.execution.failed + release.execution.skipped;
  if (executionTotal !== release.execution.total) failures.push(`Execution totals do not add up for ${release.id}`);
  if (release.execution.automated > release.execution.total) failures.push(`Automated execution count exceeds total for ${release.id}`);
  if (release.defects.critical !== release.metrics.criticalDefects) failures.push(`Critical defect count mismatch for ${release.id}`);
  if (release.defects.high !== release.metrics.highDefects) failures.push(`High defect count mismatch for ${release.id}`);
  for (const requirement of release.requirements ?? []) {
    if (!Array.isArray(requirement.coveredBy) || requirement.coveredBy.length === 0) {
      failures.push(`Requirement ${requirement.id} has no test coverage`);
    }
  }
}

function walk(directory) {
  const results = [];
  for (const name of readdirSync(directory)) {
    if (["node_modules", ".git", ".venv", ".pytest_cache"].includes(name)) continue;
    const full = join(directory, name);
    if (statSync(full).isDirectory()) results.push(...walk(full));
    else results.push(full);
  }
  return results;
}

const textExtensions = new Set([".cmd", ".cjs", ".csv", ".env", ".html", ".js", ".json", ".md", ".mjs", ".ps1", ".py", ".sh", ".sql", ".toml", ".ts", ".txt", ".xml", ".yaml", ".yml"]);
const secretPatterns = [
  { name: "private key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "AWS access key", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "GitHub token", pattern: /\bgh[oprsu]_[A-Za-z0-9]{30,}\b/ }
];

for (const file of walk(root)) {
  const extension = file.slice(file.lastIndexOf(".")).toLowerCase();
  if (!textExtensions.has(extension)) continue;
  const content = readFileSync(file, "utf8");
  for (const { name, pattern } of secretPatterns) {
    if (pattern.test(content)) failures.push(`Possible ${name} in ${file.slice(root.length + 1)}`);
  }
}

if (failures.length) {
  console.error("Project validation failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log(`Project validation passed: ${releases.length} releases, ${integrations.length} integration samples, ${Object.keys(openapi.paths).length} API paths.`);
