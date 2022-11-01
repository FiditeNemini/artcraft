use chrono::{DateTime, Utc};
use sqlx::{MySql, MySqlPool};
use sqlx::pool::PoolConnection;
use container_common::anyhow_result::AnyhowResult;

pub struct ActiveUserSubscription {
    pub user_token: String,

    /// The category or namespace for the product, eg "fakeyou" or "powerstream".
    pub subscription_namespace: String,

    /// The key for the product in our internal system (not a stripe id),
    /// eg. "fakeyou_en_pro" or "stream_package_plus".
    pub subscription_product_slug: String,

    /// This is the authoritative timestamp for when the subscription expires.
    pub subscription_expires_at: DateTime<Utc>,
}

pub async fn list_active_user_subscriptions(
    mysql_connection: &mut PoolConnection<MySql>,
    user_token: &str
) -> AnyhowResult<Vec<ActiveUserSubscription>> {
    let records = sqlx::query_as!(
      RawActiveUserSubscription,
        r#"
SELECT
  maybe_user_token as user_token,
  subscription_category as subscription_namespace,
  subscription_product_key as subscription_product_slug,
  subscription_expires_at

FROM user_subscriptions

WHERE
  maybe_user_token IS NOT NULL
  AND maybe_user_token = ?
  AND subscription_expires_at > CURRENT_TIMESTAMP
  ORDER BY id ASC
        "#,
      user_token,
    )
        .fetch_all(mysql_connection)
        .await?;

    let records = records.into_iter()
        .map(|record : RawActiveUserSubscription | {
            ActiveUserSubscription {
                user_token: record.user_token.unwrap_or("".to_string()),


                subscription_namespace: record.subscription_namespace,
                subscription_product_slug: record.subscription_product_slug,
                subscription_expires_at: record.subscription_expires_at,
            }
        })
        .collect::<Vec<ActiveUserSubscription>>();

    Ok(records)
}

struct RawActiveUserSubscription {
    user_token: Option<String>,
    subscription_namespace: String,
    subscription_product_slug: String,
    subscription_expires_at: DateTime<Utc>,
}
