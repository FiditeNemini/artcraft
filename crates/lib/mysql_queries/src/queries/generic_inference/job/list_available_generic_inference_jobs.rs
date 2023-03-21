use anyhow::anyhow;
use chrono::Utc;
use crate::column_types::job_status::JobStatus;
use crate::helpers::boolean_converters::i8_to_bool;
use crate::queries::generic_inference::job::_keys::GenericInferenceJobId;
use enums::common::visibility::Visibility;
use enums::workers::generic_inference_type::GenericInferenceType;
use errors::AnyhowResult;
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

  // Development / debug info
  pub is_debug_request: bool,
  pub maybe_routing_tag: Option<String>,

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

  let job_records : Vec<AvailableInferenceJob> = job_records.into_iter()
      .map(|record : AvailableInferenceJobRawInternal| {
        let record = AvailableInferenceJob {
          id: GenericInferenceJobId(record.id),
          inference_job_token: InferenceJobToken::new(record.inference_job_token),
          creator_ip_address: record.creator_ip_address,
          maybe_creator_user_token: record.maybe_creator_user_token,
          creator_set_visibility: Visibility::from_str(&record.creator_set_visibility)
              .map_err(|e| anyhow!("error: {:?}", e))?,
          inference_type: GenericInferenceType::from_str(&record.inference_type)
              .map_err(|e| anyhow!("error: {:?}", e))?,
          maybe_inference_args: record.maybe_inference_args,
          maybe_raw_inference_text: record.maybe_raw_inference_text,
          maybe_model_token: record.maybe_model_token,
          status: JobStatus::from_str(&record.status)?,
          attempt_count: record.attempt_count,
          priority_level: record.priority_level,
          is_from_premium_user: i8_to_bool(record.is_from_premium_user),
          is_from_api_user: i8_to_bool(record.is_from_api_user),
          is_for_twitch: i8_to_bool(record.is_for_twitch),
          is_debug_request: i8_to_bool(record.is_debug_request),
          maybe_routing_tag: record.maybe_routing_tag,
          created_at: record.created_at,
          updated_at: record.updated_at,
          retry_at: record.retry_at,
        };
        Ok(record)
      })
      // NB: Magic Vec<Result> -> Result<Vec<>>
      // https://stackoverflow.com/a/63798748
      .into_iter()
      .collect::<Result<Vec<AvailableInferenceJob>, anyhow::Error>>()?;

  Ok(job_records)
}

async fn list_sorted_by_id(args: ListAvailableGenericInferenceJobArgs<'_>, inference_types: BTreeSet<GenericInferenceType>) -> Result<Vec<AvailableInferenceJobRawInternal>, sqlx::Error> {
  // NB: Can't be type checked because of WHERE IN clause with dynamic contents

  // Also had to remove the following typing:
  //id as `id: crate::queries::generic_inference::job::_keys::GenericInferenceJobId`,
  //token AS `inference_job_token: tokens::jobs::inference::InferenceJobToken`,
  //inference_type as `inference_type: enums::workers::generic_inference_type::GenericInferenceType`,
  //creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`,
  //status as `status: crate::column_types::job_status::JobStatus`,

  let mut query = r#"
SELECT
  id,
  token as inference_job_token,

  inference_type,
  maybe_inference_args,
  maybe_raw_inference_text,
  maybe_model_token,

  maybe_creator_user_token,
  creator_ip_address,
  creator_set_visibility,

  status,

  attempt_count,
  priority_level,
  is_from_premium_user,
  is_from_api_user,
  is_for_twitch,

  is_debug_request,
  maybe_routing_tag,

  created_at,
  updated_at,
  retry_at
FROM generic_inference_jobs"#.to_string();

  query.push_str(&format!(r#"
WHERE
    (
      inference_type IN ({})
    )
  "#, to_where_in_predicate(&inference_types)));

  query.push_str(r#"
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
        "#);

  let mut query = sqlx::query_as::<_, AvailableInferenceJobRawInternal>(&query)
      .bind(args.is_debug_worker)
      .bind(args.num_records);

  query.fetch_all(args.mysql_pool)
      .await
}

async fn list_sorted_by_priority(args: ListAvailableGenericInferenceJobArgs<'_>, inference_types: BTreeSet<GenericInferenceType>) -> Result<Vec<AvailableInferenceJobRawInternal>, sqlx::Error> {
  // NB: Can't be type checked because of WHERE IN clause with dynamic contents

  // Also had to remove the following typing:
  //id as `id: crate::queries::generic_inference::job::_keys::GenericInferenceJobId`,
  //token AS `inference_job_token: tokens::jobs::inference::InferenceJobToken`,
  //inference_type as `inference_type: enums::workers::generic_inference_type::GenericInferenceType`,
  //creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`,
  //status as `status: crate::column_types::job_status::JobStatus`,

  let mut query = r#"
SELECT
  id,
  token as inference_job_token,

  inference_type,
  maybe_inference_args,
  maybe_raw_inference_text,
  maybe_model_token,

  maybe_creator_user_token,
  creator_ip_address,
  creator_set_visibility,

  status,

  attempt_count,
  priority_level,
  is_from_premium_user,
  is_from_api_user,
  is_for_twitch,

  is_debug_request,
  maybe_routing_tag,

  created_at,
  updated_at,
  retry_at
FROM generic_inference_jobs"#.to_string();


  query.push_str(&format!(r#"
WHERE
    (
      inference_type IN ({})
    )
  "#, to_where_in_predicate(&inference_types)));

  query.push_str(r#"
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
        "#);

  let mut query = sqlx::query_as::<_, AvailableInferenceJobRawInternal>(&query)
      .bind(args.is_debug_worker)
      .bind(args.num_records);

  query.fetch_all(args.mysql_pool)
      .await
}

#[derive(Debug)]
#[derive(sqlx::FromRow)]
struct AvailableInferenceJobRawInternal {
  //pub id: GenericInferenceJobId,
  pub id: i64,
  //pub inference_job_token: InferenceJobToken,
  pub inference_job_token: String,

  // Inference information
  //pub inference_type: GenericInferenceType,
  pub inference_type: String,
  pub maybe_inference_args: Option<String>,
  pub maybe_raw_inference_text: Option<String>,
  pub maybe_model_token: Option<String>,

  // User information to propagate downstream
  pub maybe_creator_user_token: Option<String>,
  pub creator_ip_address: String,
  //pub creator_set_visibility: Visibility,
  pub creator_set_visibility: String,

  // Job information
  //pub status: JobStatus,
  pub status: String,
  pub attempt_count: u16,
  pub priority_level: u16,
  pub is_from_premium_user: i8,
  pub is_from_api_user: i8,
  pub is_for_twitch: i8,

  // Development / debug info
  pub is_debug_request: i8,
  pub maybe_routing_tag: Option<String>,

  pub created_at: chrono::DateTime<Utc>,
  pub updated_at: chrono::DateTime<Utc>,
  pub retry_at: Option<chrono::DateTime<Utc>>,
}

/// Return a comma-separated predicate, since SQLx does not yet support WHERE IN(?) for Vec<T>, etc.
/// Issue: https://github.com/launchbadge/sqlx/issues/875
fn to_where_in_predicate(types: &BTreeSet<GenericInferenceType>) -> String {
  let mut vec = types.iter()
      .map(|ty| ty.to_str())
      .map(|ty| format!("\"{}\"", ty))
      .collect::<Vec<String>>();
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
