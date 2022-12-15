use anyhow::anyhow;
use chrono::{DateTime, Utc};
use container_common::anyhow_result::AnyhowResult;
use log::warn;
use reusable_types::entity_visibility::EntityVisibility;
use reusable_types::generic_inference_type::GenericInferenceType;
use sqlx::MySqlPool;
use tokens::jobs::inference::InferenceJobToken;

pub struct GenericInferenceJobStatus {
  pub job_token: InferenceJobToken,

  pub status: String,
  pub attempt_count: u16,

  pub maybe_result_entity_type: Option<String>,
  pub maybe_result_entity_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

/// Look up job status.
/// Returns Ok(None) when the record cannot be found.
pub async fn get_generic_inference_job_status(job_token: &InferenceJobToken, mysql_pool: &MySqlPool)
  -> AnyhowResult<Option<GenericInferenceJobStatus>>
{
  let maybe_status = sqlx::query_as!(
      GenericInferenceJobStatus,
        r#"
SELECT
    jobs.token as `job_token: tokens::jobs::inference::InferenceJobToken`,

    jobs.status,
    jobs.attempt_count,
    jobs.on_success_result_entity_type as maybe_result_entity_type,
    jobs.on_success_result_entity_token as maybe_result_entity_token,

    jobs.created_at,
    jobs.updated_at

FROM generic_inference_jobs as jobs

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
      _ => {
        warn!("error querying job record: {:?}", err);
        Err(anyhow!("error querying job record: {:?}", err))
      }
    }
  }
}
