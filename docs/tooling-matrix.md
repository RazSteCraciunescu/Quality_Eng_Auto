# Tooling matrix

This index makes the repository reviewable without claiming that every product is connected to a live account.

| Tool or discipline | Repository evidence | Runnable locally |
|---|---|---|
| Jira | `data/integrations/jira/issues.json` | Fixture only |
| Confluence | `data/integrations/confluence/release-readiness-page.md` | Fixture only |
| QMetry | `data/integrations/qmetry/test-cases.csv`, `import-results.junit.xml` | Import-shaped fixture |
| TestRail | `data/integrations/testrail/cases.csv` | Import-shaped fixture |
| Jenkins | `Jenkinsfile`, `data/integrations/jenkins/build-812.json` | With Jenkins or pipeline linter |
| Postman / Newman | `api/postman/` | Yes, with Newman |
| SoapUI | `api/soapui/` and `/soap/release-readiness` | Yes, with SoapUI Open Source |
| Swagger / OpenAPI | `api/openapi.yaml`, `api/openapi.json`, `/api-docs.html` | Yes |
| REST API | `src/server.ts`, `tests/node/server.test.js`, `tests/python/test_api_pytest.py` | Yes |
| TypeScript | `src/`, `tests/e2e/`, `tests/cypress/` | Yes |
| pytest | `tests/python/` | Yes |
| Selenium | `tests/python/test_selenium_dashboard.py` | Yes, with Selenium + Chromium |
| Playwright | `tests/e2e/` | Yes, with Playwright browsers |
| Cypress | `tests/cypress/` | Yes, with Cypress |
| Cucumber / Gherkin | `tests/bdd/` | Yes, with Cucumber.js |
| Accessibility | `tests/e2e/accessibility.spec.ts` | Yes, with Playwright + axe |
| Visual regression | `tests/e2e/visual.spec.ts` and snapshot folder | Yes, with Playwright |
| Lighthouse | `performance/lighthouse/lighthouserc.cjs` | Yes, with Lighthouse CI |
| k6 | `performance/k6/` | Yes, with k6 |
| JMeter | `performance/jmeter/release-readiness.jmx` | Yes, with JMeter |
| SQL | `database/` | Yes, with PostgreSQL or the Compose integration profile |
| Docker | `Dockerfile`, `compose.yaml` | Yes |
| Kubernetes | `infra/kubernetes/` | Yes, against a local or remote cluster |
| Helm | `infra/helm/` | Yes, with Helm |
| WireMock | `api/wiremock/` and Compose integration profile | Yes |
| ZAP | `security/zap/` | Yes, with ZAP or its Docker image |
| Semgrep | `security/semgrep/qa-rules.yml` | Yes, with Semgrep |
| Secret scanning | `security/gitleaks.toml` | Yes, with gitleaks |
| Container scanning | `.github/workflows/extended.yml` | GitHub Actions / Trivy |
| Wireshark / tshark | `wireshark/` | Yes, with capture permissions |
| Prometheus | `/metrics`, `observability/prometheus.yml` | Yes |
| Grafana | `observability/grafana-dashboard.json`, provisioning files | Yes, with Compose profile |
| GitHub Actions | `.github/workflows/` | GitHub-hosted runners |

## Tools not forced into the core path

A senior portfolio can become less credible when every fashionable tool is added as a broken wrapper. The repository therefore does not make cloud test grids, paid reporting portals, commercial security scanners or real Atlassian credentials prerequisites. The supplied formats can be connected later without weakening the local demonstration.
