# Security testing approach

The local application has no login or confidential data, but the repository still treats security behavior as testable work.

## Automated coverage

- Security headers are asserted by the core API suite.
- ZAP imports the OpenAPI contract, spiders the dashboard and runs a short active scan.
- Semgrep rules flag empty catches, suspicious bearer tokens and broad swallowed Python exceptions.
- gitleaks uses its default rules with a narrow allowlist for fictional local values.
- Trivy scans the runtime image in the extended workflow.
- The one-megabyte body limit has a defined `413` response.

## Manual review areas

- Path traversal attempts against static files.
- Reflected content from search or fixture values.
- Malformed JSON/XML and content-type confusion.
- Release-decision tampering and missing audit evidence.
- Dependency and container provenance.
- Leakage through logs, reports, packet captures or test-management exports.

The threat model is in `security/threat-model.md`.
