-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Top TTS model uploaders
select
    u.id,
    u.token,
    u.username,
    u.created_at,
    u.maybe_stripe_customer_id,
    u.maybe_loyalty_program_key,
    m.upload_count
from users as u
join
(
  select
      count(*) as upload_count,
      creator_user_token
  from tts_models
  group by creator_user_token
  order by upload_count desc
) as m
on u.token = m.creator_user_token
where m.upload_count >= 5;



-- Upgrade top TTS model uploaders to a loyalty plan
update users
set maybe_loyalty_program_key = 'fakeyou_contributor'
where token IN (
  select creator_user_token from
    (
      select count(*) as upload_count,
      creator_user_token
      from tts_models
      group by creator_user_token
      having upload_count >= 10
      order by upload_count desc
  ) as t
);


