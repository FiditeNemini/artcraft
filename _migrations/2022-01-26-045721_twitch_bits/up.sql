-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- This is primarily meant to be for analysis.
CREATE TABLE twitch_bits_events(
  -- Not used for anything except replication.
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,

  -- ========== STORYTELLER/FAKEYOU USER ==========

  -- The user ID / channel ID are the same
  -- https://discuss.dev.twitch.tv/t/what-is-the-difference-between-the-stream--id-and-channel--id/4423
  -- Several suggest this should be a string and not an integer
  -- https://discuss.dev.twitch.tv/t/type-of-user-id-in-api-responses/10205
  -- Yep, strings
  -- https://discuss.dev.twitch.tv/t/bug-v5-api-returns--id-as-string-for-featured-channels/10310
  sender_twitch_user_id VARCHAR(64) NOT NULL,

  -- Twitch usernames are between 4 and 25 characters.
  -- This is returned in the oauth flow
  sender_twitch_username VARCHAR(32) NOT NULL,

  -- Twitch username, but lowercase for lookup.
  sender_twitch_username_lowercase VARCHAR(32) NOT NULL,

  -- INDICES --
  PRIMARY KEY (id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
