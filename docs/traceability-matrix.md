# Traceability matrix

| Requirement | Risk | Automated evidence | Manual / supporting evidence | Defects | Release |
|---|---|---|---|---|---|
| REQ-PAY-104 — idempotent payment retry | Duplicate charge | API-017, E2E-008, QM-001, QM-002 | Provider audit review | QLAB-101 | Cirrus |
| REQ-PAY-109 — provider failover | Lost or ambiguous payment | API-022, CHAOS-003, QM-003 | WireMock timeout scenario | QLAB-102 | Cirrus |
| REQ-PAY-112 — correlation ID | Slow incident diagnosis | API-026, QM-004 | Wireshark/header review | — | Cirrus |
| REQ-ID-201 — token rotation | Session replay | API-041, SEC-012, QM-005, QM-006 | ZAP/security review | — | Aurora |
| REQ-ID-207 — account recovery | User lockout / inaccessible flow | E2E-019, A11Y-006, QM-007 | Keyboard and screen-reader pass | — | Aurora |
| REQ-ID-214 — remembered-device expiry | Stale trusted device | API-045 | Policy review | — | Aurora |
| REQ-ORD-301 — warehouse split | Wrong allocation | API-061, SQL-014, E2E-031, QM-008 | Order-event review | QLAB-103 | Borealis |
| REQ-ORD-306 — tax after cancellation | Incorrect charge | API-066, BDD-009, QM-009 | Regional tax review | — | Borealis |
| REQ-ORD-311 — audit history | Lost accountability | SQL-018, QM-010 | Data-retention review | — | Borealis |

## Traceability rules

- Critical requirements need at least one automated check and one independent evidence source.
- A test ID should identify intent, not a particular script file that may move.
- Defects link to the affected requirement and release decision.
- Waived high-severity defects require an owner, expiry date and rollback trigger.
- Orphan requirements and tests are reported before sign-off.
