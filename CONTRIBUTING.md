# Contributing

## Local checks

Before opening a change:

```bash
npm install
npm run build
node scripts/validate-project.mjs
node --test tests/node/*.test.js
pytest -m "not browser"
```

Run the browser, performance or security suites when the change touches those areas.

## Change expectations

- Keep sample data fictional and free of company/customer identifiers.
- Add a test when changing a gate threshold, API response or fixture relationship.
- Do not hide intermittent failures behind unrestricted retries.
- Keep import samples structurally realistic but small enough to review.
- Update the OpenAPI contract and at least one independent client when the API changes.
- Explain risk and rollback in the pull-request template.

Use conventional, readable commit messages; no strict format is enforced.
