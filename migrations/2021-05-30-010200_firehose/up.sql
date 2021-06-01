-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

CREATE TABLE firehose_entries (
    -- Not used for anything except replication.
    id BIGINT(20) NOT NULL AUTO_INCREMENT,

    -- Visible "primary key"
    token VARCHAR(32) NOT NULL,

    -- The type of the event
    -- DO NOT REORDER.
    -- event_type ENUM(
    --    'not-set',
    --    'user_sign_up',
    --    'tts_model_upload_started',
    --    'tts_model_upload_completed',
    --    'tts_inference_started',
    --    'tts_inference_completed',
    --    'w2l_template_upload_started',
    --    'w2l_template_upload_completed',
    --    'w2l_inference_started',
    --    'w2l_inference_completed',
    --    'twitter_mention',
    --    'twitter_retweet',
    --    'discord_join',
    --    'discord_message',
    --    'twitch_subscribe',
    --    'twitch_follow'
    -- ) NOT NULL DEFAULT 'not-set',
    event_type VARCHAR(32) NOT NULL,

    -- The target user
    maybe_target_user_token VARCHAR(32) DEFAULT NULL,

    -- The target "entity", which varies by event type.
    -- eg. a model token or template token
    maybe_target_entity_token VARCHAR(32) DEFAULT NULL,

    -- If something was created, this might be the token (if we know it)
    -- eg. an inference job's token
    maybe_created_entity_token VARCHAR(32) DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- INDICES --
    PRIMARY KEY (id),
    UNIQUE KEY (token),
    KEY fk_maybe_target_user_token (maybe_target_user_token),
    KEY fk_maybe_target_entity_token (maybe_target_entity_token),
    KEY fk_maybe_created_entity_token (maybe_created_entity_token),
    KEY index_event_type (event_type)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
