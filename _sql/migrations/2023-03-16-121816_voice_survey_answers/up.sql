-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Voice survey answers
CREATE TABLE voice_survey_answers (
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Effective "primary key" (PUBLIC)
  token VARCHAR(32) NOT NULL,

  -- Idempotency token from client
  -- This is so the frontend client doesn't submit duplicate items.
  uuid_idempotency_token VARCHAR(36) NOT NULL,

  -- User making the comment
  maybe_user_token VARCHAR(32) DEFAULT NULL,

  -- The voice that is being requested
  voice_name VARCHAR(128) NOT NULL,

  -- If the person would pay for FakeYou premium
  would_pay BOOLEAN NOT NULL DEFAULT FALSE,

  -- How much the user would hypothetically pay per month
  would_pay_amount DOUBLE DEFAULT NULL,

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  creator_ip_address VARCHAR(40) NOT NULL,

  -- ========== VECTOR CLOCK ==========

  -- Incremented with every update.
  version INT NOT NULL DEFAULT 0,

  -- ========== TIMESTAMPS ==========

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- INDICES --
  PRIMARY KEY (id),
  UNIQUE KEY (token),
  UNIQUE KEY (uuid_idempotency_token),
  KEY index_maybe_user_token (maybe_user_token),
  KEY index_voice_name (voice_name),
  KEY index_would_pay (would_pay),
  KEY index_would_pay_amount (would_pay_amount),
  KEY index_created_at (created_at)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
