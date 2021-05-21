# noinspection SqlResolveForFile
# noinspection SqlNoDataSourceInspectionForFile
CREATE TABLE tts_inference_jobs (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- ========== INFERENCE DETAILS ==========

  -- The model to use.
  -- This also determines which architecture we're using.
  model_token VARCHAR(32) NOT NULL,

  -- The raw, unprocessed user input.
  inference_text TEXT NOT NULL,

  -- ========== CREATOR DETAILS ==========

  -- Foreign key to user
  -- If no user is logged in, this is null.
  maybe_creator_user_token CHAR(16) DEFAULT NULL,

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  creator_ip_address VARCHAR(40) NOT NULL,

  -- (THIS MIGHT NOT BE USED)
  -- NB: DO NOT SORT!
  -- THIS MUST MATCH THE RESPECTIVE JOBS TABLE.
  creator_set_visibility ENUM(
    'public',
    'hidden',
    'private'
  ) NOT NULL DEFAULT 'public',

  -- ========== JOB SYSTEM DETAILS ==========

  -- Jobs begin as "pending", then transition to other states.
  -- Pending -> Started -> Complete
  --                    \-> Failed -> Started -> { Complete, Failed, Dead }
  status ENUM('pending', 'started', 'complete', 'failed', 'dead') NOT NULL DEFAULT 'pending',

  -- We can track this against a "max_attempt_count"
  attempt_count INT(3) NOT NULL DEFAULT 0,

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
  KEY fk_model_token (model_token),
  KEY fk_maybe_creator_user_token (maybe_creator_user_token),
  KEY index_status (status),
  KEY index_creator_ip_address (creator_ip_address)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE w2l_inference_jobs (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- ========== INFERENCE DETAILS ==========

  -- The W2L template to use
  -- Can be an image or video.
  -- This is null if we're using a custom uploaded image.
  maybe_w2l_template_token VARCHAR(32) DEFAULT NULL,

  -- If we're using TTS results, this will be present
  maybe_tts_inference_result_token VARCHAR(32) DEFAULT NULL,

  -- If we're using custom uploaded audio, this will be present.
  maybe_audio_bucket_location CHAR(16) DEFAULT NULL,

  -- If we're using a custom uploaded image, this will be present.
  maybe_image_bucket_location CHAR(16) DEFAULT NULL,

  -- ========== CREATOR DETAILS ==========

  -- Foreign key to user
  -- If no user is logged in, this is null.
  maybe_creator_user_token VARCHAR(32) DEFAULT NULL,

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  creator_ip_address VARCHAR(40) NOT NULL,

  -- (THIS MIGHT NOT BE USED)
  -- NB: DO NOT SORT!
  -- THIS MUST MATCH THE RESPECTIVE JOBS TABLE.
  creator_set_visibility ENUM(
      'public',
      'hidden',
      'private'
  ) NOT NULL DEFAULT 'public',

  -- ========== JOB SYSTEM DETAILS ==========

  -- Jobs begin as "pending", then transition to other states.
  -- Pending -> Started -> Complete
  --                    \-> Failed -> Started -> { Complete, Failed, Dead }
  status ENUM('pending', 'started', 'complete', 'failed', 'dead') NOT NULL DEFAULT 'pending',

  -- We can track this against a "max_attempt_count"
  attempt_count INT(3) NOT NULL DEFAULT 0,

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
  KEY fk_maybe_w2l_template_token (maybe_w2l_template_token),
  KEY fk_maybe_tts_inference_result_token (maybe_tts_inference_result_token),
  KEY fk_maybe_creator_user_token (maybe_creator_user_token),
  KEY index_status (status),
  KEY index_creator_ip_address (creator_ip_address)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
