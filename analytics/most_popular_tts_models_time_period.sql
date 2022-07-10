-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Top 100 models by use count, last 30 days
select m.token, m.title, m.ietf_language_tag, r.use_count from (
    select model_token, count(*) as use_count
    from tts_results
    where created_at > ( CURDATE() - INTERVAL 30 DAY )
    group by model_token
    order by use_count desc
    limit 100
) as r
    join tts_models as m
    on m.token = r.model_token;

-- Most models by use count, last n days
-- Limited due to tmux scrollback.
select m.token, m.title, m.ietf_language_tag, u.username, r.use_count from (
    select model_token, count(*) as use_count
    from tts_results
    where created_at > ( CURDATE() - INTERVAL 5 DAY )
    group by model_token
) as r
    join tts_models as m
    on m.token = r.model_token
    join users as u
    on u.token = m.creator_user_token
    order by r.use_count desc
    limit 500;
