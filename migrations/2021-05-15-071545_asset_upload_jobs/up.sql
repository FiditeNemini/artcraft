# noinspection SqlNoDataSourceInspectionForFile
# noinspection SqlResolveForFile

-- TTS MODELS
CREATE TABLE tts_model_upload_jobs (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Foreign key to user
  creator_user_token CHAR(16) NOT NULL,

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  creator_ip_address VARCHAR(40) NOT NULL,

  -- Users can upload their own private models.
  -- They can choose to make them public later.
  is_private_for_creator BOOLEAN NOT NULL DEFAULT FALSE,

  -- The name of the voice
  voice_name VARCHAR(255) NOT NULL,

  -- The speaker (in the case of cartoon characters)
  voice_actor_name VARCHAR(255) DEFAULT NULL,

  -- Jobs begin as "pending", then transition to other states.
  -- Pending -> Started -> Complete
  --                    \-> Failed -> Started -> { Complete, Failed, Dead }
  status ENUM('pending', 'started', 'complete', 'failed', 'dead') NOT NULL DEFAULT 'pending',

  -- We can track this against a "max_attempt_count"
  attempt_count INT(3) NOT NULL DEFAULT 0,

  -- NB: DO NOT CHANGE ORDER; APPEND ONLY!
  -- THIS MUST MATCH THE RESPECTIVE JOBS TABLE.
  tts_model_type ENUM(
    'not-set',
    'tacotron2',
    'glowtts',
    'glowtts-vocodes'
  ) NOT NULL DEFAULT 'not-set',

  -- If we need to download the file from Google Drive.
  google_drive_url VARCHAR(512) DEFAULT NULL,

  -- If there is a failure, tell the user why.
  failure_reason VARCHAR(512) DEFAULT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Failed jobs will set a next attempt time.
  -- Subsequent tries can increase the timeout.
  -- Failures because of permissions require human intervention => [retry_at=null].
  -- Failures because of invalid files are dead => [status=dead].
  retry_at TIMESTAMP NULL,

  -- INDICES --
  PRIMARY KEY (id),
  KEY fk_creator_user_token (creator_user_token),
  KEY index_status (status),
  KEY index_creator_ip_address (creator_ip_address)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- WAV2LIP TEMPLATES
CREATE TABLE w2l_template_upload_jobs (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Foreign key to user
  creator_user_token CHAR(16) NOT NULL,

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  creator_ip_address VARCHAR(40) NOT NULL,

  -- Users can upload their own private templates.
  -- They can choose to make them public later.
  is_private_for_creator BOOLEAN NOT NULL DEFAULT FALSE,

  -- Jobs begin as "pending", then transition to other states.
  -- Pending -> Started -> Complete
  --                    \-> Failed -> Started -> { Complete, Failed, Dead }
  status ENUM('pending', 'started', 'complete', 'failed', 'dead') NOT NULL DEFAULT 'pending',

  -- We can track this against a "max_attempt_count"
  attempt_count INT(3) NOT NULL DEFAULT 0,

  -- NB: DO NOT SORT!
  -- THIS MUST MATCH THE RESPECTIVE JOBS TABLE.
  template_type ENUM(
    'video',
    'image'
  ) NOT NULL,

  -- If we need to download the file from Google Drive.
  google_drive_url VARCHAR(512) DEFAULT NULL,

  -- If there is a failure, tell the user why.
  failure_reason VARCHAR(512) DEFAULT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Failed jobs will set a next attempt time.
  -- Subsequent tries can increase the timeout.
  -- Failures because of permissions require human intervention => [retry_at=null].
  -- Failures because of invalid files are dead => [status=dead].
  retry_at TIMESTAMP NULL,

  -- INDICES --
  PRIMARY KEY (id),
  KEY fk_creator_user_token (creator_user_token),
  KEY index_status (status),
  KEY index_creator_ip_address (creator_ip_address)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

