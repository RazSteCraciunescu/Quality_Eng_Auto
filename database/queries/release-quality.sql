-- Release overview with execution and open-defect evidence.
SELECT
  r.release_id,
  r.name,
  r.version,
  r.environment,
  r.target_date,
  r.gate_status,
  r.risk_score,
  e.total_count,
  e.passed_count,
  ROUND(100.0 * e.passed_count / NULLIF(e.total_count - e.skipped_count, 0), 2) AS executed_pass_rate,
  SUM(CASE WHEN d.resolved_at IS NULL AND d.severity = 'critical' THEN 1 ELSE 0 END) AS open_critical,
  SUM(CASE WHEN d.resolved_at IS NULL AND d.severity = 'high' THEN 1 ELSE 0 END) AS open_high
FROM releases r
JOIN test_executions e ON e.release_id = r.release_id
LEFT JOIN defects d ON d.release_id = r.release_id
GROUP BY r.release_id, r.name, r.version, r.environment, r.target_date, r.gate_status, r.risk_score,
         e.total_count, e.passed_count, e.skipped_count
ORDER BY r.target_date;

-- Find data that contradicts the declared gate.
SELECT release_id, name, gate_status, pass_rate, risk_score
FROM releases
WHERE (gate_status = 'ready' AND (pass_rate < 95 OR risk_score >= 25))
   OR (gate_status = 'blocked' AND pass_rate >= 80 AND risk_score < 70 AND NOT EXISTS (
        SELECT 1 FROM defects d
        WHERE d.release_id = releases.release_id
          AND d.severity = 'critical'
          AND d.resolved_at IS NULL
      ));
