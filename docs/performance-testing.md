# Performance testing approach

## Service-level objectives for the sample

| Endpoint | Target under smoke load |
|---|---|
| `GET /api/health` | p95 below 100 ms, error rate below 0.1% |
| `GET /api/releases` | p95 below 250 ms, error rate below 1% |
| `GET /api/releases/{id}` | p95 below 250 ms, error rate below 1% |
| Dashboard | Lighthouse desktop performance at least 0.90; CLS at most 0.05 |

These are demonstration budgets, not claims from production traffic.

## Workload models

`performance/k6/smoke.js` runs three virtual users for twenty seconds and validates content as well as status. `load.js` ramps arrival rate to forty iterations per second and uses batched list/detail/integration traffic. The JMeter plan offers a small equivalent for teams already using JMeter.

## Diagnosis

A failed threshold should produce:

1. endpoint, percentile and error-rate breakdown;
2. matching server request counters;
3. CPU/memory/container evidence when applicable;
4. a small packet capture only when network behavior is suspect;
5. a comparison with the same dataset and build.

Warm-up, browser caching, CI runner contention and local antivirus can distort results. Baselines should be compared on the same class of environment.
