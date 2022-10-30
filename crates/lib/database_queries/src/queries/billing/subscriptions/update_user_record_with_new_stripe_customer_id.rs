use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use sqlx::MySqlPool;

pub async fn update_user_record_with_new_stripe_customer_id(
    mysql_pool: &MySqlPool,
    user_token: &str,
    maybe_stripe_customer_id: Option<&str>
) -> AnyhowResult<()> {

    // TODO: This will overwrite whatever the previous customer_id was.
    //  Should we guard against that?

    let query = sqlx::query!(
        r#"
UPDATE users
SET
  maybe_stripe_customer_id = ?,
  version = version + 1
WHERE
  token = ?
LIMIT 1
        "#,
        maybe_stripe_customer_id,
        user_token,
    );

    let query_result = query.execute(mysql_pool).await;

    match query_result {
        Ok(_) => Ok(()),
        Err(err) => Err(anyhow!("Error creating stripe webhook event log: {:?}", err)),
    }
}
