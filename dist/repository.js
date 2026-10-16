import { readFileSync } from "node:fs";
import { join } from "node:path";
import { calculateRisk } from "./risk.js";
function readJson(path) {
    return JSON.parse(readFileSync(path, "utf8"));
}
export class ReleaseRepository {
    releases;
    integrations;
    constructor(projectRoot) {
        const records = readJson(join(projectRoot, "data", "releases.json"));
        this.releases = records.map((record) => {
            const evaluation = calculateRisk(record.metrics);
            return {
                ...record,
                riskScore: evaluation.score,
                status: evaluation.status,
                gateReasons: evaluation.reasons
            };
        });
        this.integrations = readJson(join(projectRoot, "data", "integrations", "manifest.json"));
    }
    list(query = {}) {
        const status = query.status?.toLowerCase();
        const search = query.q?.trim().toLowerCase();
        const sort = query.sort ?? "targetDate";
        const direction = query.direction ?? "asc";
        const filtered = this.releases.filter((release) => {
            if (status && status !== "all" && release.status !== status)
                return false;
            if (!search)
                return true;
            return [release.name, release.version, release.environment, release.owner]
                .join(" ")
                .toLowerCase()
                .includes(search);
        });
        return [...filtered].sort((left, right) => {
            const leftValue = sort === "passRate" ? left.metrics.passRate : left[sort];
            const rightValue = sort === "passRate" ? right.metrics.passRate : right[sort];
            const result = typeof leftValue === "number"
                ? leftValue - Number(rightValue)
                : String(leftValue).localeCompare(String(rightValue));
            return direction === "desc" ? -result : result;
        });
    }
    get(id) {
        return this.releases.find((release) => release.id === id);
    }
    summary() {
        return this.releases.reduce((result, release) => {
            result.total += 1;
            result[release.status] += 1;
            return result;
        }, { total: 0, ready: 0, conditional: 0, blocked: 0 });
    }
}
//# sourceMappingURL=repository.js.map