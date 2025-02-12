use anyhow::anyhow;
use chrono::{DateTime, Utc};
use sqlx::MySqlPool;

use errors::AnyhowResult;

pub struct W2lInferenceJobStatusRecord {
  pub job_token: String,

  pub status: String,
  pub attempt_count: i32,
  pub maybe_result_token: Option<String>,
  pub maybe_public_bucket_video_path: Option<String>,

  pub maybe_w2l_template_token: Option<String>,
  pub w2l_template_type: String,

  pub title: String,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

pub async fn get_w2l_inference_job_status(
  job_token: &str,
  mysql_pool: &MySqlPool,
) -> AnyhowResult<Option<W2lInferenceJobStatusRecord>> {
  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
  let maybe_status = sqlx::query_as!(
      W2lInferenceJobStatusRecord,
        r#"
SELECT
    jobs.token as job_token,

    jobs.status,
    jobs.attempt_count,
    jobs.on_success_result_token as maybe_result_token,
    results.public_bucket_video_path as maybe_public_bucket_video_path,

    jobs.maybe_w2l_template_token,
    w2l.template_type as w2l_template_type,
    w2l.title,

    jobs.created_at,
    jobs.updated_at

FROM w2l_inference_jobs as jobs
JOIN w2l_templates as w2l
    ON w2l.token = jobs.maybe_w2l_template_token
LEFT OUTER JOIN w2l_results as results
    ON jobs.on_success_result_token = results.token

WHERE jobs.token = ?
        "#,
      job_token
    )
      .fetch_one(mysql_pool)
      .await;

  match maybe_status {
    Ok(record) => Ok(Some(record)),
    Err(err) => match err {
      sqlx::Error::RowNotFound => Ok(None),
      _ => Err(anyhow!("w2l template query error: {:?}", err)),
    }
  }
}
