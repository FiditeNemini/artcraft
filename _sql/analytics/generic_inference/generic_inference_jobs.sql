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

-- Same, but with usernames
select
    jobs.id,
    jobs.maybe_input_source_token,
    u.username,
    jobs.assigned_worker,
    jobs.assigned_cluster,
    TRUNCATE(jobs.success_execution_millis / 1000 / 60, 2) as execution_minutes,
    jobs.success_execution_millis as execution_millis,
    m.original_duration_millis as duration_millis,
    jobs.success_execution_millis / m.original_duration_millis as ratio
from generic_inference_jobs AS jobs
         left join users AS u on
        u.token = jobs.maybe_creator_user_token
         left join media_uploads AS m on
        m.token = jobs.maybe_input_source_token
where status != 'pending'
and success_execution_millis IS NOT NULL
order by id desc
    limit 50;


-- Get pending so-vits-svc jobs
select count(*)
from generic_inference_jobs
where maybe_model_type = 'so_vits_svc'
  and status='pending';
