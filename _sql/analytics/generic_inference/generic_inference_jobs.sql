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
             jobs.created_at,
             jobs.first_started_at,
             jobs.id,
             jobs.status,
             jobs.attempt_count as attempts,
             trim(replace(replace(jobs.internal_debugging_failure_reason, "\n", ""), "\r", ""))
                 as i_failure_reason,
             -- u.username,
             jobs.assigned_worker,
             jobs.assigned_cluster,
             jobs.maybe_input_source_token,
             jobs.maybe_model_token,
             m.media_source,
             m.maybe_original_mime_type as mime_type,
             TRUNCATE(jobs.success_execution_millis / 1000 / 60, 2) as execution_mins,
             TRUNCATE(jobs.success_inference_execution_millis / 1000 / 60, 2) as inference_mins,
             TRUNCATE((jobs.success_execution_millis - jobs.success_inference_execution_millis) / 1000 / 60, 2) as extra_mins,
             TRUNCATE(m.original_duration_millis / 1000 / 60, 2) as input_mins,
             jobs.success_execution_millis / m.original_duration_millis as ratio
         from generic_inference_jobs AS jobs
                  left join users AS u on
                 u.token = jobs.maybe_creator_user_token
                  left join media_uploads AS m on
                 m.token = jobs.maybe_input_source_token
         where
             jobs.status != 'pending'
        AND jobs.created_at > NOW() - INTERVAL 20 MINUTE
         order by id desc
             limit 5000
     ) as t
order by execution_mins desc;

order by assigned_worker desc, first_started_at asc;

order by first_started_at asc;

order by assigned_worker desc, execution_mins desc;


-- Get pending so-vits-svc jobs
select count(*)
from generic_inference_jobs
where maybe_model_type = 'so_vits_svc'
  and status='pending';


-- Get jobs that have routing tags
select
    id,
    maybe_input_source_token,
    maybe_creator_user_token,
    maybe_routing_tag,
    status
from generic_inference_jobs
where maybe_routing_tag IS NOT NULL
    limit 10;



-- Debug that we're setting the correct metadata on jobs
-- For some reasons storyteller-web is enqueuing the wrong type!
select
    jobs.id,
    jobs.token,
    jobs.maybe_model_type as jobs_model_type,
    jobs.maybe_model_token as jobs_model_token,
    models.token as model_token,
    models.model_type as model_type
from generic_inference_jobs as jobs
left outer join voice_conversion_models as models
on jobs.maybe_model_token = models.token
order by jobs.id
desc
limit 500;

