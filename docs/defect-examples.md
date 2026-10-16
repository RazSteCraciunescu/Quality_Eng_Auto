# Defect examples

## QLAB-101 — Duplicate capture can occur after provider timeout and retry

**Severity:** Critical  
**Priority:** Immediate  
**Environment:** Cirrus 2.3.1, staging, primary-provider timeout scenario  
**Reproducibility:** 4/5 with a 750–900 ms idempotency-store delay

### Preconditions

- A customer has a valid payment method.
- The primary provider returns after the client timeout.
- The test proxy delays idempotency persistence.

### Steps

1. Send `POST /payments` with a new idempotency key.
2. Allow the client request to time out before the provider response is returned.
3. Retry the same request and key immediately.
4. Query payment audit records and provider captures.

### Actual result

Two provider capture attempts are present. Both carry the same client idempotency key but different provider payment IDs.

### Expected result

The service returns or reconstructs the original result and creates at most one provider capture.

### Impact

A customer may be charged twice. Reconciliation can detect the duplicate later, but that does not remove the immediate financial and trust impact.

### Evidence

- Request IDs: `req-cirrus-1041`, `req-cirrus-1042`
- Test: `API-017 / QM-002`
- Packet symptom: first response arrives after the client timeout; the second request starts before idempotency persistence completes
- Release gate: Cirrus remains blocked

## QLAB-103 — Warehouse route is not recalculated after inventory update

**Severity:** High  
**Environment:** Borealis 5.0.0-rc.2, test

An order is allocated to `WH-01`. Inventory drops below the requested quantity before confirmation, but the order keeps the stale route and fails during fulfilment. Expected behavior is a reroute to the next eligible warehouse with both decisions retained in the audit history.
