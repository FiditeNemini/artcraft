use anyhow::anyhow;
use chrono::NaiveDateTime;
use container_common::anyhow_result::AnyhowResult;
use sqlx::MySqlPool;

// TODO: Make a trait with default impls to handle common query concerns.

pub struct InsertStripeWebhookEventLog {
  pub stripe_event_id: String,
  pub stripe_event_type: String,
  pub maybe_stripe_event_entity_id: Option<String>,
  pub maybe_stripe_customer_id: Option<String>,
  pub stripe_event_created_at: NaiveDateTime,
  pub stripe_is_production: bool,
  pub maybe_user_token: Option<String>,
  pub event_was_handled: bool,
}

impl InsertStripeWebhookEventLog {

  pub async fn insert(&self, mysql_pool: &MySqlPool) -> AnyhowResult<()> {

    let query = sqlx::query!(
        r#"
INSERT INTO stripe_webhook_event_logs
SET
  stripe_event_id = ?,
  stripe_event_type = ?,
  maybe_stripe_event_entity_id = ?,
  maybe_stripe_customer_id = ?,
  stripe_event_created_at = ?,
  stripe_is_production = ?,
  maybe_user_token = ?,
  event_was_handled = ?
        "#,
      &self.stripe_event_id,
      &self.stripe_event_type,
      &self.maybe_stripe_event_entity_id,
      &self.maybe_stripe_customer_id,
      &self.stripe_event_created_at,
      self.stripe_is_production,
      &self.maybe_user_token,
      self.event_was_handled,
    );

    let query_result = query.execute(mysql_pool).await;

    let _record_id = match query_result {
      Ok(res) => res.last_insert_id(),
      Err(err) => return Err(anyhow!("Error creating stripe webhook event log: {:?}", err)),
    };

    Ok(())
  }
}
