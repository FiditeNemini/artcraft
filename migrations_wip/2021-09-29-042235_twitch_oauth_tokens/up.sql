-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- **NOTE ABOUT DESIGN**:
--   This table contains _many_ OAuth tokens for any single user. (many users : many tokens)
--   An entire history of tokens is kept in the table.

CREATE TABLE twitch_oauth_tokens(
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Foreign key to user (Vocodes/Storyteller user)
  -- If no user is associated (anonymous Twitch user), then this is null.
  maybe_user_token VARCHAR(32) DEFAULT NULL,

  -- The user ID / channel ID are the same
  -- https://discuss.dev.twitch.tv/t/what-is-the-difference-between-the-stream--id-and-channel--id/4423
  maybe_twitch_user_id VARCHAR(32) DEFAULT NULL,

  -- Usernames are between 4 and 25 characters.
  maybe_twitch_username VARCHAR(32) DEFAULT NULL,

  -- ========== OAUTH SCOPES ==========

  -- "bits:read"
  -- "View Bits information for a channel."
  has_bits_read BOOLEAN NOT NULL DEFAULT FALSE,

  -- "channel:read:subscriptions"
  -- "View a list of all subscribers to a channel and check if a user is subscribed to a channel."
  -- eg. Enumerate list of subscribers for a channel
  -- eg. PubSub subscribe to `channel-subscribe-events-v1.<channel ID>` (subscribe, resubscribe, gift)
  has_channel_read_subscriptions BOOLEAN NOT NULL DEFAULT FALSE,

  -- "channel:read:redemptions"
  -- "View Channel Points custom rewards and their redemptions on a channel."
  -- eg. PubSub subscribe to `channel-points-channel-v1.<channel_id>` (channel points spends)
  has_channel_read_redemptions BOOLEAN NOT NULL DEFAULT FALSE,

  -- "user:read:follows"
  -- "View the list of channels a user follows."
  -- eg. We can use this to see if a Twitch user follows us.
  has_user_read_follows BOOLEAN NOT NULL DEFAULT FALSE,


  -- THERE ARE MORE SCOPES... PERHAPS WE SHOULD ADD THEM?

  -- ========== VECTOR CLOCK ==========

  -- Incremented with every update.
  version INT NOT NULL DEFAULT 0,

  -- ========== TIMESTAMPS ==========

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- This is when the OAuth token will expire. We need to refresh before this time.
  expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- If the OAuth token is deleted, we set this.
  -- We'll need to set it for all of a user's OAuth tokens since this table stores many tokens.
  user_deleted_at TIMESTAMP NULL,
  mod_deleted_at TIMESTAMP NULL,

  -- INDICES --
  PRIMARY KEY (id),
  KEY fk_maybe_user_token (maybe_user_token)

  --KEY index_has_bits_read (has_bits_read),
  --KEY index_creator_ip_address (creator_ip_address)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

