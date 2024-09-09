
-- Total usage
select
  count(*) as use_count
from generic_inference_jobs as gij
where gij.product_category = 'vid_face_fusion'
  and gij.created_at >= (CURDATE() - INTERVAL 5 DAY)

-- Usage by user
select
  u.token,
  u.username,
  count(*) as use_count
from generic_inference_jobs as gij
left outer join users as u
on u.token = gij.maybe_creator_user_token
where gij.product_category = 'vid_face_fusion'
  and gij.created_at >= (CURDATE() - INTERVAL 5 DAY)
group by u.token, u.username
order by use_count desc
