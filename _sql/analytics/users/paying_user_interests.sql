-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- The most popular models amongst paying subscribers.
-- This should give us insight as to which models subscribers pay us for.
SELECT *
FROM (
         SELECT
             t.token,
             t.title,
             count(*) as use_count,
             t.text_pipeline_type,
             t.ietf_language_tag,
             t.created_at,
             t.user_deleted_at,
             t.mod_deleted_at
         FROM
             tts_inference_jobs as j
                 JOIN
             tts_models as t
             ON
                     t.token = j.model_token
         WHERE j.maybe_creator_user_token IN
               (
                   select distinct user_token
                   from user_subscriptions
               )
           AND
                 j.created_at > ( CURDATE() - INTERVAL 1 MONTH )
         GROUP BY t.token
         ORDER BY use_count DESC
     ) as x
     WHERE
        x.use_count > 10;



