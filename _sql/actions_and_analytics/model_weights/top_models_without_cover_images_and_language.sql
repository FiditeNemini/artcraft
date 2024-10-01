
-- Select popular models without streamer usage distorting the totals
select
    mw.token,
    mw.title,
    mw.maybe_ietf_language_tag,
    mw.maybe_cover_image_media_file_token,
    count(*) as use_count
from generic_inference_jobs as gij
left outer join model_weights as mw
    on gij.maybe_model_token = mw.token
where gij.created_at >= (CURDATE() - INTERVAL 5 DAY)
and (
  mw.maybe_ietf_language_tag IS NULL
  or mw.maybe_cover_image_media_file_token IS NULL
)
and mw.mod_deleted_at IS NULL
and mw.user_deleted_at IS NULL
group by
    mw.token,
    mw.title,
    mw.maybe_ietf_language_tag,
    mw.maybe_cover_image_media_file_token
order by use_count desc
limit 100;

