# ADR 0001: Use a deterministic release gate

**Status:** accepted

## Context

Reviewers need to understand why a release is ready, conditional or blocked. A model that changes without visible inputs would be difficult to test, audit and challenge.

## Decision

Use an explicit weighted score plus hard severity/pass-rate rules. Return the score, status, reasons and contribution breakdown. Characterize the three sample releases with exact tests.

## Consequences

- Decisions are easy to reproduce and explain.
- Threshold changes require code, test and policy review.
- The score does not learn from production outcomes automatically.
- Teams must calibrate thresholds with historical incident and escape data.
