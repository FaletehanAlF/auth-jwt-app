
SELECT COUNT(*) AS total_lowongan,
  SUM(created_at IS NULL) AS masih_null
FROM jobs;

UPDATE jobs SET created_at = NOW() WHERE created_at IS NULL;

ALTER TABLE jobs
  MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

SELECT COUNT(*) AS total_lowongan,
  SUM(created_at IS NULL) AS masih_null,
  SUM(created_at IS NOT NULL) AS created_at_ada
FROM jobs;

SHOW CREATE TABLE jobs;