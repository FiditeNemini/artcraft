-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

--
-- Top 500 models all time by use count
--
select
    m.token,
    m.title,
    m.ietf_language_tag,
    u.username,
    r.use_count,
    m.user_deleted_at,
    m.mod_deleted_at,
    m.created_at
from (
         select model_token, count(*) as use_count
         from tts_results
         group by model_token
     ) as r
         join tts_models as m
              on m.token = r.model_token
         join users as u
              on u.token = m.creator_user_token
order by r.use_count desc
    limit 500;

--
-- Same, but simpler...
--
select m.token, m.title, r.use_count from (
  select model_token, count(*) as use_count from tts_results
  group by model_token
  order by use_count desc limit 500
) as r
  join tts_models as m
  on m.token = r.model_token;

--
-- Top 100 models by use count, last 30 days
--
select m.token, m.title, m.ietf_language_tag, r.use_count from (
    select model_token, count(*) as use_count
    from tts_results
    where created_at > ( CURDATE() - INTERVAL 30 DAY )
    group by model_token
    order by use_count desc
        limit 500
) as r
    join tts_models as m
    on m.token = r.model_token;

--
-- Top 500 models by use count, last 5 days
-- Limited due to tmux scrollback.
--
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

--
-- Top 500 models by use count, last 5 days, not spanish, etc.
-- Limited due to tmux scrollback.
--
select
    m.token,
    m.title,
    m.ietf_language_tag,
    u.username,
    r.use_count,
    m.user_deleted_at,
    m.mod_deleted_at,
    m.created_at
from (
    select model_token, count(*) as use_count
    from tts_results
    where created_at > ( CURDATE() - INTERVAL 5 DAY )
    group by model_token
) as r
    join tts_models as m
    on m.token = r.model_token
    join users as u
    on u.token = m.creator_user_token
    where m.ietf_language_tag NOT IN ('es', 'es-419', 'es-ES', 'es-MX', 'pt-BR')
order by r.use_count desc
    limit 500;

--
-- Top 500 models by use count, last 5 days, in specific language.
-- Limited due to tmux scrollback.
--
select
    m.token,
    m.title,
    m.ietf_language_tag,
    u.username,
    r.use_count,
    m.user_deleted_at,
    m.mod_deleted_at,
    m.created_at
from (
         select model_token, count(*) as use_count
         from tts_results
         where created_at > ( CURDATE() - INTERVAL 5 DAY )
         group by model_token
     ) as r
         join tts_models as m
              on m.token = r.model_token
         join users as u
              on u.token = m.creator_user_token
where m.ietf_language_tag IN ('en', 'en-US', 'en-AU', 'en-CA', 'en-GB')
order by r.use_count desc
    limit 500;

--
-- Most popular voices by use count over 5-day window, single language, single user.
--
select
    m.token,
    m.title,
    m.ietf_language_tag,
    u.username,
    r.use_count,
    m.user_deleted_at,
    m.mod_deleted_at,
    m.created_at
from (
    select model_token, count(*) as use_count
    from tts_results
    where created_at > ( CURDATE() - INTERVAL 5 DAY )
    group by model_token
) as r
    join tts_models as m
    on m.token = r.model_token
    join users as u
    on u.token = m.creator_user_token
    where
        m.ietf_language_tag NOT IN ('es', 'es-419', 'es-ES', 'es-MX', 'pt-BR')
        AND u.username = 'vegito1089'
order by r.use_count desc
    limit 500;

--
-- Most popular deleted models
--
select
    m.token,
    m.title,
    m.ietf_language_tag,
    u.username,
    r.use_count,
    m.user_deleted_at,
    m.mod_deleted_at,
    m.created_at
from (
    select model_token, count(*) as use_count
    from tts_results
    where model_token IN (
        select token
        from tts_models
        where
            user_deleted_at IS NOT NULL
            OR mod_deleted_at IS NOT NULL
    )
    group by model_token
) as r
    join tts_models as m
    on m.token = r.model_token
    join users as u
    on u.token = m.creator_user_token
order by r.use_count desc
    limit 500;

--
-- Most popular deleted models (only by users, not mods)
-- Mod-deleted models were probably on purpose
--
select
    m.token,
    m.title,
    m.ietf_language_tag,
    u.username,
    r.use_count,
    m.user_deleted_at,
    m.created_at
from (
         select model_token, count(*) as use_count
         from tts_results
         where model_token IN (
             select token
             from tts_models
             where
                 user_deleted_at IS NOT NULL
         )
         group by model_token
     ) as r
         join tts_models as m
              on m.token = r.model_token
         join users as u
              on u.token = m.creator_user_token
order by r.use_count desc
    limit 500;


--
-- Models uploaded recently (to check if they use the right text_pipeline_type,
-- vocoder -todo-, etc.)
--
select
    m.token,
    m.title,
    m.text_pipeline_type,
    m.ietf_language_tag,
    u.username,
    r.use_count,
    m.user_deleted_at,
    m.mod_deleted_at,
    m.created_at
from (
         select model_token, count(*) as use_count
         from tts_results
         where created_at > ( CURDATE() - INTERVAL 5 DAY )
         group by model_token
     ) as r
         join tts_models as m
              on m.token = r.model_token
         join users as u
              on u.token = m.creator_user_token
order by m.created_at desc
    limit 500;

