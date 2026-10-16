-- Each query should return zero rows. They can be executed in PostgreSQL, DBeaver or a CI database job.

-- DQ-01: test execution counts must reconcile.
SELECT execution_id
FROM test_executions
WHERE total_count <> passed_count + failed_count + skipped_count;

-- DQ-02: no release may have an impossible percentage.
SELECT release_id
FROM releases
WHERE pass_rate NOT BETWEEN 0 AND 100
   OR coverage_rate NOT BETWEEN 0 AND 100
   OR flaky_rate NOT BETWEEN 0 AND 100;

-- DQ-03: ready releases cannot have open critical or high defects.
SELECT DISTINCT r.release_id
FROM releases r
JOIN defects d ON d.release_id = r.release_id
WHERE r.gate_status = 'ready'
  AND d.resolved_at IS NULL
  AND d.severity IN ('critical', 'high');

-- DQ-04: target identifiers must remain unique by product/version/environment.
SELECT name, version, environment, COUNT(*) AS duplicate_count
FROM releases
GROUP BY name, version, environment
HAVING COUNT(*) > 1;

-- DQ-05: defect resolution cannot pre-date defect creation.
SELECT defect_key
FROM defects
WHERE resolved_at IS NOT NULL AND resolved_at < created_at;
