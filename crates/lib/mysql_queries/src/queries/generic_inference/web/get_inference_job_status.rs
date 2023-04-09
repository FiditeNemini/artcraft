use anyhow::anyhow;
use chrono::{DateTime, Utc};
use enums::by_table::generic_inference_jobs::inference_category::InferenceCategory;
use errors::AnyhowResult;
use log::warn;
use sqlx::MySqlPool;
use tokens::jobs::inference::InferenceJobToken;

pub struct GenericInferenceJobStatus {
  pub job_token: InferenceJobToken,

  pub status: String,
  pub attempt_count: u16,

  pub request_details: RequestDetails,
  pub maybe_result_details: Option<ResultDetails>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

pub struct RequestDetails {
  pub inference_category: InferenceCategory,
  pub maybe_model_type: Option<String>, // TODO: Strongly type
  pub maybe_model_token: Option<String>,

  /// TTS input. In the future, perhaps voice conversion SST
  pub maybe_raw_inference_text: Option<String>,
}

pub struct ResultDetails {
  pub entity_type: String,
  pub entity_token: String,
}

/// Look up job status.
/// Returns Ok(None) when the record cannot be found.
pub async fn get_inference_job_status(job_token: &InferenceJobToken, mysql_pool: &MySqlPool)
  -> AnyhowResult<Option<GenericInferenceJobStatus>>
{
  let maybe_status = sqlx::query_as!(
      RawGenericInferenceJobStatus,
        r#"
SELECT
    jobs.token as `job_token: tokens::jobs::inference::InferenceJobToken`,

    jobs.status,
    jobs.attempt_count,

    jobs.inference_category as `inference_category: enums::by_table::generic_inference_jobs::inference_category::InferenceCategory`,
    jobs.maybe_model_type,
    jobs.maybe_model_token,
    jobs.maybe_raw_inference_text,

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

  let record = match maybe_status {
    Ok(record) => record,
    Err(err) => match err {
      sqlx::Error::RowNotFound => return Ok(None),
      _ => {
        warn!("error querying job record: {:?}", err);
        return Err(anyhow!("error querying job record: {:?}", err));
      }
    }
  };

  let maybe_result_details = record
      .maybe_result_entity_type
      .as_deref()
      .and_then(|entity_type| {
        record.maybe_result_entity_token
            .as_deref()
            .map(|entity_token| {
              ResultDetails {
                entity_type: entity_type.to_string(),
                entity_token: entity_token.to_string(),
              }
            })
      });

  Ok(Some(GenericInferenceJobStatus {
    job_token: record.job_token,
    status: record.status,
    attempt_count: record.attempt_count,
    request_details: RequestDetails {
      inference_category: record.inference_category,
      maybe_model_type: record.maybe_model_type,
      maybe_model_token: record.maybe_model_token,
      maybe_raw_inference_text: record.maybe_raw_inference_text,
    },
    maybe_result_details,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }))
}

struct RawGenericInferenceJobStatus {
  pub job_token: InferenceJobToken,

  pub status: String,
  pub attempt_count: u16,

  pub inference_category: InferenceCategory,
  pub maybe_model_type: Option<String>,
  pub maybe_model_token: Option<String>,
  pub maybe_raw_inference_text: Option<String>,

  pub maybe_result_entity_type: Option<String>,
  pub maybe_result_entity_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

