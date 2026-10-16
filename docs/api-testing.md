# API testing notes

## Coverage model

The REST checks are split by intent rather than tool:

- Contract shape and required fields: OpenAPI structural tests.
- Domain behavior: direct risk-model unit tests.
- HTTP integration: Node tests against an ephemeral server.
- Independent client behavior: pytest + Requests.
- Portable team checks: Postman/Newman.
- Compatibility: XML request/response exercised by the SoapUI project.
- Abuse and error behavior: malformed JSON, invalid ranges, unknown IDs, unknown routes and oversized bodies.

## Useful manual requests

```bash
curl http://127.0.0.1:4173/api/releases?status=blocked

curl -X POST http://127.0.0.1:4173/api/releases/cirrus-231/evaluate \
  -H "Content-Type: application/json" \
  -d '{"metrics":{"passRate":99,"coverage":92,"flakyRate":1,"criticalDefects":0,"highDefects":0,"escapedDefects":0}}'

curl -X POST http://127.0.0.1:4173/soap/release-readiness \
  -H "Content-Type: application/xml" \
  -d '<releaseReadinessRequest><releaseId>aurora-480</releaseId></releaseReadinessRequest>'
```

## Assertions that matter

- The gate result is based on returned evidence, not only on HTTP status.
- `X-Request-Id` exists on both successful and failed calls.
- Evaluation does not mutate the stored release fixture.
- Invalid percentages fail validation rather than being silently clamped.
- Search and status filters can be combined without corrupting summary totals.
- XML errors use the documented content type and status.
