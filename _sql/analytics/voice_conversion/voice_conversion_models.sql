-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Inventory all
select
    vc.id,
    vc.token,
    vc.model_type,
    vc.title,
    u.username,
    vc.original_download_url,
    vc.created_at,
    vc.updated_at,
    vc.user_deleted_at,
    vc.mod_deleted_at,
    vc.maybe_mod_comments
from voice_conversion_models as vc
left join users AS u on
    u.token = vc.creator_user_token;

-- Inventory non-deleted
select
    vc.id,
    vc.token,
    vc.model_type,
    vc.title,
    u.username,
    vc.original_download_url,
    vc.created_at,
    vc.updated_at
from voice_conversion_models as vc
left join users AS u on
    u.token = vc.creator_user_token
where
    vc.user_deleted_at IS NULL
    and vc.mod_deleted_at IS NULL
order by vc.original_download_url ASC;

--
-- Top 100 voice conversion models by use count
-- (jobs table, not results table)
--
select
    m.token,
    m.title,
    u.username,
    r.use_count,
    m.created_at,
    m.user_deleted_at,
    m.mod_deleted_at
from (
         select maybe_model_token, count(*) as use_count
         from generic_inference_jobs
         where maybe_model_token IS NOT NULL
         group by maybe_model_token
     ) as r
         join voice_conversion_models as m
              on m.token = r.maybe_model_token
         join users as u
              on u.token = m.creator_user_token
order by r.use_count desc
    limit 100;
