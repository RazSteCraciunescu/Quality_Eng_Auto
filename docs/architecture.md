# Architecture

## Context

Release Readiness Lab collects test and defect evidence, calculates a repeatable risk score, and presents a release decision. In this repository the evidence is local JSON. In a production implementation, adapters would pull signed or authenticated records from test management, CI, defect tracking and observability systems.

```text
Browser / API clients / CI
            |
            v
  Node HTTP service (no runtime packages)
   |        |         |          |
   |        |         |          +--> Prometheus text metrics
   |        |         +-------------> XML compatibility endpoint
   |        +-----------------------> deterministic risk service
   +--------------------------------> read-only JSON fixtures
```

## Components

### HTTP service

`src/server.ts` owns routing, bounded request-body parsing, response headers, static-file delivery and Prometheus counters. It intentionally uses the Node standard library so the checked-in build starts without an install step.

### Domain model

`src/risk.ts` calculates bounded contributions from failed tests, defect severity, flakiness, coverage gaps and escaped defects. Gate status is derived from explicit policy thresholds rather than from the score alone.

### Repository

`src/repository.ts` loads releases and integration metadata, evaluates each release and applies search, filter and sort behavior. Data remains read-only; the evaluation endpoint tests alternative metrics without changing the fixture.

### Dashboard

The static UI is built from semantic HTML, CSS and small browser-side JavaScript. It supports search, status filters, sorting and an evidence dialog. There is no frontend framework to obscure the behavior being tested.

## Quality attributes

| Attribute | Design response |
|---|---|
| Portability | Standard Node runtime; no runtime packages; Docker is optional |
| Testability | Deterministic data, stable IDs, API contract and separate domain functions |
| Observability | Request IDs, health endpoint, Prometheus counters, sample Grafana dashboard |
| Security | Output encoding, request-size bound, security headers, no secrets or persistence |
| Accessibility | Semantic controls, keyboard focus, dialog labels, live regions and axe test |
| Maintainability | Typed domain/repository layer, precompiled output, focused fixtures and docs |

## Known production gaps

Authentication, authorization, immutable audit storage, concurrency controls, real integration retries, distributed tracing, rate limiting, persistence migrations and multi-tenant data isolation are intentionally outside this local reference implementation. They are documented rather than simulated badly.
