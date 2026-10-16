# Sample incident review: duplicate payment capture

**Status:** fictional training example  
**Severity:** high customer impact  
**Related release:** Cirrus 2.3.1

## Summary

A client retry overlapped a delayed primary-provider response. The API accepted both attempts before the idempotency result was durable, creating two provider captures for the same intended payment.

## Timeline

- 10:02:14 — first payment request accepted;
- 10:02:18 — client times out;
- 10:02:19 — retry accepted with the same key;
- 10:02:20 — first provider response returns;
- 10:02:21 — second provider capture is created;
- 10:06:43 — reconciliation alert identifies duplicate amount and customer;
- 10:12:00 — payment retries disabled by feature flag.

## Contributing conditions

- Idempotency state was written after the provider call instead of reserving the key first.
- The integration test stub responded either immediately or never; it did not model a late success.
- The client retry window was shorter than the upstream timeout.
- The release gate reported pass rate but did not elevate the known intermittent retry case.

## Corrective actions

| Action | Owner role | Verification |
|---|---|---|
| Reserve idempotency key before provider call | Service engineering | Concurrency API test |
| Store and replay final response atomically | Service engineering | Database and replay tests |
| Add late-success WireMock scenario | Quality engineering | QM-002 / CHAOS-003 |
| Align client and upstream timeout policy | Platform architecture | Configuration contract test |
| Alert on duplicate key with different provider ID | Operations | Synthetic monitor |

## Test escape analysis

The missing case was not simply “retry a payment.” The escape required a late successful upstream response, a client timeout and a persistence race. Future coverage is therefore expressed as a state/timing model rather than as one happy-path retry script.
