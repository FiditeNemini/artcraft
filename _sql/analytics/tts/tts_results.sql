-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

--
-- Usage count in the past 24 hours
--
select count(*) as use_count
from tts_results
where created_at > ( CURDATE() - INTERVAL 1 DAY )

--
-- Usage count in the past week
--
select count(*) as use_count
from tts_results
where created_at > ( CURDATE() - INTERVAL 7 DAY )

-- On-prem worker mix
select count(*) as use_count
from tts_results
where created_at > ( CURDATE() - INTERVAL 1 MINUTE )
and is_generated_on_prem IS TRUE

-- Calculate a percentage of on-prem worker capacity
select count(*) as on_prem_count
from (
  select is_generated_on_prem
  from tts_results
  order by id desc limit 1000
) as sample
where sample.is_generated_on_prem IS TRUE;


-- Find TTS results for a single model
select count(*) from tts_results
where model_token = 'TM:ztt5s1be5tq6';

-- Find TTS results for a single model that are not deleted
select count(*) from tts_results
where model_token = 'TM:ztt5s1be5tq6'
and mod_deleted_at is NULL;

-- Sample results for a single model
select
    TRIM(REPLACE(SUBSTRING(raw_inference_text, 1, 50), '\n', ''))
from tts_results
where model_token='TM:yt4gfbkngsjj'
order by id desc
limit 150;

-- Search for results by eminem
select
    token,
    created_at,
    raw_inference_text
from  tts_results
where
    model_token IN ('TM:27fj0gsh11pd', 'TM:8h9bfjgabeer', 'TM:pdf9c1anbdjq')
    AND raw_inference_text LIKE "%rave%"
  AND raw_inference_text LIKE "%sound%"
  AND created_at > ( CURDATE() - INTERVAL 5 MONTH )
ORDER BY created_at DESC



-- Delete TTS results for a single model
-- Do this in short batches so a lock isn't held for prohibitively long.
update tts_results
set mod_deleted_at = NOW()
where model_token = 'TM:ztt5s1be5tq6'
and mod_deleted_at IS NULL
limit 5000;

