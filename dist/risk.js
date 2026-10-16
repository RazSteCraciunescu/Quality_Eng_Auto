function roundOne(value) {
    return Math.round((value + Number.EPSILON) * 10) / 10;
}
function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}
export function calculateRisk(metrics) {
    const contributions = {
        failedTests: clamp((100 - metrics.passRate) * 1.8, 0, 50),
        criticalDefects: clamp(metrics.criticalDefects * 22, 0, 44),
        highDefects: clamp(metrics.highDefects * 6, 0, 24),
        flakiness: clamp(metrics.flakyRate * 1.2, 0, 12),
        coverageGap: clamp((85 - metrics.coverage) * 0.7, 0, 15),
        escapedDefects: clamp(metrics.escapedDefects * 5, 0, 15)
    };
    const score = roundOne(clamp(Object.values(contributions).reduce((total, value) => total + value, 0), 0, 100));
    const reasons = [];
    if (metrics.criticalDefects > 0)
        reasons.push("Open critical defect");
    if (metrics.highDefects > 0)
        reasons.push(`${metrics.highDefects} open high-severity defect${metrics.highDefects === 1 ? "" : "s"}`);
    if (metrics.passRate < 95)
        reasons.push(`Pass rate below 95% (${metrics.passRate.toFixed(1)}%)`);
    if (metrics.coverage < 85)
        reasons.push(`Coverage below 85% (${metrics.coverage.toFixed(1)}%)`);
    if (metrics.flakyRate > 3)
        reasons.push(`Flaky-test rate above 3% (${metrics.flakyRate.toFixed(1)}%)`);
    if (metrics.escapedDefects > 0)
        reasons.push(`${metrics.escapedDefects} escaped defect${metrics.escapedDefects === 1 ? "" : "s"}`);
    let status;
    if (metrics.criticalDefects > 0 || metrics.passRate < 80 || score >= 70) {
        status = "blocked";
    }
    else if (metrics.highDefects > 0 ||
        metrics.passRate < 95 ||
        metrics.coverage < 85 ||
        score >= 25) {
        status = "conditional";
    }
    else {
        status = "ready";
    }
    if (reasons.length === 0)
        reasons.push("All release thresholds met");
    return { score, status, reasons, contributions };
}
//# sourceMappingURL=risk.js.map