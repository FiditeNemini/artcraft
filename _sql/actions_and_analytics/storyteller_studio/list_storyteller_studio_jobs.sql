-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

select *
from generic_inference_jobs
where job_type = 'comfy_ui'
and status NOT IN (
  'pending',
  'started',
  'complete_success'
)
order by id desc
limit 5\G

