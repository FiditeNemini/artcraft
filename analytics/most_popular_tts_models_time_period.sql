-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

select m.token, m.title, r.use_count from (
  select model_token, count(*) as use_count from tts_results
  where created_at < now() - interval 30 day
  group by model_token
  order by use_count desc limit 100
) as r
  join tts_models as m
  on m.token = r.model_token;