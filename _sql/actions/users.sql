-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

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


