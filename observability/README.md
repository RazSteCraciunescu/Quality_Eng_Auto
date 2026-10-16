# Observability

The application exposes `GET /api/health` for service health and `GET /metrics` for Prometheus-compatible telemetry. The metrics include uptime, request counts, releases by readiness status and average release risk.

`prometheus.yml` scrapes the `app` service from the optional Compose observability profile. `alerts.yml` demonstrates service-availability and release-risk alerts. `grafana-dashboard.json` is provisioned automatically and visualizes readiness distribution and average risk.

Request counters use normalized API route labels where identifiers are involved. Before extending the application with user-provided route names or labels, keep cardinality bounded and escape label values.
