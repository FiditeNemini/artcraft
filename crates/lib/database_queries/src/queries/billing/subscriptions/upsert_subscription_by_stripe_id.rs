use anyhow::anyhow;
use chrono::NaiveDateTime;
use container_common::anyhow_result::AnyhowResult;
use sqlx::MySqlPool;
use crate::tokens::Tokens;

// TODO: Make a trait with default impls to handle common query concerns.

pub struct UpsertSubscriptionByStripeId <'a> {
  /// Stripe's assigned ID for the subscription
  /// This acts as an externally-provided unique key for records in this table.
  pub stripe_subscription_id: &'a str,

  /// Internal user token
  pub maybe_user_token: Option<&'a str>,

  /// The platform key, eg. "fakeyou", "storyteller_stream", "symphonia", etc.
  pub subscription_category: &'a str,

  /// The name of the product the user is subscribing to within the category.
  pub subscription_product_key: &'a str,

  pub maybe_stripe_product_id: Option<&'a str>,
  pub maybe_stripe_customer_id: Option<&'a str>,
  pub maybe_stripe_is_production: Option<bool>,

  pub subscription_created_at: NaiveDateTime,

  /// When the subscription is set to expire.
  /// This controls whether it is active or not.
  pub subscription_expires_at: NaiveDateTime,
}

impl <'a> UpsertSubscriptionByStripeId <'a> {

  pub async fn upsert(&'a self, mysql_pool: &MySqlPool) -> AnyhowResult<()> {
    let token = Tokens::new_subscription_token()?;

    // NB: The following behaviors are intentional
    //  - We only set the token initially; changing it obviously breaks.
    //  - Other "static" fields do not need to change on update, either.
    //  - The user token is updated to the new value so long as we don't
    //    attempt to set it to null or empty.
    let query = sqlx::query!(
        r#"
INSERT INTO user_subscriptions
SET
  token = ?,
  maybe_user_token = ?,
  subscription_category = ?,
  subscription_product_key = ?,

  maybe_stripe_subscription_id = ?,

  maybe_stripe_product_id = ?,
  maybe_stripe_customer_id = ?,
  maybe_stripe_is_production = ?,

  subscription_created_at = ?,
  subscription_expires_at = ?,

  version = version + 1

ON DUPLICATE KEY UPDATE
  subscription_expires_at = ?,
  maybe_user_token = COALESCE(NULLIF(?, ''), maybe_user_token),

  version = version + 1
        "#,
      // Insert
      token,
      self.maybe_user_token,
      self.subscription_category,
      self.subscription_product_key,

      self.stripe_subscription_id,

      self.maybe_stripe_product_id,
      self.maybe_stripe_customer_id,
      self.maybe_stripe_is_production,

      self.subscription_created_at,
      self.subscription_expires_at,

      // Upsert
      self.subscription_expires_at,
      self.maybe_user_token,
    );

    let query_result = query.execute(mysql_pool).await;

    let _record_id = match query_result {
      Ok(res) => res.last_insert_id(),
      Err(err) => return Err(anyhow!("Error upserting subscription record: {:?}", err)),
    };

    Ok(())
  }
}
