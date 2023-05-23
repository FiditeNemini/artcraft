-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

CREATE TABLE password_resets (
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Password hash "primary key"
  -- (ie. for the future when we have a support dashboard)
  token VARCHAR(32) NOT NULL,

  -- Foreign key to user
  user_token VARCHAR(32) NOT NULL,

  -- Secret "key" for the password reset
  -- This will be shared via URL or user text input.
  secret_key VARCHAR(32) NOT NULL,

  -- Copied from the user record at the time of password reset issuance.
  -- If the user's password version is greater than this value, then this
  -- reset is no longer valid.
  current_password_version INT NOT NULL DEFAULT 0,

  -- Username is a lookup key; display_name allows the user to add custom case.
  is_redeemed BOOLEAN NOT NULL DEFAULT false,

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  ip_address_creation VARCHAR(40) NOT NULL,
  ip_address_redemption VARCHAR(40) NOT NULL,

  -- Incremented with every update.
  version INT NOT NULL DEFAULT 0,

  -- ========== TIMESTAMPS ==========

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- When the password reset expires
  expires_at TIMESTAMP NOT NULL,

  -- INDICES --
  PRIMARY KEY (id),
  UNIQUE KEY (token),
  KEY fk_user_token (user_token),
  KEY index_secret_key (secret_key),
  KEY index_expires_at (expires_at)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
