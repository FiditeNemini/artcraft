-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Get a count of pending jobs
select count(*) from w2l_template_upload_jobs where status='pending';

-- See pending download URLs:
select download_url from w2l_template_upload_jobs where status='pending';

-- See old jobs that might be stuck as "started"
select count(*)
from w2l_template_upload_jobs
where status='started'
and created_at < ( CURDATE() - INTERVAL 1 DAY );

-- Unstick old jobs that might be stuck as "started"
update w2l_template_upload_jobs
set status='dead'
where status='started'
  and created_at < ( CURDATE() - INTERVAL 1 DAY );

-- Kill pending jobs with tiktok URLs:
-- These need to be blocked in the server and job directly.
update w2l_template_upload_jobs
set status='dead'
where status='pending'
  and download_url LIKE '%tiktok%';
