# noinspection SqlNoDataSourceInspectionForFile
# noinspection SqlResolveForFile

CREATE TABLE tts_models (
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Effective "primary key" (PUBLIC)
  token VARCHAR(32) NOT NULL,

  -- The person that created the template.
  creator_user_token VARCHAR(32) NOT NULL,

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  creator_ip_address VARCHAR(40) NOT NULL,

  -- We can set as a combination of ['username' + 'voice-name']
  -- There can be public aliases for voices, eg. a voice's default model.
  -- A user can change this.
  -- As such, these should not be foreign keys.
  updatable_slug VARCHAR(64) NOT NULL,

  -- Optional Pointer to a newer version of the voice
  -- If there's a newer version, we can disable this one.
  maybe_updated_model_token VARCHAR(32) DEFAULT NULL,

  -- (THIS MIGHT NOT BE USED)
  -- NB: DO NOT SORT!
  -- THIS MUST MATCH THE RESPECTIVE JOBS TABLE.
  creator_set_visibility ENUM(
      'public',
      'hidden',
      'private'
  ) NOT NULL DEFAULT 'public',

  -- NB: DO NOT CHANGE ORDER; APPEND ONLY!
  -- THIS MUST MATCH THE RESPECTIVE JOBS TABLE.
  tts_model_type ENUM(
    'not-set',
    'tacotron2',
    'glowtts',
    'glowtts-vocodes'
  ) NOT NULL DEFAULT 'not-set',

  -- Can be linked to a well-known voice
  maybe_subject_token VARCHAR(32) DEFAULT NULL,
  maybe_actor_subject_token VARCHAR(32) DEFAULT NULL,

  -- The name of the voice.
  -- If voice_token is set, then it's authoritative instead.
  voice_name VARCHAR(255) NOT NULL,

  -- The speaker (in the case of cartoon characters)
  -- If voice_token is set, it's authoritative.
  voice_actor_name VARCHAR(255) DEFAULT NULL,

  -- If the voice is "happy" or a singer "a-capella", etc.
  voice_characteristic VARCHAR(255) DEFAULT NULL,

  -- Eg. ("poor quality", "trained longer", etc.)
  extra_model_disambiguation VARCHAR(255) DEFAULT NULL,

  -- The description of the model in markdown.
  description_markdown TEXT NOT NULL,

  -- Generated HTML (not user-editable).
  description_rendered_html TEXT NOT NULL,

  -- The filename that was used at upload time.
  original_filename VARCHAR(255) NOT NULL,

  -- The pytorch model
  -- For now, this will be a hash of the file contents.
  -- NB: NOT UNIQUE! We can allow duplicate uploads.
  private_bucket_hash CHAR(32) NOT NULL,

  -- Calculated average, on a scale of 0-100
  -- Null with zero ratings.
  calculated_average_score INT(3) DEFAULT NULL,

  -- Other metrics
  calculated_total_ratings_submitted_count INT(10) NOT NULL DEFAULT 0,
  calculated_total_uses_count BIGINT(10) NOT NULL DEFAULT 0,

  -- In this case, a moderator disables it.
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
  KEY fk_maybe_updated_model_token (maybe_updated_model_token),
  KEY fk_creator_user_token (creator_user_token),
  KEY fk_maybe_mod_user_token (maybe_mod_user_token),
  KEY fk_maybe_subject_token (maybe_subject_token),
  KEY fk_maybe_actor_subject_token (maybe_actor_subject_token),
  KEY index_creator_ip_address (creator_ip_address),
  KEY index_creator_set_visibility (creator_set_visibility),
  KEY index_private_bucket_hash (private_bucket_hash),
  KEY index_is_mod_disabled (is_mod_disabled)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE w2l_templates (
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Effective "primary key" (PUBLIC)
  token VARCHAR(32) NOT NULL,

  -- A combination of ['username' + 'template-name']
  -- There can be public aliases for voices, eg. a voice's default model.
  -- A user can change this.
  -- As such, these should not be foreign keys.
  updatable_slug VARCHAR(64) NOT NULL,

  template_type ENUM(
    'not-set',
    'image',
    'video'
  ) NOT NULL DEFAULT 'not-set',

  -- Can be linked to a well-known voice
  maybe_subject_token VARCHAR(32) DEFAULT NULL,
  maybe_actor_subject_token VARCHAR(32) DEFAULT NULL,

    -- The title of the template.
  title CHAR(255) NOT NULL,

  -- (THIS MIGHT NOT BE USED)
  -- NB: DO NOT SORT!
  -- THIS MUST MATCH THE RESPECTIVE JOBS TABLE.
  creator_set_visibility ENUM(
    'public',
    'hidden',
    'private'
  ) NOT NULL DEFAULT 'public',

  -- The description of the template in markdown.
  description_markdown TEXT NOT NULL,

  -- Generated HTML (not user-editable).
  description_rendered_html TEXT NOT NULL,

  -- The person that created the template.
  creator_user_token VARCHAR(32) NOT NULL,

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  creator_ip_address VARCHAR(40) NOT NULL,

  -- The filename that was used at upload time.
  original_filename CHAR(255) NOT NULL,

  -- The original source image/video and the "precomputed" faces
  private_bucket_hash CHAR(32) NOT NULL,

  -- For the thumbnail we show.
  public_bucket_hash CHAR(32) NOT NULL,

  -- In this case, a moderator disables it.
  is_mod_disabled BOOLEAN NOT NULL DEFAULT FALSE,

  -- If a moderator has comments.
  maybe_mod_comments VARCHAR(255) DEFAULT NULL,

  -- The last moderator that made changes.
  maybe_mod_user_token VARCHAR(32) DEFAULT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- If this is removed by a mod.
  deleted_at TIMESTAMP NULL,

  -- INDICES --
  PRIMARY KEY (id),
  UNIQUE KEY (token),
  UNIQUE KEY (updatable_slug),
  KEY fk_creator_user_token (creator_user_token),
  KEY fk_maybe_mod_user_token (maybe_mod_user_token),
  KEY fk_maybe_subject_token (maybe_subject_token),
  KEY fk_maybe_actor_subject_token (maybe_actor_subject_token),
  KEY index_template_type (template_type),
  KEY index_creator_ip_address (creator_ip_address),
  KEY index_private_bucket_hash (private_bucket_hash),
  KEY index_public_bucket_hash (public_bucket_hash),
  KEY index_creator_set_visibility (creator_set_visibility),
  KEY index_is_mod_disabled (is_mod_disabled)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

