-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Top 100 models by use count, last 30 days
select m.token, m.title, m.ietf_language_tag, r.use_count from (
    select model_token, count(*) as use_count
    from tts_results
    where created_at < now() - interval 30 day
    group by model_token
) as r
    join tts_models as m
    on m.token = r.model_token;

-- All models by use count, last 5 days
select m.token, m.title, m.ietf_language_tag, r.use_count from (
    select model_token, count(*) as use_count
    from tts_results
    where created_at < now() - interval 5 day
    group by model_token
    order by use_count desc limit 100
) as r
    join tts_models as m
    on m.token = r.model_token;
