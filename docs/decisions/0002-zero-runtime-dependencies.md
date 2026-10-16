# ADR 0002: Keep the local runtime dependency-free

**Status:** accepted

## Context

The portfolio should run after extraction without credentials, a package registry, Docker or a platform-specific installer.

## Decision

Build the service with Node standard-library APIs and commit the compiled `dist/` output. Development and extended test tools remain normal optional packages.

## Consequences

- `node dist/server.js` starts immediately on Node 22.
- The server code is slightly more explicit than an Express implementation.
- Source builds still use TypeScript and `@types/node`.
- Browser, BDD and API-client tools require their normal free installations.
