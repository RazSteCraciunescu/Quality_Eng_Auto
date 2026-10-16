export type GateStatus = "ready" | "conditional" | "blocked";
export interface ReleaseMetrics {
    passRate: number;
    coverage: number;
    flakyRate: number;
    criticalDefects: number;
    highDefects: number;
    escapedDefects: number;
}
export interface TestExecutionSummary {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    automated: number;
}
export interface DefectSummary {
    open: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
}
export interface Requirement {
    id: string;
    title: string;
    priority: "critical" | "high" | "medium" | "low";
    coveredBy: string[];
}
export interface EvidenceItem {
    type: string;
    label: string;
    path: string;
}
export interface ReleaseRecord {
    id: string;
    name: string;
    version: string;
    environment: string;
    targetDate: string;
    owner: string;
    description: string;
    metrics: ReleaseMetrics;
    execution: TestExecutionSummary;
    defects: DefectSummary;
    requirements: Requirement[];
    evidence: EvidenceItem[];
    notes: string[];
}
export interface EvaluatedRelease extends ReleaseRecord {
    riskScore: number;
    status: GateStatus;
    gateReasons: string[];
}
export interface IntegrationArtifact {
    id: string;
    name: string;
    recordCount: number;
    status: "available" | "optional";
    path: string;
    description: string;
}
