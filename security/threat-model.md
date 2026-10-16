# Lightweight threat model

## Assets

- Release decisions and evidence
- Defect severity and ownership data
- Test execution records
- Integration credentials in a real deployment
- Auditability of gate changes

## Trust boundaries

1. Browser to release-readiness API
2. API to local fixtures or a future persistence layer
3. CI runner to external scanners and artifact storage
4. Enterprise integrations to Jira, Confluence, QMetry, TestRail or Jenkins

## Main abuse cases

| Threat | Example | Current control | Production follow-up |
|---|---|---|---|
| Evidence tampering | Change pass rate to force a ready result | Fixtures are read-only; evaluate endpoint does not persist | Authentication, immutable evidence store, signed build provenance |
| Injection | Malformed search, JSON or XML input | Strict routes, input bounds, output encoding, no dynamic SQL | Schema validation and parser hardening |
| Sensitive-data leakage | Tokens committed with Postman files | No secrets required; gitleaks configuration | Secret manager and pre-receive scanning |
| Missing accountability | Gate changes without a reviewer | Deterministic result and request ID | Identity, approval records and audit events |
| Denial of service | Oversized request body | One-megabyte body limit | Rate limit, reverse proxy and capacity test |
| Supply-chain compromise | Vulnerable base image or test package | Minimal runtime image, Dependabot and Trivy workflow | Pinned digests, SBOM and signature verification |

The local project deliberately has no authentication. It is a portfolio reference system, not a multi-user production service.
