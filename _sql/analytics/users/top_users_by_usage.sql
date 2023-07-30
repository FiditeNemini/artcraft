-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

SELECT
    u.username as username,
    j.token as token
FROM users AS u
JOIN tts_inference_jobs AS j
ON u.token = j.maybe_creator_user_token
  AND j.created_at > NOW() - INTERVAL 31 DAY


SELECT
    t.maybe_creator_user_token as user_token,
    u.username,
    count(*) as usage_count,
    u.created_at
FROM tts_results as t
JOIN users as u
ON u.token = t.maybe_creator_user_token
WHERE t.maybe_creator_user_token IS NOT NULL
GROUP BY t.maybe_creator_user_token
ORDER BY usage_count DESC
LIMIT 50000;


SELECT
    v.maybe_creator_user_token as user_token,
    u.username,
    count(*) as usage_count
FROM voice_conversion_results as v
JOIN users as u
ON u.token = v.maybe_creator_user_token
WHERE v.maybe_creator_user_token IS NOT NULL
GROUP BY v.maybe_creator_user_token
ORDER BY usage_count DESC
LIMIT 5000;


SELECT
    w.maybe_creator_user_token as user_token,
    u.username,
    count(*) as usage_count
FROM w2l_results as w
         JOIN users as u
              ON u.token = w.maybe_creator_user_token
WHERE w.maybe_creator_user_token IS NOT NULL
GROUP BY w.maybe_creator_user_token
ORDER BY usage_count DESC
LIMIT 5000;


