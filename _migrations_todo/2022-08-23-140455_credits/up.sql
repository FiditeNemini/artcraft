-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Current credit balances
CREATE TABLE credit_balances (
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- The type of credit
  -- Each credit type is its own logical "bucket" that cannot be mixed with the other types.
  -- eg. "image_generation"
  -- We'll have a composite unique key on this, so there can only be one balance per user per type.
  credit_type VARCHAR(32) NOT NULL,

  -- Foreign key to user
  -- We'll have a composite unique key on this, so there can only be one balance per user per type.
  user_token VARCHAR(32) NOT NULL,

  -- ========== BALANCE INFO ==========

  -- The credit balance
  -- (for the user within this credit_type bucket)
  -- Maximum value signed: 4,294,967,295
  balance INT UNSIGNED NOT NULL DEFAULT 0,

  -- ========== VECTOR CLOCK ==========

  -- Vector clock incremented on update
  version INT UNSIGNED NOT NULL DEFAULT 0,

  -- ========== TIMESTAMPS ==========

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  last_refilled_at TIMESTAMP DEFAULT NULL,
  last_spent_at TIMESTAMP DEFAULT NULL,

  -- INDICES --
  PRIMARY KEY (id),
  UNIQUE KEY (credit_type, user_token),
  KEY index_credit_type (credit_type),
  KEY fk_user_token (user_token)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


-- Record of credit refill (eg. purchase) events, some of which may be free
-- At time of record creation, these are considered "already processed" and reflected in the "user_balances" table.
-- For all intents and purposes, this is just a historical ledger of changes to active balance.
CREATE TABLE credit_refill_events (
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Effective "primary key"
  token VARCHAR(32) NOT NULL,

  -- The type of credit
  -- Each credit type is its own logical "bucket" that cannot be mixed with the other types.
  -- eg. "image_generation"
  credit_type VARCHAR(32) NOT NULL,

  -- Foreign key to user (not unique!)
  user_token VARCHAR(32) NOT NULL,

  -- ========== REFILL INFO ==========

  -- If we filled the balance for free, this will be set to true.
  -- These may be rewards for users, subscriptions that refill buckets, etc.
  is_free_event BOOL NOT NULL DEFAULT false,

  -- Added funds
  -- Maximum value signed: 4,294,967,295
  amount_added INT UNSIGNED NOT NULL DEFAULT 0,

  -- What the balance should be after the funds are added
  -- This is not the source of truth and is only used for debugging.
  balance_after_added INT UNSIGNED NOT NULL DEFAULT 0,

  -- Where the balance increase came from.
  -- eg. "stripe", "paypal", "coinbase", "free", etc.
  funds_source VARCHAR(32) NOT NULL,

  -- ========== ABUSE TRACKING ==========

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  maybe_creator_ip_address VARCHAR(40) DEFAULT NULL,

  -- ========== TIMESTAMPS ==========

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- INDICES --
  PRIMARY KEY (id),
  UNIQUE KEY (token),
  KEY index_credit_type_and_user_token (credit_type, user_token),
  KEY index_credit_type (credit_type),
  KEY fk_user_token (user_token)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


-- Record of credit use events (some of which may be zero-credit "free" uses)
-- At time of record creation, these are considered "already processed" and reflected in the "user_balances" table.
-- For all intents and purposes, this is just a historical ledger of changes to active balance.
CREATE TABLE credit_spend_events (
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Effective "primary key"
  token VARCHAR(32) NOT NULL,

  -- The type of credit.
  -- Each credit type is its own logical "bucket" that cannot be mixed with the other types.
  -- eg. "image_generation"
  credit_type VARCHAR(32) NOT NULL,

  -- Foreign key to user (not unique!)
  user_token VARCHAR(32) NOT NULL,

  -- ========== SPEND INFO ==========

  -- If we processed the transaction for free, this will be set to true.
  -- These may be rewards for users, subscriptions that refill, etc.
  is_free_event BOOL NOT NULL DEFAULT false,

  -- Subtracted funds
  -- Maximum value signed: 4,294,967,295
  amount_subtracted INT UNSIGNED NOT NULL DEFAULT 0,

  -- What the balance should be after the funds are subtracted
  -- This is not the source of truth and is only used for debugging.
  balance_after_subtracted INT UNSIGNED NOT NULL DEFAULT 0,

  -- Where the funds were spent. Typically 1:1 with "credit_type".
  -- eg. "stable_diffusion", "voice_commission", etc.
  spent_on VARCHAR(32) NOT NULL,

  -- If we can link it to whatever was purchased, do so.
  -- If it was a job run, it's set here.
  maybe_spent_on_job_token VARCHAR(32) DEFAULT NULL,

  -- If we can link it to whatever was purchased, do so.
  -- We may not have the entity token if the workload was async, but we can update this record later.
  maybe_spent_on_entity_token VARCHAR(32) DEFAULT NULL,

  -- ========== ABUSE TRACKING ==========

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  maybe_creator_ip_address VARCHAR(40) DEFAULT NULL,

  -- ========== TIMESTAMPS ==========

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- INDICES --
  PRIMARY KEY (id),
  UNIQUE KEY (token),
  KEY index_credit_type_and_user_token (credit_type, user_token),
  KEY index_credit_type (credit_type),
  KEY fk_user_token (user_token),
  KEY fk_maybe_spent_on_job_token (maybe_spent_on_job_token),
  KEY fk_maybe_spent_on_entity_token (maybe_spent_on_entity_token)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


-- Stripe payments
CREATE TABLE stripe_payment_events (
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Effective "primary key"
  token VARCHAR(32) NOT NULL,

  -- Foreign key to user (not unique!)
  user_token VARCHAR(32) NOT NULL,

  -- ========== PAYMENT INFO ==========

  -- Potentially an internal event token (eg. if this goes to a balance, not a subscription)
  maybe_balance_refill_event_token VARCHAR(32) NOT NULL,

  -- The stripe payment ID
  maybe_payment_id VARCHAR(64) NOT NULL,

  -- The stripe customer ID
  maybe_customer_id VARCHAR(64) NOT NULL,

  -- ========== ABUSE TRACKING ==========

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  maybe_creator_ip_address VARCHAR(40) DEFAULT NULL,

  -- ========== TIMESTAMPS ==========

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- INDICES --
  PRIMARY KEY (id),
  UNIQUE KEY (token),
  KEY fk_user_token (user_token),
  KEY fk_maybe_balance_refill_event_token (maybe_balance_refill_event_token)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Paypal payments
CREATE TABLE paypal_payment_events (
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Effective "primary key"
  token VARCHAR(32) NOT NULL,

  -- Foreign key to user (not unique!)
  user_token VARCHAR(32) NOT NULL,

  -- ========== PAYMENT INFO ==========

  -- Potentially an internal event token (eg. if this goes to a balance, not a subscription)
  maybe_balance_refill_event_token VARCHAR(32) NOT NULL,

  -- The paypal payment ID
  maybe_payment_id VARCHAR(64) NOT NULL,

  -- The paypal customer ID
  maybe_customer_id VARCHAR(64) NOT NULL,

  -- ========== ABUSE TRACKING ==========

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  maybe_creator_ip_address VARCHAR(40) DEFAULT NULL,

  -- ========== TIMESTAMPS ==========

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- INDICES --
  PRIMARY KEY (id),
  UNIQUE KEY (token),
  KEY fk_user_token (user_token),
  KEY fk_maybe_balance_refill_event_token (maybe_balance_refill_event_token)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
