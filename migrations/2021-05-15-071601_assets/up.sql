# noinspection SqlNoDataSourceInspectionForFile
# noinspection SqlResolveForFile

CREATE TABLE tts_models (
  -- Not used for anything except replication.
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  -- Effective "primary key" (PUBLIC)
  token CHAR(16) NOT NULL UNIQUE,

  -- NB: DO NOT SORT!
  -- THIS MUST MATCH THE RESPECTIVE JOBS TABLE.
  tts_model_type ENUM(
    'not-set',
    'tacotron2',
    'glowtts',
    'glowtts-vocodes'
  ) NOT NULL DEFAULT 'not-set',

  -- The title of the template.
  title CHAR(255) NOT NULL UNIQUE,

  -- Users can upload their own private templates.
  -- They can choose to make them public later.
  is_private_for_creator BOOLEAN NOT NULL DEFAULT FALSE,

  -- The description of the template.
  description CHAR(512) NOT NULL UNIQUE,

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

  -- If this is removed.
  deleted_at TIMESTAMP DEFAULT NULL

) ENGINE=INNODB;

CREATE TABLE w2l_templates (
  -- Not used for anything except replication.
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  -- Effective "primary key" (PUBLIC)
  token CHAR(16) NOT NULL UNIQUE,

  template_type ENUM(
    'image',
    'video'
  ) NOT NULL,

  -- The title of the template.
  title CHAR(255) NOT NULL UNIQUE,

  -- Users can upload their own private templates.
  -- They can choose to make them public later.
  is_private_for_creator BOOLEAN NOT NULL DEFAULT FALSE,

  -- The description of the template.
  description CHAR(512) NOT NULL UNIQUE,

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

  -- If this is removed.
  deleted_at TIMESTAMP DEFAULT NULL

) ENGINE=INNODB;

