# Exploratory test charters

## Payments: retry ambiguity

**Mission:** find cases where the client, payment service and provider disagree about whether money moved.  
**Time box:** 90 minutes.  
**Setup:** WireMock primary timeout, secondary success, controllable idempotency store delay.  
**Vary:** duplicate clicks, client timeout, process restart, delayed webhook, clock skew, same key with changed body, concurrent retries.  
**Observe:** provider captures, API status, audit events, correlation IDs and customer-visible messaging.

## Identity: interrupted recovery

**Mission:** evaluate whether a user can safely resume or restart recovery after interruption.  
**Time box:** 60 minutes.  
**Vary:** expired links, two tabs, stale browser history, device change, keyboard-only use, zoom, slow network and repeated code requests.  
**Observe:** session invalidation, rate limits, focus position, error specificity and security logging.

## Orders: inventory race

**Mission:** expose incorrect routing when inventory changes between quote, allocation and confirmation.  
**Time box:** 90 minutes.  
**Vary:** partial stock, equal-distance warehouses, concurrent orders, cancellation, backorder policy, delayed inventory event and duplicate event.  
**Observe:** allocation, tax, shipment count, audit history and customer promise date.

## Release dashboard: evidence trust

**Mission:** find ways a reviewer could reach the wrong decision even when the underlying data is correct.  
**Time box:** 45 minutes.  
**Vary:** filters, search terms, sort order, narrow viewport, stale refresh, browser back/forward, keyboard navigation and API failure.  
**Observe:** hidden releases, ambiguous state, inaccessible detail, stale summary counts and missing error feedback.
