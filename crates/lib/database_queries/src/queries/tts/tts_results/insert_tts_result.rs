use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use crate::column_types::vocoder_type::VocoderType;
use crate::queries::tts::tts_inference_jobs::list_available_tts_inference_jobs::AvailableTtsInferenceJob;
use crate::tokens::Tokens;
use log::warn;
use sqlx::MySqlPool;
use sqlx;
use std::path::Path;

/// Used to give user-facing order to logged in user inference requests
pub struct SyntheticIdRecord {
  pub next_id: i64,
}

pub async fn insert_tts_result<P: AsRef<Path>>(
  pool: &MySqlPool,
  job: &AvailableTtsInferenceJob,
  text_hash: &str,
  pretrained_vocoder_used: VocoderType,
  bucket_audio_results_path: P,
  bucket_spectrogram_results_path: P,
  file_size_bytes: u64,
  duration_millis: u64
) -> AnyhowResult<(u64, String)>
{
  let inference_result_token = Tokens::new_tts_result()?;

  let bucket_audio_result_path = &bucket_audio_results_path
      .as_ref()
      .display()
      .to_string();

  let bucket_spectrogram_result_path = &bucket_spectrogram_results_path
      .as_ref()
      .display()
      .to_string();

  let normalized_inference_text = job.raw_inference_text.clone(); // TODO

  let maybe_creator_user_token = job.maybe_creator_user_token.clone();
  let mut maybe_creator_synthetic_id : Option<u64> = None;

  let mut transaction = pool.begin().await?;

  if let Some(creator_user_token) = maybe_creator_user_token.as_deref() {
    let query_result = sqlx::query!(
        r#"
INSERT INTO tts_result_synthetic_ids
SET
  user_token = ?,
  next_id = 1
ON DUPLICATE KEY UPDATE
  user_token = ?,
  next_id = next_id + 1
        "#,
      creator_user_token,
      creator_user_token
    )
        .execute(&mut transaction)
        .await;

    match query_result {
      Ok(_) => {},
      Err(err) => {
        //transaction.rollback().await?;
        warn!("Transaction failure: {:?}", err);
      }
    }

    let query_result = sqlx::query_as!(
    SyntheticIdRecord,
        r#"
SELECT
  next_id
FROM
  tts_result_synthetic_ids
WHERE
  user_token = ?
LIMIT 1
        "#,
      creator_user_token,
    )
        .fetch_one(&mut transaction)
        .await;

    let record : SyntheticIdRecord = match query_result {
      Ok(record) => record,
      Err(err) => {
        warn!("Transaction failure: {:?}", err);
        transaction.rollback().await?;
        return Err(anyhow!("Transaction failure: {:?}", err));
      }
    };

    let next_id = record.next_id as u64;
    maybe_creator_synthetic_id = Some(next_id);
  }

  let record_id = {
    let query_result = sqlx::query!(
        r#"
INSERT INTO tts_results
SET
  token = ?,

  model_token = ?,
  maybe_pretrained_vocoder_used = ?,
  raw_inference_text = ?,
  raw_inference_text_hash_sha2 = ?,
  normalized_inference_text = ?,

  maybe_creator_user_token = ?,
  maybe_creator_synthetic_id = ?,

  creator_ip_address = ?,
  creator_set_visibility = ?,

  public_bucket_wav_audio_path = ?,
  public_bucket_spectrogram_path = ?,

  file_size_bytes = ?,
  duration_millis = ?
        "#,
      inference_result_token,
      job.model_token.clone(),
      pretrained_vocoder_used.to_str(),
      job.raw_inference_text.clone(),
      text_hash,
      normalized_inference_text,

      maybe_creator_user_token,
      maybe_creator_synthetic_id,

      job.creator_ip_address.clone(),
      job.creator_set_visibility.to_str(),

      bucket_audio_result_path,
      bucket_spectrogram_result_path,

      file_size_bytes,
      duration_millis
    )
        .execute(&mut transaction)
        .await;

    let record_id = match query_result {
      Ok(res) => {
        res.last_insert_id()
      },
      Err(err) => {
        // TODO: handle better
        //transaction.rollback().await?;
        return Err(anyhow!("Mysql error: {:?}", err));
      }
    };

    record_id
  };

  transaction.commit().await?;

  Ok((record_id, inference_result_token.clone()))
}

