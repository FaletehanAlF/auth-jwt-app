
SELECT job_id, jobseeker_id, COUNT(*) AS jumlah
FROM applications
GROUP BY job_id, jobseeker_id
HAVING COUNT(*) > 1;

ALTER TABLE applications
  ADD COLUMN status ENUM('pending','reviewed','interview','accepted','rejected')
  NOT NULL DEFAULT 'pending';


UPDATE applications SET status = 'pending' WHERE status IS NULL;

ALTER TABLE applications
  ADD UNIQUE KEY uniq_job_jobseeker (job_id, jobseeker_id);
