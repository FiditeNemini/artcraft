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
    and vc.mod_deleted_at IS NULL;
