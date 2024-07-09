-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- u.user_role_slug = 'admin' as is_staff,
-- Users created by studio users in 1 week
select
  u.username,
  count(*) as video_count
from media_files as m
join users as u
on m.maybe_creator_user_token = u.token
where u.can_access_studio = true
and m.created_at > (CURDATE() - INTERVAL 14 DAY)
and m.is_intermediate_system_file = false
and m.media_class = 'video'
group by u.token
order by video_count desc;
