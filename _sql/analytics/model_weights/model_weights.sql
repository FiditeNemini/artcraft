-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile


-- Inventory non-deleted
select
    m.id,
    m.token,
    SUBSTRING(m.title, 1, 35) as title,
    u.username,
    SUBSTRING(m.original_download_url, 1, 35) as url,
    m.updated_at
from model_weights as m
    left join users AS u on
        u.token = m.creator_user_token
where
    m.user_deleted_at IS NULL
  and m.mod_deleted_at IS NULL
order by m.title asc;

