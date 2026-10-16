BEGIN;

CREATE TABLE releases (
  release_id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  version VARCHAR(40) NOT NULL,
  environment VARCHAR(30) NOT NULL,
  target_date DATE NOT NULL,
  owner_team VARCHAR(100) NOT NULL,
  pass_rate DECIMAL(5,2) NOT NULL CHECK (pass_rate BETWEEN 0 AND 100),
  coverage_rate DECIMAL(5,2) NOT NULL CHECK (coverage_rate BETWEEN 0 AND 100),
  flaky_rate DECIMAL(5,2) NOT NULL CHECK (flaky_rate BETWEEN 0 AND 100),
  risk_score DECIMAL(5,2) NOT NULL CHECK (risk_score >= 0),
  gate_status VARCHAR(20) NOT NULL CHECK (gate_status IN ('ready', 'conditional', 'blocked')),
  UNIQUE (name, version, environment)
);

CREATE TABLE test_executions (
  execution_id INTEGER PRIMARY KEY,
  release_id VARCHAR(64) NOT NULL REFERENCES releases(release_id),
  suite_name VARCHAR(120) NOT NULL,
  total_count INTEGER NOT NULL CHECK (total_count >= 0),
  passed_count INTEGER NOT NULL CHECK (passed_count >= 0),
  failed_count INTEGER NOT NULL CHECK (failed_count >= 0),
  skipped_count INTEGER NOT NULL CHECK (skipped_count >= 0),
  started_at TIMESTAMP NOT NULL,
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0),
  CHECK (total_count = passed_count + failed_count + skipped_count)
);

CREATE TABLE defects (
  defect_key VARCHAR(30) PRIMARY KEY,
  release_id VARCHAR(64) NOT NULL REFERENCES releases(release_id),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status VARCHAR(30) NOT NULL,
  summary VARCHAR(250) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  resolved_at TIMESTAMP NULL,
  CHECK (resolved_at IS NULL OR resolved_at >= created_at)
);

CREATE INDEX idx_releases_gate_target ON releases(gate_status, target_date);
CREATE INDEX idx_executions_release ON test_executions(release_id);
CREATE INDEX idx_defects_release_severity ON defects(release_id, severity);

COMMIT;
