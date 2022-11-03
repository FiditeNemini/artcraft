-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Kill pending jobs
update tts_inference_jobs set status = 'dead' where status = 'pending';

-- Total pending jobs
select count(*)
from tts_inference_jobs
where status = 'pending';

-- Total pending API jobs
select count(*)
from tts_inference_jobs
where status = 'pending'
and is_from_api = true;

-- Top IP addresses making requests
select distinct creator_ip_address, count(*) as attempts
from tts_inference_jobs
where status = 'pending'
group by creator_ip_address
order by attempts desc
limit 50;

-- Top voices in requests
select distinct model_token, count(*) as attempts
from tts_inference_jobs
where status = 'pending'
group by model_token
order by attempts desc
    limit 50;


-- Kill pending jobs
update tts_inference_jobs
set status = 'dead'
where status = 'pending';

-- Kill all waiting and in-progress jobs
update tts_inference_jobs
set status = 'dead'
where status IN ('pending', 'started', 'attempt_failed');

-- Sample the pending inference text
select creator_ip_address,
       model_token,
       maybe_creator_user_token,
       raw_inference_text
from tts_inference_jobs
where status = 'pending';

-- Sample the pending inference text (truncated)
select creator_ip_address,
       model_token,
       maybe_creator_user_token,
       TRIM(REPLACE(SUBSTRING(raw_inference_text, 1, 50), '\n', ''))
from tts_inference_jobs
where status = 'pending'
limit 100;

-- Sample long pending texts
select creator_ip_address,
       model_token,
       maybe_creator_user_token,
       raw_inference_text
from tts_inference_jobs
where status = 'pending'
and length(raw_inference_text) > 100
limit 100;

-- Delete old TTS inference jobs (1)
DELETE FROM tts_inference_jobs
WHERE status IN ('dead', 'complete_success', 'complete_failure')
LIMIT 100000;

-- Delete old TTS inference jobs (2)
-- Roughly 20 seconds to delete 100k,
DELETE FROM tts_inference_jobs
WHERE created_at < ( CURDATE() - INTERVAL 1 DAY )
LIMIT 1000000;
