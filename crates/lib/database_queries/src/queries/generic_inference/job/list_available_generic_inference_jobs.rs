use anyhow::anyhow;
use chrono::Utc;
use container_common::anyhow_result::AnyhowResult;
use crate::column_types::job_status::JobStatus;
use crate::helpers::boolean_converters::i8_to_bool;
use crate::queries::generic_inference::job::_keys::GenericInferenceJobId;
use enums::core::visibility::Visibility;
use enums::workers::generic_inference_type::GenericInferenceType;
use sqlx::mysql::MySqlArguments;
use sqlx::{MySql, MySqlPool};
use std::collections::BTreeSet;
use std::future::Future;
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
  pub creator_set_visibility: Visibility,

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

pub struct ListAvailableGenericInferenceJobArgs<'a> {
  pub num_records: u32,
  pub is_debug_worker: bool,
  pub sort_by_priority: bool,
  pub maybe_scope_by_job_type: Option<BTreeSet<GenericInferenceType>>,
  pub mysql_pool: &'a MySqlPool,
}

pub async fn list_available_generic_inference_jobs(
  args: ListAvailableGenericInferenceJobArgs<'_>,
)
  -> AnyhowResult<Vec<AvailableInferenceJob>>
{
  let ALL_TYPES = GenericInferenceType::all_variants();

  let inference_types = args.maybe_scope_by_job_type
      .as_ref()
      .map(|types| types.clone())
      .unwrap_or(ALL_TYPES);

  let query = if args.sort_by_priority {
    list_sorted_by_priority(args, inference_types).await
  } else {
    list_sorted_by_id(args, inference_types).await
  };

  let job_records = query?;

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

async fn list_sorted_by_id(args: ListAvailableGenericInferenceJobArgs<'_>, inference_types: BTreeSet<GenericInferenceType>) -> Result<Vec<AvailableInferenceJobRawInternal>, sqlx::Error> {
  sqlx::query_as!(
      AvailableInferenceJobRawInternal,
        r#"
SELECT
  id as `id: crate::queries::generic_inference::job::_keys::GenericInferenceJobId`,
  token AS `inference_job_token: tokens::jobs::inference::InferenceJobToken`,

  inference_type as `inference_type: enums::workers::generic_inference_type::GenericInferenceType`,
  maybe_inference_args,
  maybe_raw_inference_text,
  maybe_model_token,

  maybe_creator_user_token,
  creator_ip_address,
  creator_set_visibility as `creator_set_visibility: enums::core::visibility::Visibility`,

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
    inference_type IN (?)
  )
  AND
  (
    status IN ("pending", "attempt_failed")
  )
  AND
  (
    retry_at IS NULL
    OR
    retry_at < CURRENT_TIMESTAMP
  )
  AND
  (
    is_debug_request = ?
  )
  ORDER BY id ASC
  LIMIT ?
        "#,
      to_where_in_predicate(&inference_types),
      args.is_debug_worker,
      args.num_records,
    )
      .fetch_all(args.mysql_pool)
      .await
}

async fn list_sorted_by_priority(args: ListAvailableGenericInferenceJobArgs<'_>, inference_types: BTreeSet<GenericInferenceType>) -> Result<Vec<AvailableInferenceJobRawInternal>, sqlx::Error> {
  sqlx::query_as!(
      AvailableInferenceJobRawInternal,
        r#"
SELECT
  id as `id: crate::queries::generic_inference::job::_keys::GenericInferenceJobId`,
  token AS `inference_job_token: tokens::jobs::inference::InferenceJobToken`,

  inference_type as `inference_type: enums::workers::generic_inference_type::GenericInferenceType`,
  maybe_inference_args,
  maybe_raw_inference_text,
  maybe_model_token,

  maybe_creator_user_token,
  creator_ip_address,
  creator_set_visibility as `creator_set_visibility: enums::core::visibility::Visibility`,

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
    inference_type IN (?)
  )
  AND
  (
    status IN ("pending", "attempt_failed")
  )
  AND
  (
    retry_at IS NULL
    OR
    retry_at < CURRENT_TIMESTAMP
  )
  AND
  (
    is_debug_request = ?
  )
  ORDER BY priority_level DESC, id ASC
  LIMIT ?
        "#,
      to_where_in_predicate(&inference_types),
      args.is_debug_worker,
      args.num_records,
    )
      .fetch_all(args.mysql_pool)
      .await
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
  pub creator_set_visibility: Visibility,

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

/// Return a comma-separated predicate, since SQLx does not yet support WHERE IN(?) for Vec<T>, etc.
/// Issue: https://github.com/launchbadge/sqlx/issues/875
fn to_where_in_predicate(types: &BTreeSet<GenericInferenceType>) -> String {
  let mut vec = types.iter()
      .map(|ty| ty.to_str()) // TODO: These strings might need to be quoted.
      .collect::<Vec<&'static str>>();
  vec.sort(); // NB: For the benefit of tests.
  vec.join(", ")
}

#[cfg(test)]
mod tests {
  use crate::queries::generic_inference::job::list_available_generic_inference_jobs::to_where_in_predicate;
  use enums::workers::generic_inference_type::GenericInferenceType;
  use std::collections::BTreeSet;

  #[test]
  fn test_where_in_clause() {
    // None
    let types = BTreeSet::from([]);
    assert_eq!(to_where_in_predicate(&types), "".to_string());

    // Some
    let types = BTreeSet::from([
      GenericInferenceType::VoiceConversion,
    ]);

    assert_eq!(to_where_in_predicate(&types), "voice_conversion".to_string());
    // All
    let types = BTreeSet::from([
      GenericInferenceType::TextToSpeech,
      GenericInferenceType::VoiceConversion,
    ]);
    assert_eq!(to_where_in_predicate(&types), "text_to_speech, voice_conversion".to_string());
  }
}
