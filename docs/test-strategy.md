# Test strategy

## Objective

Provide fast evidence that the release decision is correct, traceable and usable. The highest-risk failures are not cosmetic dashboard defects; they are false **ready** decisions, missing blockers, corrupted evidence and results that cannot be reproduced.

## Quality risks

| Risk | Impact | Primary controls |
|---|---|---|
| Critical defect is ignored | Unsafe release approved | Risk unit tests, BDD examples, API decision tests |
| Score changes unintentionally | Inconsistent governance | Exact-score characterization tests and decision record |
| Evidence totals disagree | Misleading pass rate | Fixture validator, pytest data checks, SQL zero-row assertions |
| Filter or search hides a release | Reviewer misses risk | Repository, Playwright, Cypress and Selenium checks |
| Contract drifts from behavior | Client failures | OpenAPI structural test, Postman and independent Python client |
| Errors cannot be correlated | Slow diagnosis | Request-ID assertions and metrics endpoint |
| Dashboard excludes users | Review blocked | Keyboard semantics, responsive layout, axe and Lighthouse budgets |
| Load causes slow or failed evidence retrieval | Gate review delayed | k6 thresholds, JMeter plan and Prometheus counters |
| Test environment is unreliable | False failures or false confidence | Deterministic fixtures and WireMock scenarios |

## Test layers

### Domain and component

Node's built-in test runner covers score contributions, boundary behavior, state classification, fixture loading, search, filtering and sorting. These tests are the fastest and should block every pull request.

### API and contract

Node integration tests start the real HTTP server on an ephemeral port. Python/Requests tests provide an independent client. Postman/Newman demonstrates a portable team workflow. The OpenAPI document is treated as a contract and checked for required gate fields and unique operation IDs.

### UI and accessibility

Playwright covers primary workflows in Chromium and Firefox. Cypress provides a second automation style and API assertion example. Selenium demonstrates a pytest/WebDriver flow. axe and Lighthouse enforce automated accessibility checks; manual keyboard and screen-reader review still belongs in a release cycle.

### Data

The project validates JSON relationships before tests run. PostgreSQL assets include constraints, reconciliation queries and zero-row data-quality assertions. Tests avoid opaque random data so failed examples remain reproducible.

### Non-functional

- k6 smoke thresholds run on demand or before a significant release.
- JMeter is included for teams that standardize on it.
- ZAP imports the OpenAPI contract before active scanning.
- Semgrep and gitleaks target common test-code and secret-handling mistakes.
- Trivy scans the built container in the extended GitHub workflow.
- Wireshark/tshark notes support network diagnosis rather than routine pass/fail automation.

## Entry and exit

Core entry criteria:

- TypeScript build succeeds.
- Fixtures pass repository validation.
- Target environment health endpoint responds.

Core exit criteria:

- Unit, API, contract and independent Python checks pass.
- No ready release has an open critical/high defect in the evidence store.
- Test execution totals reconcile.
- Required browser/accessibility evidence is present for UI changes.
- Risk waivers have an owner and expiry date.

## Flaky-test policy

A failed test is not automatically retried into a pass. One diagnostic retry may be collected separately. The original failure remains visible, and recurring intermittent cases must have an owner, defect link, last-observed date and removal target. Flaky rate is itself part of the release risk score.
