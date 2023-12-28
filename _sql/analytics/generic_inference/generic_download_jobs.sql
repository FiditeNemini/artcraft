-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

select
    distinct download_type,
             count(*) as created
from generic_download_jobs
where created_at > (CURDATE() - INTERVAL 60 DAY)
group by download_type;
