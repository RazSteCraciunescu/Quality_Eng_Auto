# Release readiness workspace

This file is an offline stand-in for five linked Confluence records. It gives the sample releases enough governance context to exercise search, traceability and evidence-review workflows without an Atlassian account.

## Record 1 — Release policy

A release is **blocked** when a critical defect is open, the pass rate is below 80%, or the calculated risk score is 70 or higher. A release is **conditional** when one or more high-severity defects remain, the pass rate is below 95%, coverage is below 85%, or the risk score is at least 25.

## Record 2 — Cirrus 2.3.1 decision

**Decision:** blocked  
**Owner:** Payments Platform  
**Reason:** one critical duplicate-capture defect and unstable failover coverage.  
**Next review:** after QLAB-101 is fixed and the provider-timeout suite has three clean runs.

## Record 3 — Aurora 4.8.0 decision

**Decision:** ready  
**Owner:** Identity Experience  
**Evidence:** API rotation tests, cross-browser account-recovery checks, ZAP baseline and accessibility scan.  
**Residual risk:** low-severity copy and spacing defects only.

## Record 4 — Borealis 5.0.0-rc.2 decision

**Decision:** conditional  
**Owner:** Orders Core  
**Conditions:** named waiver owners, warehouse-routing regression before GA, and coverage above 85% for routing rules.

## Record 5 — Sign-off record

| Function | Reviewer | Cirrus | Aurora | Borealis |
|---|---|---:|---:|---:|
| Engineering | Platform lead | Hold | Approved | Conditional |
| Quality | QA lead | Hold | Approved | Conditional |
| Security | Security partner | Not required | Approved | Not required |
| Product | Product owner | Hold | Approved | Conditional |

All names, releases and decisions in this repository are fictional.
