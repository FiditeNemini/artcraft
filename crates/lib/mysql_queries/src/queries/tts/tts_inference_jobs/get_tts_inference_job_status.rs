use anyhow::anyhow;
use chrono::{DateTime, Utc};
use sqlx::MySqlPool;

use errors::AnyhowResult;

#[derive(Serialize)]
pub struct TtsInferenceJobStatusRecord {
  pub job_token: String,

  pub status: String,
  pub attempt_count: i32,

  pub maybe_result_token: Option<String>,
  pub maybe_public_bucket_wav_audio_path: Option<String>,

  pub model_token: String,
  pub tts_model_type: String,
  pub title: String, // Name of the TTS model

  pub raw_inference_text: String, // User text

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

pub async fn get_tts_inference_job_status(
  tts_inference_job_token: &str,
  mysql_pool: &MySqlPool
) -> AnyhowResult<Option<TtsInferenceJobStatusRecord>> {

  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
  let maybe_status = sqlx::query_as!(
      TtsInferenceJobStatusRecord,
        r#"
SELECT
    jobs.token as job_token,

    jobs.status,
    jobs.attempt_count,
    jobs.on_success_result_token as maybe_result_token,
    results.public_bucket_wav_audio_path as maybe_public_bucket_wav_audio_path,

    jobs.model_token,
    tts.tts_model_type,
    tts.title,

    jobs.raw_inference_text,

    jobs.created_at,
    jobs.updated_at

FROM tts_inference_jobs as jobs
JOIN tts_models as tts
    ON tts.token = jobs.model_token
LEFT OUTER JOIN tts_results as results
    ON jobs.on_success_result_token = results.token

WHERE jobs.token = ?
        "#,
      tts_inference_job_token
    )
      .fetch_one(mysql_pool)
      .await; // TODO: This will return error if it doesn't exist

  match maybe_status {
    Ok(record) => Ok(Some(record)),
    Err(err) => match err {
      sqlx::Error::RowNotFound => Ok(None),
      _ => Err(anyhow!("tts job query error: {:?}", err)),
    }
  }
}
