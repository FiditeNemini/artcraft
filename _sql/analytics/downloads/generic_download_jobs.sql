-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Summary stats on downloads
select
    distinct download_type,
             count(*) as created
from generic_download_jobs
where created_at > (CURDATE() - INTERVAL 60 DAY)
group by download_type;

-- Find recent failed RVC downloads
select
    token,
    title,
    download_url,
    status
from generic_download_jobs
where download_type = 'rvc_v2'
and status IN ('started', 'attempt_failed')
and created_at > (CURDATE() - INTERVAL 2 DAY);
