# noinspection SqlNoDataSourceInspectionForFile
# noinspection SqlResolveForFile

CREATE TABLE tts_models (
  -- Not used for anything except replication.
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  -- Effective "primary key" (PUBLIC)
  token CHAR(16) NOT NULL UNIQUE,

  -- Optional Pointer to a newer version of the voice
  -- If there's a newer version, we can disable this one.
  updated_model_token CHAR(16) DEFAULT NULL,

  -- We an disable a voice for a variety of reasons
  -- In this case, the original author disables it.
  user_disabled BOOLEAN NOT NULL DEFAULT FALSE,
  -- In this case, a moderator author disables it.
  mod_disabled BOOLEAN NOT NULL DEFAULT FALSE,

  -- A combination of ['username' + 'voice-name']
  -- There can be public aliases for voices, eg. a voice's default model.
  slug CHAR(64) NOT NULL UNIQUE,

  -- NB: DO NOT CHANGE ORDER; APPEND ONLY!
  -- THIS MUST MATCH THE RESPECTIVE JOBS TABLE.
  tts_model_type ENUM(
    'not-set',
    'tacotron2',
    'glowtts',
    'glowtts-vocodes'
  ) NOT NULL DEFAULT 'not-set',

  -- Can be linked to a well-known voice
  voice_token CHAR(16) DEFAULT NULL,

  -- The name of the voice.
  -- If voice_token is set, it's authoritative.
  voice_name VARCHAR(255) NOT NULL,

  -- If the voice is "happy" or a singer "a-capella", etc.
  -- If voice_token is set, it's authoritative.
  voice_characteristic VARCHAR(255) DEFAULT NULL,

  -- The speaker (in the case of cartoon characters)
  -- If voice_token is set, it's authoritative.
  voice_actor_name VARCHAR(255) DEFAULT NULL,

  -- Users can upload their own private models.
  -- They can choose to make them public later.
  is_private_for_creator BOOLEAN NOT NULL DEFAULT FALSE,

  -- The description of the model in markdown.
  description_markdown TEXT NOT NULL,

  -- Generated HTML (not user-editable).
  description_rendered_html TEXT NOT NULL,

  -- The person that created the template.
  creator_user_token CHAR(16) NOT NULL,

  -- For abuse tracking.
  creator_ip_address CHAR(16) NOT NULL,

  -- The filename that was used at upload time.
  original_filename CHAR(255) NOT NULL UNIQUE,

  -- The pytorch model
  -- For now, this will be a hash of the file contents.
  private_bucket_hash CHAR(32) NOT NULL UNIQUE,

  -- For the thumbnail we show.
  public_bucket_hash CHAR(32) NOT NULL UNIQUE,

  -- Calculated average, on a scale of 0-100
  -- Null with zero ratings.
  calculated_average_score INT(3) DEFAULT NULL,
  calculated_score_count INT(10) NOT NULL DEFAULT 0,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- If this is removed by a mod.
  deleted_at TIMESTAMP NULL

) ENGINE=INNODB;

CREATE TABLE w2l_templates (
  -- Not used for anything except replication.
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  -- Effective "primary key" (PUBLIC)
  token CHAR(16) NOT NULL UNIQUE,

  template_type ENUM(
    'not-set',
    'image',
    'video'
  ) NOT NULL DEFAULT 'not-set',

  -- The title of the template.
  title CHAR(255) NOT NULL UNIQUE,

  -- Users can upload their own private templates.
  -- They can choose to make them public later.
  is_private_for_creator BOOLEAN NOT NULL DEFAULT FALSE,

  -- The description of the template in markdown.
  description_markdown TEXT NOT NULL,

  -- Generated HTML (not user-editable).
  description_rendered_html TEXT NOT NULL,

  -- The person that created the template.
  creator_user_token CHAR(16) NOT NULL,

  -- For abuse tracking.
  creator_ip_address CHAR(16) NOT NULL,

  -- The filename that was used at upload time.
  original_filename CHAR(255) NOT NULL UNIQUE,

  -- The original source image/video
  private_bucket_hash_original CHAR(32) NOT NULL UNIQUE,

  -- The "precomputed" faces.
  private_bucket_hash_precomputed CHAR(32) NOT NULL UNIQUE,

  -- For the thumbnail we show.
  public_bucket_hash CHAR(32) NOT NULL UNIQUE,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- If this is removed by a mod.
  deleted_at TIMESTAMP NULL

) ENGINE=INNODB;

CREATE TABLE voices (
  -- Not used for anything except replication.
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  -- Effective "primary key" (PUBLIC)
  token CHAR(16) NOT NULL UNIQUE,

  -- The URL we access the voice at.
  slug CHAR(16) NOT NULL UNIQUE,

  -- We can assign an exemplary model to the voice
  default_model_token CHAR(16) DEFAULT NULL,

  -- If a moderator author disables it.
  -- This should prevent the voice from showing up in lists.
  mod_disabled BOOLEAN NOT NULL DEFAULT FALSE,

  -- The name of the voice
  voice_name VARCHAR(255) NOT NULL,

  -- If the voice is "happy" or a singer "a-capella", etc.
  voice_characteristic VARCHAR(255) DEFAULT NULL,

  -- The speaker (in the case of cartoon characters)
  voice_actor_name VARCHAR(255) DEFAULT NULL,

  -- The 800x600 image
  image_banner_public_bucket_hash CHAR(32) DEFAULT NULL,

  -- The square avatar image
  image_square_public_bucket_hash CHAR(32) DEFAULT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- If this is removed by a mod.
  deleted_at TIMESTAMP NULL

) ENGINE=INNODB;
