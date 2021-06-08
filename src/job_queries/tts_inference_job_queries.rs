//! NB: This seems required for sqlx to generate the cached queries.
//! Sqlx's prepare needs a *single* binary to work against, so we need to
//! include these in the main binary to generate all the queries.

use anyhow::anyhow;
use chrono::{Utc, DateTime};
use crate::util::anyhow_result::AnyhowResult;
use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;
use log::{warn, info};
use sqlx::MySqlPool;
use std::path::Path;

/// table: tts_inference_jobs
#[derive(Debug)]
pub struct TtsInferenceJobRecord {
  pub id: i64,
  pub inference_job_token: String,
  pub uuid_idempotency_token: String,

  pub model_token: String,
  pub inference_text: String,

  pub creator_ip_address: String,
  pub maybe_creator_user_token: Option<String>,
  pub creator_set_visibility: String, // TODO

  pub status: String, // TODO
  pub attempt_count: i32,
  pub failure_reason: Option<String>,
  pub created_at: chrono::DateTime<Utc>,
  pub updated_at: chrono::DateTime<Utc>,
  pub retry_at: Option<chrono::DateTime<Utc>>,
}

pub async fn query_tts_inference_job_records(
  pool: &MySqlPool,
  num_records: u32
) -> AnyhowResult<Vec<TtsInferenceJobRecord>> {

  let job_records = sqlx::query_as!(
      TtsInferenceJobRecord,
        r#"
SELECT
  id,
  token AS inference_job_token,
  uuid_idempotency_token,

  model_token,
  inference_text,

  creator_ip_address,
  maybe_creator_user_token,
  creator_set_visibility,

  status,
  attempt_count,
  failure_reason,
  created_at,
  updated_at,
  retry_at
FROM tts_inference_jobs
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
  LIMIT ?
        "#,
      num_records,
    )
      .fetch_all(pool)
      .await?;

  Ok(job_records)
}


pub struct TtsInferenceLockRecord {
  id: i64,
  status: String,
}

pub async fn grab_job_lock_and_mark_pending(
  pool: &MySqlPool,
  job: &TtsInferenceJobRecord
) -> AnyhowResult<bool> {

  // NB: We use transactions and "SELECT ... FOR UPDATE" to simulate mutexes.
  let mut transaction = pool.begin().await?;

  let maybe_record = sqlx::query_as!(
    TtsInferenceLockRecord,
        r#"
SELECT
  id,
  status
FROM tts_inference_jobs
WHERE id = ?
FOR UPDATE
        "#,
        job.id,
    )
      .fetch_one(&mut transaction)
      .await;

  let record : TtsInferenceLockRecord = match maybe_record {
    Ok(record) => record,
    Err(err) => {
      match err {
        RowNotFound => {
          return Err(anyhow!("could not job"));
        },
        _ => {
          return Err(anyhow!("query error"));
        }
      }
    }
  };

  let can_transact = match record.status.as_ref() {
    "pending" => true, // It's okay for us to take the lock.
    "attempt_failed" => true, // We can retry.
    "started" => false, // Job in progress (another job beat us, and we can't take the lock)
    "complete_success" => false, // Job already complete
    "complete_failure" => false, // Job already complete (permanently dead; no need to retry)
    "dead" => false, // Job already complete (permanently dead; retries exhausted)
    _ => false, // Future-proof
  };

  if !can_transact {
    transaction.rollback().await?;
    return Ok(false);
  }

  let _acquire_lock = sqlx::query!(
        r#"
UPDATE tts_inference_jobs
SET
  status = 'started',
  retry_at = NOW() + interval 2 minute
WHERE id = ?
        "#,
        job.id,
    )
      .execute(&mut transaction)
      .await?;

  transaction.commit().await?;

  Ok(true)
}

pub async fn mark_tts_inference_job_failure(
  pool: &MySqlPool,
  job: &TtsInferenceJobRecord,
  failure_reason: &str
) -> AnyhowResult<()> {

  // statuses: "attempt_failed", "complete_failure", "dead"
  let status = "attempt_failed";

  let query_result = sqlx::query!(
        r#"
UPDATE tts_inference_jobs
SET
  status = ?,
  failure_reason = ?,
  retry_at = NOW() + interval 1 minute
WHERE id = ?
        "#,
        status,
        failure_reason.to_string(),
        job.id,
    )
      .execute(pool)
      .await?;

  Ok(())
}
pub async fn mark_tts_inference_job_done(
  pool: &MySqlPool,
  job: &TtsInferenceJobRecord,
  success: bool,
  maybe_result_token: Option<&str>
) -> AnyhowResult<()> {
  let status = if success { "complete_success" } else { "complete_failure" };

  let query_result = sqlx::query!(
        r#"
UPDATE tts_inference_jobs
SET
  status = ?,
  on_success_result_token = ?,
  failure_reason = NULL,
  retry_at = NULL
WHERE id = ?
        "#,
        status,
        maybe_result_token,
        job.id
    )
      .execute(pool)
      .await?;

  Ok(())
}

pub async fn insert_tts_result<P: AsRef<Path>>(
  pool: &MySqlPool,
  job: &TtsInferenceJobRecord,
  text_hash: &str,
  bucket_audio_results_path: P,
  bucket_spectrogram_results_path: P,
  file_size_bytes: u64,
  duration_millis: u64
) -> AnyhowResult<(u64, String)>
{
  let inference_result_token = random_prefix_crockford_token("TTS_RES:", 32)?;

  let bucket_audio_result_path = &bucket_audio_results_path
      .as_ref()
      .display()
      .to_string();

  let bucket_spectrogram_result_path = &bucket_audio_results_path
      .as_ref()
      .display()
      .to_string();

  let query_result = sqlx::query!(
        r#"
INSERT INTO tts_results
SET
  token = ?,

  model_token = ?,
  inference_text = ?,
  inference_text_hash_sha2 = ?,

  maybe_creator_user_token = ?,
  creator_ip_address = ?,
  creator_set_visibility = 'public',

  public_bucket_hash = 'TODO',
  public_bucket_wav_audio_path = ?,
  public_bucket_spectrogram_path = ?,
  inference_public_bucket_uuid = 'TODO',

  file_size_bytes = ?,
  duration_millis = ?
        "#,
      inference_result_token,
      job.model_token.clone(),
      job.inference_text.clone(),
      text_hash,

      job.maybe_creator_user_token.clone(),
      job.creator_ip_address.clone(),

      bucket_audio_result_path,
      bucket_spectrogram_result_path,

      file_size_bytes,
      duration_millis
    )
      .execute(pool)
      .await;

  let record_id = match query_result {
    Ok(res) => {
      res.last_insert_id()
    },
    Err(err) => {
      // TODO: handle better
      return Err(anyhow!("Mysql error: {:?}", err));
    }
  };

  Ok((record_id, inference_result_token.clone()))
}

pub struct TtsModelRecord2 {
  pub model_token: String,
  pub tts_model_type: String,

  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,

  pub title: String,
  pub updatable_slug: String,
  pub private_bucket_hash: String,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

pub async fn get_tts_model_by_token(
  pool: &MySqlPool,
  model_token: &str
) -> AnyhowResult<Option<TtsModelRecord2>>
{
  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
  let maybe_model = sqlx::query_as!(
      TtsModelRecord2,
        r#"
SELECT
    tts.token as model_token,
    tts.tts_model_type,
    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    tts.title,
    tts.updatable_slug,
    tts.private_bucket_hash,
    tts.created_at,
    tts.updated_at
FROM tts_models as tts
JOIN users
ON users.token = tts.creator_user_token
WHERE tts.token = ?
AND tts.deleted_at IS NULL
        "#,
      &model_token
    )
      .fetch_one(pool)
      .await; // TODO: This will return error if it doesn't exist

  match maybe_model {
    Ok(model) => Ok(Some(model)),
    Err(err) => {
      match err {
        RowNotFound => {
          Ok(None)
        },
        _ => {
          warn!("tts model query error: {:?}", err);
          Err(anyhow!("Mysql error: {:?}", err))
        }
      }
    }
  }
}
