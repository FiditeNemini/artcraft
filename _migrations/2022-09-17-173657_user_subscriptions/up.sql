-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

CREATE TABLE user_subscriptions (
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Effective "primary key" (PUBLIC)
  token VARCHAR(32) NOT NULL,

  -- ========== INTERNAL SUBSCRIPTION DETAILS ==========

  -- The internal user associated with the subscription.
  -- This is nullable since it's possible we mess up and don't set it on the Stripe objects.
  -- We want the latitude to correct mistakes in the future. (Hopefully this doesn't bite me later.)
  maybe_user_token VARCHAR(32) DEFAULT NULL,

  -- If we host multiple sites with distinct categories, this will enable us to segregate subscriptions.
  subscription_category VARCHAR(32) NOT NULL,

  -- This is the identifier for the actual type of subscription.
  -- These will not be defined in the database, but rather the source code.
  subscription_product_key VARCHAR(32) NOT NULL,

  -- ========== STRIPE DATA ==========

  -- The stripe IDs (nullable in case we can't associate or if we use paypal)

  -- You can safely assume object IDs we generate will never exceed 255 characters,
  -- but you should be able to handle IDs of up to that length. If for example you’re using MySQL,
  -- you should store IDs in a VARCHAR(255) COLLATE utf8_bin column (the COLLATE configuration ensures
  -- case-sensitivity in lookups).
  -- https://stackoverflow.com/a/61809494

  -- When we receive a webhook update, we'll look it up by this key.
  -- This has a UNIQUE index.
  maybe_stripe_subscription_id VARCHAR(255) DEFAULT NULL,

  maybe_stripe_product_id VARCHAR(255) DEFAULT NULL,

  maybe_stripe_customer_id VARCHAR(255) DEFAULT NULL,

  maybe_stripe_is_production BOOLEAN DEFAULT NULL,

  -- ========== VECTOR CLOCK ==========

  -- Incremented with every update.
  version INT NOT NULL DEFAULT 0,

  -- ========== RECORD TIMESTAMPS ==========

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL,

  -- ========== SUBSCRIPTION TIMESTAMPS ==========

  subscription_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- We'll use this to determine if the subscription is active.
  --
  -- Always compare against MySQL's clock rather than the app's clock so that we
  -- don't get weird clock skew behaviors across multiple requests.
  --
  -- Technically the user can have multiple active subscriptions of the same type, but we'll
  -- try to prevent creation of new subscriptions of the same type.
  subscription_expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- ========== INDICES ==========
  PRIMARY KEY (id),
  UNIQUE KEY (token),
  UNIQUE KEY (maybe_stripe_subscription_id),
  KEY index_subscription_category (subscription_category),
  KEY index_subscription_product_key (subscription_product_key),
  KEY fk_maybe_user_token (maybe_user_token)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
