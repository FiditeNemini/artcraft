# noinspection SqlResolveForFile
# noinspection SqlNoDataSourceInspectionForFile

CREATE TABLE tts_results (
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Effective "primary key" (PUBLIC)
  token VARCHAR(32) NOT NULL,

  -- The TTS model that was used
  model_token VARCHAR(32) NOT NULL,

  -- The original raw, unprocessed user input.
  inference_text TEXT NOT NULL,

  -- Users can upload their own private templates.
  -- They can choose to make them public later.
  is_private_for_creator BOOLEAN NOT NULL DEFAULT FALSE,

  -- The person that created the template.
  -- If the user wasn't logged in, this is null
  maybe_creator_user_token VARCHAR(32) DEFAULT NULL,

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  creator_ip_address VARCHAR(40) NOT NULL,

  -- Where the wav, spectrogram, and etc. are located.
  public_bucket_hash CHAR(32) NOT NULL UNIQUE,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- If this is removed by a mod or the creator.
  deleted_at TIMESTAMP NULL,

  -- INDICES --
  PRIMARY KEY (id),
  UNIQUE KEY (token),
  KEY fk_model_token (model_token),
  KEY fk_maybe_creator_user_token (maybe_creator_user_token),
  KEY index_creator_ip_address (creator_ip_address)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE w2l_results (
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Effective "primary key" (PUBLIC)
  token VARCHAR(32) NOT NULL,

  -- The w2l template that was used (if set)
  maybe_w2l_template_token VARCHAR(32) NOT NULL,

  -- The inference result, if we're using them.
  maybe_tts_inference_result_token VARCHAR(32) DEFAULT NULL,

  -- Users can upload their own private templates.
  -- They can choose to make them public later.
  is_private_for_creator BOOLEAN NOT NULL DEFAULT FALSE,

  -- The person that created the template.
  -- If the user wasn't logged in, this is null
  maybe_creator_user_token VARCHAR(32) DEFAULT NULL,

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  creator_ip_address VARCHAR(40) NOT NULL,

  -- Where the wav, spectrogram, and etc. are located.
  public_bucket_hash CHAR(32) NOT NULL UNIQUE,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- If this is removed by a mod or the creator.
  deleted_at TIMESTAMP NULL,

  -- INDICES --
  PRIMARY KEY (id),
  UNIQUE KEY (token),
  KEY fk_maybe_creator_user_token (maybe_creator_user_token),
  KEY fk_maybe_w2l_template_token (maybe_w2l_template_token),
  KEY fk_maybe_tts_inference_result_token (maybe_tts_inference_result_token),
  KEY index_creator_ip_address (creator_ip_address)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
