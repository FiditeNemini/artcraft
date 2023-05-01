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


-- Detailed report on most recent jobs, ordered by worst performing.
-- TODO: Determine if the problem is in downloading models. Make sure the job timer doesn't include
--   sections where models / files get downloaded.
select *
from (
    select
        jobs.id,
        u.username,
        jobs.assigned_worker,
        jobs.assigned_cluster,
        jobs.maybe_input_source_token,
        m.media_source,
        m.maybe_original_mime_type as mime_type,
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
        limit 50
) as t
order by execution_minutes desc;


-- Get pending so-vits-svc jobs
select count(*)
from generic_inference_jobs
where maybe_model_type = 'so_vits_svc'
  and status='pending';
