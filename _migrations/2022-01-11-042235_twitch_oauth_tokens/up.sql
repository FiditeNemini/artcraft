-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- **NOTE ABOUT DESIGN**:
--   This table contains _many_ OAuth tokens for any single user. (many users : many tokens)
--   An entire history of tokens is kept in the table.

CREATE TABLE twitch_oauth_tokens(
  -- Not used for anything except replication.
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,

  -- ========== STORYTELLER/FAKEYOU USER ==========

  -- Foreign key to user (Storyteller/FakeYou user)
  -- If no user is associated (anonymous Twitch user), then this is null.
  maybe_user_token VARCHAR(32) DEFAULT NULL,

  -- ========== TWITCH USER ==========

  -- The user ID / channel ID are the same
  -- https://discuss.dev.twitch.tv/t/what-is-the-difference-between-the-stream--id-and-channel--id/4423
  -- Several suggest this should be a string and not an integer
  -- https://discuss.dev.twitch.tv/t/type-of-user-id-in-api-responses/10205
  -- Yep, strings
  -- https://discuss.dev.twitch.tv/t/bug-v5-api-returns--id-as-string-for-featured-channels/10310
  twitch_user_id VARCHAR(64) NOT NULL,

  -- Usernames are between 4 and 25 characters.
  -- This is returned in the oauth flow
  twitch_username VARCHAR(32) NOT NULL,

  -- ========== OAUTH TOKEN DETAILS ==========

  -- The ever important OAuth access token.
  access_token VARCHAR(128) NOT NULL,

  -- If we can refresh the token, this is the thing to use.
  maybe_refresh_token VARCHAR(128) DEFAULT NULL,

  -- Should be "bearer". Included in the OAuth redemption.
  token_type VARCHAR(32) DEFAULT NULL,

  -- When the token expires from time of first grant.
  -- (We don't update this field.)
  -- Null if it does not expire or we were not informed
  expires_in_seconds INT(10) UNSIGNED DEFAULT NULL,

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

  -- ========== SECURITY ==========

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  ip_address_creation VARCHAR(40) DEFAULT NULL,

  -- ========== VECTOR CLOCK ==========

  -- Incremented with every update.
  version INT UNSIGNED NOT NULL DEFAULT 0,

  -- ========== TIMESTAMPS ==========

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- This is when the OAuth token will expire.
  -- While we need to refresh before this time, Twitch recommends against eager
  -- refreshes and instead wants the code to lazily refresh.
  -- This also has no bearing on the "refresh_token".
  -- We'll just use this for bookkeeping.
  expires_at TIMESTAMP DEFAULT NULL,

  -- If the OAuth token is deleted, we set this.
  -- We'll need to set it for all of a user's OAuth tokens since this table stores many tokens.
  user_deleted_at TIMESTAMP NULL,
  mod_deleted_at TIMESTAMP NULL,

  -- INDICES --
  PRIMARY KEY (id),
  KEY fk_maybe_user_token (maybe_user_token),
  KEY index_twitch_user_id (twitch_user_id),
  KEY index_twitch_username (twitch_username),
  KEY index_expires_at (expires_at),
  KEY index_user_deleted_at (user_deleted_at),
  KEY index_mod_deleted_at (mod_deleted_at)

  -- KEY index_has_bits_read (has_bits_read),
  -- KEY index_creator_ip_address (creator_ip_address)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

