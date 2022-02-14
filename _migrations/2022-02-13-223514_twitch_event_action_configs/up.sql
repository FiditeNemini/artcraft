-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Multiple rows per user
CREATE TABLE twitch_event_action_rules(
  -- Not used for anything except replication.
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,

  -- Effective "primary key" (PUBLIC)
  token VARCHAR(32) NOT NULL,

  -- Foreign key to user
  -- This is a FakeYou/Storyteller account, *NOT* a twitch user id.
  user_token VARCHAR(32) NOT NULL,

  -- The user can rearrange the rules in the UI.
  -- This will be the order they apply in if matched.
  -- NB: There is nothing in MySQL to guarantee unique ordering.
  user_specified_rule_order INT(10) UNSIGNED NOT NULL DEFAULT 0,

    -- What type of event we'll be responding to.
  event_category ENUM(
      'bits',
      'channel_points',
      'chat_command'
  ) NOT NULL,

  -- Whether or not the rule is enabled.
  rule_is_enabled BOOLEAN NOT NULL DEFAULT FALSE,

  -- A JSON payload containing any predicates we wish to apply to the match.
  -- eg. bits_value > 100
  -- eg. channel_points_award_name == "Mario Voice"
  event_match_predicate MEDIUMTEXT NOT NULL,

  -- A JSON payload containing how we wish to respond to the event.
  -- eg. tts M:model
  event_response MEDIUMTEXT NOT NULL,

  -- INDICES --
  PRIMARY KEY (id),
  UNIQUE KEY (token),
  KEY fk_user_token (user_token),
  KEY index_event_category (event_category)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
