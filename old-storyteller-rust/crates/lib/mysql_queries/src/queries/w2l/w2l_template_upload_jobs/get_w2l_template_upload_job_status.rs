use anyhow::anyhow;
use chrono::{DateTime, Utc};
use sqlx::MySqlPool;

use errors::AnyhowResult;

pub struct W2lUploadTemplateJobStatusRecord {
  pub job_token: String,

  pub status: String,
  pub attempt_count: i32,
  pub maybe_template_token: Option<String>,

  pub maybe_failure_reason: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

pub async fn get_w2l_template_upload_job_status(
  job_token: &str,
  mysql_pool: &MySqlPool,
) -> AnyhowResult<Option<W2lUploadTemplateJobStatusRecord>> {

  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
  let maybe_status = sqlx::query_as!(
      W2lUploadTemplateJobStatusRecord,
        r#"
SELECT
    jobs.token as job_token,

    jobs.status,
    jobs.attempt_count,
    jobs.on_success_result_token as maybe_template_token,

    jobs.failure_reason as maybe_failure_reason,

    jobs.created_at,
    jobs.updated_at

FROM w2l_template_upload_jobs as jobs

WHERE jobs.token = ?
        "#,
      job_token
    )
      .fetch_one(mysql_pool)
      .await; // TODO: This will return error if it doesn't exist

  match maybe_status {
    Ok(record) => Ok(Some(record)),
    Err(err) => match err {
      sqlx::Error::RowNotFound => Ok(None),
      _ => Err(anyhow!("w2l template query error: {:?}", err)),
    }
  }
}
