BEGIN;

INSERT INTO releases (release_id, name, version, environment, target_date, owner_team, pass_rate, coverage_rate, flaky_rate, risk_score, gate_status) VALUES
  ('cirrus-231', 'Cirrus', '2.3.1', 'staging', '2026-09-01', 'Payments Platform', 72.60, 78.00, 5.10, 94.30, 'blocked'),
  ('aurora-480', 'Aurora', '4.8.0', 'staging', '2026-09-04', 'Identity Experience', 99.00, 91.40, 3.00, 5.40, 'ready'),
  ('borealis-500rc2', 'Borealis', '5.0.0-rc.2', 'test', '2026-09-18', 'Orders Core', 91.50, 78.30, 4.50, 37.40, 'conditional');

INSERT INTO test_executions (execution_id, release_id, suite_name, total_count, passed_count, failed_count, skipped_count, started_at, duration_seconds) VALUES
  (1, 'cirrus-231', 'full-regression', 1000, 726, 251, 23, '2026-08-29 15:00:00', 2841),
  (2, 'aurora-480', 'full-regression', 1000, 990, 7, 3, '2026-08-29 15:10:00', 1980),
  (3, 'borealis-500rc2', 'full-regression', 1000, 915, 70, 15, '2026-08-29 15:20:00', 2422);

INSERT INTO defects (defect_key, release_id, severity, status, summary, created_at, resolved_at) VALUES
  ('QLAB-101', 'cirrus-231', 'critical', 'Open', 'Duplicate capture can occur after provider timeout and retry', '2026-08-24 09:12:00', NULL),
  ('QLAB-102', 'cirrus-231', 'high', 'In Progress', 'Payment failover returns an unhelpful generic error', '2026-08-25 11:30:00', NULL),
  ('QLAB-103', 'borealis-500rc2', 'high', 'Open', 'Warehouse route is not recalculated after inventory update', '2026-08-26 13:45:00', NULL),
  ('QLAB-106', 'aurora-480', 'low', 'Open', 'Recovery helper text wraps early on narrow screens', '2026-08-27 08:03:00', NULL);

COMMIT;
