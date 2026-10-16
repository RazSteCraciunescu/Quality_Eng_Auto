import type { EvaluatedRelease, IntegrationArtifact } from "./types.js";
export type ReleaseSort = "targetDate" | "riskScore" | "passRate" | "name";
export type SortDirection = "asc" | "desc";
export interface ReleaseQuery {
    status?: string | undefined;
    q?: string | undefined;
    sort?: ReleaseSort;
    direction?: SortDirection;
}
export declare class ReleaseRepository {
    readonly releases: EvaluatedRelease[];
    readonly integrations: IntegrationArtifact[];
    constructor(projectRoot: string);
    list(query?: ReleaseQuery): EvaluatedRelease[];
    get(id: string): EvaluatedRelease | undefined;
    summary(): Record<string, number>;
}
