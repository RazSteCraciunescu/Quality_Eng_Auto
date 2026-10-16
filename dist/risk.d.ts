import type { GateStatus, ReleaseMetrics } from "./types.js";
export interface RiskEvaluation {
    score: number;
    status: GateStatus;
    reasons: string[];
    contributions: Record<string, number>;
}
export declare function calculateRisk(metrics: ReleaseMetrics): RiskEvaluation;
