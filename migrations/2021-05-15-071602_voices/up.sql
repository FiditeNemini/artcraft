# noinspection SqlNoDataSourceInspectionForFile
# noinspection SqlResolveForFile

-- These can be people, cartoon characters, fictional characters, etc.
-- Subjects may be "played" by different entities.
CREATE TABLE subjects (
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Effective "primary key" (PUBLIC)
  token VARCHAR(32) NOT NULL,

  -- The name of the subject
  -- Might have parens to disambiguate, eg. "JFK (Clone High)"
  subject_name VARCHAR(255) NOT NULL,

  -- The URL we access the voice at.
  -- These should be stable, but could be changed if necessary.
  -- As such, these should not be foreign keys.
  updatable_slug VARCHAR(64) NOT NULL,

  -- The type of subject
  -- For eg. "JFK (Clone High)", that would be a separate subject.
  type ENUM(
    'not-set',
    'real-person',
    'fictional-character'
  ) NOT NULL DEFAULT 'not-set',

  -- The description of the model in markdown.
  description_markdown TEXT NOT NULL,

  -- Generated HTML (not user-editable).
  description_rendered_html TEXT NOT NULL,

  -- The person that created the template.
  creator_user_token VARCHAR(32) NOT NULL,

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  creator_ip_address VARCHAR(40) NOT NULL,

  -- The person that created the template.
  -- More than just mods may update.
  maybe_updater_user_token VARCHAR(32) NOT NULL,

  -- More than just mods may update.
  -- For abuse tracking.
  -- Wide enough for IPv4/6
  maybe_updater_ip_address VARCHAR(40) NOT NULL,

  -- We can assign an exemplary model to the subject
  maybe_default_tts_model_token VARCHAR(32) DEFAULT NULL,
  maybe_default_w2l_template_token VARCHAR(32) DEFAULT NULL,

  -- The 800x600 image
  maybe_image_banner_public_bucket_hash CHAR(32) DEFAULT NULL,

  -- The square avatar image
  maybe_image_square_public_bucket_hash CHAR(32) DEFAULT NULL,

  -- If a moderator author disables it.
  -- This should prevent the voice from showing up in lists.
  -- Eg. if someone creates "Hitler", we'd want to prevent it from showing up.
  is_mod_disabled BOOLEAN NOT NULL DEFAULT FALSE,

  -- If a moderator has comments.
  maybe_mod_comments VARCHAR(255) DEFAULT NULL,
  -- The last moderator that made changes.
  maybe_mod_user_token VARCHAR(32) DEFAULT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- If this is removed by a mod.
  -- It completely disappears from the system.
  deleted_at TIMESTAMP NULL,

  -- INDICES --
  PRIMARY KEY (id),
  UNIQUE KEY (token),
  UNIQUE KEY (updatable_slug),
  KEY fk_creator_user_token (creator_user_token),
  KEY fk_maybe_updater_user_token (maybe_updater_user_token),
  KEY fk_maybe_default_tts_model_token (maybe_default_tts_model_token),
  KEY fk_maybe_default_w2l_template_token (maybe_default_w2l_template_token),
  KEY fk_maybe_mod_user_token (maybe_mod_user_token),
  KEY index_type (type),
  KEY index_creator_ip_address (creator_ip_address),
  KEY index_maybe_updater_ip_address (maybe_updater_ip_address),
  KEY index_is_mod_disabled (is_mod_disabled)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- CREATE TABLE voices (
--   -- Not used for anything except replication.
--   id BIGINT(20) NOT NULL AUTO_INCREMENT,
-- 
--   -- Effective "primary key" (PUBLIC)
--   token VARCHAR(32) NOT NULL,
-- 
--   -- The URL we access the voice at.
--   -- These should be stable, but could be changed if necessary.
--   -- As such, these should not be foreign keys.
--   updatable_slug VARCHAR(64) NOT NULL,
-- 
--   -- We can assign an exemplary model to the voice
--   default_model_token VARCHAR(32) DEFAULT NULL,
-- 
--   -- If a moderator author disables it.
--   -- This should prevent the voice from showing up in lists.
--   mod_disabled BOOLEAN NOT NULL DEFAULT FALSE,
-- 
--   -- The name of the voice
--   voice_name VARCHAR(255) NOT NULL,
-- 
--   -- If the voice is "happy" or a singer "a-capella", etc.
--   voice_characteristic VARCHAR(255) DEFAULT NULL,
-- 
--   -- The speaker (in the case of cartoon characters)
--   voice_actor_name VARCHAR(255) DEFAULT NULL,
-- 
--   -- The 800x600 image
--   image_banner_public_bucket_hash CHAR(32) DEFAULT NULL,
-- 
--   -- The square avatar image
--   image_square_public_bucket_hash CHAR(32) DEFAULT NULL,
-- 
--   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
-- 
--   -- If this is removed by a mod.
--   deleted_at TIMESTAMP NULL,
-- 
--   -- INDICES --
--   PRIMARY KEY (id),
--   UNIQUE KEY (token),
--   UNIQUE KEY (updatable_slug)
-- 
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
