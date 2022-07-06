use anyhow::anyhow;
use chrono::{Utc, DateTime};
use log::warn;
use sqlx::MySqlPool;
use sqlx;

// TODO: Can probably just reuse another query.

pub struct TtsModelForInferenceRecord {
  pub model_token: String,
  pub tts_model_type: String,

  /// NB: text_pipeline_type may not always be present in the database.
  pub text_pipeline_type: Option<String>,

  pub maybe_default_pretrained_vocoder: Option<String>,

  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,

  pub title: String,
  pub private_bucket_hash: String,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
  pub mod_deleted_at: Option<DateTime<Utc>>,
  pub user_deleted_at: Option<DateTime<Utc>>,
}


#[derive(Clone, Debug)]
pub enum TtsModelForInferenceError {
  ModelNotFound,
  ModelDeleted,
  DatabaseError { reason: String },
}

impl std::fmt::Display for TtsModelForInferenceError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      TtsModelForInferenceError::ModelNotFound => write!(f, "ModelNotFound"),
      TtsModelForInferenceError::ModelDeleted => write!(f, "ModelDeleted"),
      TtsModelForInferenceError::DatabaseError { reason} =>
        write!(f, "Database error: {:?}", reason),
    }
  }
}

impl std::error::Error for TtsModelForInferenceError {}

pub async fn get_tts_model_for_inference(
  pool: &MySqlPool,
  model_token: &str
) -> Result<TtsModelForInferenceRecord, TtsModelForInferenceError>
{
  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
  let maybe_model = sqlx::query_as!(
      TtsModelForInferenceRecord,
        r#"
SELECT
    tts.token as model_token,
    tts.tts_model_type,
    tts.text_pipeline_type,
    tts.maybe_default_pretrained_vocoder,
    tts.creator_user_token,
    users.username as creator_username,
    users.display_name as creator_display_name,
    tts.title,
    tts.private_bucket_hash,
    tts.created_at,
    tts.updated_at,
    tts.user_deleted_at,
    tts.mod_deleted_at
FROM tts_models as tts
JOIN users
ON users.token = tts.creator_user_token
WHERE tts.token = ?
        "#,
      &model_token
    )
      .fetch_one(pool)
      .await; // TODO: This will return error if it doesn't exist

  let model : TtsModelForInferenceRecord = match maybe_model {
    Ok(model) => model,
    Err(err) => {
      match err {
        sqlx::Error::RowNotFound => {
          return Err(TtsModelForInferenceError::ModelNotFound);
        },
        _ => {
          warn!("tts model query error: {:?}", err);
          return Err(TtsModelForInferenceError::DatabaseError {
            reason: format!("Mysql error: {:?}", err)
          });
        }
      }
    }
  };

  if model.mod_deleted_at.is_some() || model.user_deleted_at.is_some() {
    return Err(TtsModelForInferenceError::ModelDeleted);
  }

  Ok(model)
}
