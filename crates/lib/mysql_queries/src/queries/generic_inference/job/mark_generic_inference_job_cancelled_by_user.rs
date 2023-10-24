use anyhow::anyhow;
use sqlx;
use sqlx::{MySql, MySqlPool};
use sqlx::pool::PoolConnection;

use errors::AnyhowResult;
use tokens::tokens::generic_inference_jobs::InferenceJobToken;

/// Mark a single job as cancelled by the user.
pub async fn mark_generic_inference_job_cancelled_by_user(
  mysql_connection: &mut PoolConnection<MySql>,
  job_token: &InferenceJobToken
) -> AnyhowResult<()> {

  let query_result = sqlx::query!(
        r#"
UPDATE generic_inference_jobs
SET
  status = 'cancelled_by_user',
  retry_at = NULL
WHERE token = ?
AND status NOT IN ('complete_success', 'complete_failure', 'dead', 'cancelled_by_system')
        "#,
        job_token,
    )
      .execute(mysql_connection)
      .await;

  match query_result {
    Err(err) => Err(anyhow!("error with query: {:?}", err)),
    Ok(_r) => Ok(()),
  }
}
