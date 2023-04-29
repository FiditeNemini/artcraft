-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- See how long recent jobs are taking
select
    id,
    maybe_input_source_token,
    assigned_worker,
    assigned_cluster,
    success_execution_millis / 1000 / 60 as minutes
from generic_inference_jobs
where status != 'pending'
and success_execution_millis IS NOT NULL
order by id desc
limit 50;
