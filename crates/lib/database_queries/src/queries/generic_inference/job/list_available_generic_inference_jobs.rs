use anyhow::anyhow;
use chrono::Utc;
use container_common::anyhow_result::AnyhowResult;
use crate::column_types::job_status::JobStatus;
use crate::helpers::boolean_converters::i8_to_bool;
use crate::queries::generic_inference::job::_keys::GenericInferenceJobId;
use reusable_types::entity_visibility::EntityVisibility;
use reusable_types::generic_inference_type::GenericInferenceType;
use sqlx::MySqlPool;
use std::path::Path;
use tokens::jobs::inference::InferenceJobToken;

/// table: generic_inference_jobs
#[derive(Debug)]
pub struct AvailableInferenceJob {
  pub id: GenericInferenceJobId,
  pub inference_job_token: InferenceJobToken,

  // Inference information
  pub inference_type: GenericInferenceType,
  pub maybe_inference_args: Option<String>,
  pub maybe_raw_inference_text: Option<String>,
  pub maybe_model_token: Option<String>,

  // User information to propagate downstream
  pub maybe_creator_user_token: Option<String>,
  pub creator_ip_address: String,
  pub creator_set_visibility: EntityVisibility,

  // Job information
  pub status: JobStatus,
  pub attempt_count: u16,
  pub priority_level: u16,
  pub is_from_premium_user: bool,
  pub is_from_api_user: bool,
  pub is_for_twitch: bool,
  pub is_debug_request: bool,

  pub created_at: chrono::DateTime<Utc>,
  pub updated_at: chrono::DateTime<Utc>,
  pub retry_at: Option<chrono::DateTime<Utc>>,
}

pub async fn list_available_generic_inference_jobs(pool: &MySqlPool, num_records: u32)
  -> AnyhowResult<Vec<AvailableInferenceJob>>
{
  let job_records = sqlx::query_as!(
      AvailableInferenceJobRawInternal,
        r#"
SELECT
  id as `id: crate::queries::generic_inference::job::_keys::GenericInferenceJobId`,
  token AS `inference_job_token: tokens::jobs::inference::InferenceJobToken`,

  inference_type as `inference_type: reusable_types::generic_inference_type::GenericInferenceType`,
  maybe_inference_args,
  maybe_raw_inference_text,
  maybe_model_token,

  maybe_creator_user_token,
  creator_ip_address,
  creator_set_visibility as `creator_set_visibility: reusable_types::entity_visibility::EntityVisibility`,

  status as `status: crate::column_types::job_status::JobStatus`,


  attempt_count,
  priority_level,
  is_from_premium_user,
  is_from_api_user,
  is_for_twitch,
  is_debug_request,

  created_at,
  updated_at,
  retry_at
FROM generic_inference_jobs
WHERE
  (
    status IN ("pending", "attempt_failed")
  )
  AND
  (
    retry_at IS NULL
    OR
    retry_at < CURRENT_TIMESTAMP
  )
  ORDER BY id ASC
  LIMIT ?
        "#,
      num_records,
    )
      .fetch_all(pool)
      .await?;

  let job_records = job_records.into_iter()
      .map(|record : AvailableInferenceJobRawInternal| {
        AvailableInferenceJob {
          id: record.id,
          inference_job_token: record.inference_job_token,
          creator_ip_address: record.creator_ip_address,
          maybe_creator_user_token: record.maybe_creator_user_token,
          creator_set_visibility: record.creator_set_visibility,
          inference_type: record.inference_type,
          maybe_inference_args: record.maybe_inference_args,
          maybe_raw_inference_text: record.maybe_raw_inference_text,
          maybe_model_token: record.maybe_model_token,
          status: record.status,
          attempt_count: record.attempt_count,
          priority_level: record.priority_level,
          is_from_premium_user: i8_to_bool(record.is_from_premium_user),
          is_from_api_user: i8_to_bool(record.is_from_api_user),
          is_for_twitch: i8_to_bool(record.is_for_twitch),
          is_debug_request: i8_to_bool(record.is_debug_request),
          created_at: record.created_at,
          updated_at: record.updated_at,
          retry_at: record.retry_at,
        }
      })
      .collect::<Vec<AvailableInferenceJob>>();

  Ok(job_records)
}

#[derive(Debug)]
struct AvailableInferenceJobRawInternal {
  pub id: GenericInferenceJobId,
  pub inference_job_token: InferenceJobToken,

  // Inference information
  pub inference_type: GenericInferenceType,
  pub maybe_inference_args: Option<String>,
  pub maybe_raw_inference_text: Option<String>,
  pub maybe_model_token: Option<String>,

  // User information to propagate downstream
  pub maybe_creator_user_token: Option<String>,
  pub creator_ip_address: String,
  pub creator_set_visibility: EntityVisibility,

  // Job information
  pub status: JobStatus,
  pub attempt_count: u16,
  pub priority_level: u16,
  pub is_from_premium_user: i8,
  pub is_from_api_user: i8,
  pub is_for_twitch: i8,
  pub is_debug_request: i8,

  pub created_at: chrono::DateTime<Utc>,
  pub updated_at: chrono::DateTime<Utc>,
  pub retry_at: Option<chrono::DateTime<Utc>>,
}
