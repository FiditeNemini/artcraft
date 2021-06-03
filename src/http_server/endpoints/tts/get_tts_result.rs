use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use chrono::{DateTime, Utc};
use crate::AnyhowResult;
use crate::common_queries::sessions::create_session_for_user;
use crate::http_server::endpoints::users::create_account::CreateAccountError::{BadInput, ServerError, UsernameTaken, EmailTaken};
use crate::http_server::endpoints::users::login::LoginSuccessResponse;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::session_checker::SessionRecord;
use crate::server_state::ServerState;
use crate::util::random_crockford_token::random_crockford_token;
use crate::validations::passwords::validate_passwords;
use crate::validations::username::validate_username;
use derive_more::{Display, Error};
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct GetTtsResultPathInfo {
  token: String,
}

#[derive(Serialize)]
pub struct TtsResultRecordForResponse {
  pub tts_result_token: String,

  pub tts_model_token: String,
  pub inference_text: String,

  pub maybe_creator_user_token: Option<String>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,
  pub maybe_creator_gravatar_hash: Option<String>,

  pub maybe_model_creator_user_token: Option<String>,
  pub maybe_model_creator_username: Option<String>,
  pub maybe_model_creator_display_name: Option<String>,
  pub maybe_model_creator_gravatar_hash: Option<String>,

  pub public_bucket_wav_audio_path: String,
  pub public_bucket_spectrogram_path: String,

  pub file_size_bytes: u32,
  pub duration_millis: u32,

  //pub is_mod_hidden_from_public: bool, // converted
  //pub model_is_mod_approved: bool, // converted
  //pub maybe_mod_user_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct GetTtsResultSuccessResponse {
  pub success: bool,
  pub result: TtsResultRecordForResponse,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
}

#[derive(Debug, Display)]
pub enum GetTtsResultError {
  ServerError,
}

pub struct RawTtsResultRecord {
  pub tts_result_token: String, // from field `tts_results.token`

  pub tts_model_token: String,
  pub inference_text: String,

  pub maybe_creator_user_token: Option<String>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,
  pub maybe_creator_gravatar_hash: Option<String>,

  pub maybe_model_creator_user_token: Option<String>,
  pub maybe_model_creator_username: Option<String>,
  pub maybe_model_creator_display_name: Option<String>,
  pub maybe_model_creator_gravatar_hash: Option<String>,

  pub public_bucket_wav_audio_path: String,
  pub public_bucket_spectrogram_path: String,

  pub file_size_bytes: i32,
  pub duration_millis: i32,

  //pub is_mod_hidden_from_public: i8, // needs convert
  //pub model_is_mod_approved: i8, // needs convert
  //pub maybe_mod_user_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

impl ResponseError for GetTtsResultError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetTtsResultError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      GetTtsResultError::ServerError => "server error".to_string(),
    };

    let response = ErrorResponse {
      success: false,
      error_reason,
    };

    let body = match serde_json::to_string(&response) {
      Ok(json) => json,
      Err(_) => "{}".to_string(),
    };

    HttpResponseBuilder::new(self.status_code())
      .set_header(header::CONTENT_TYPE, "application/json")
      .body(body)
  }
}

pub async fn get_tts_inference_result_handler(
  http_request: HttpRequest,
  path: Path<GetTtsResultPathInfo>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, GetTtsResultError>
{
  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
  let maybe_result = sqlx::query_as!(
      RawTtsResultRecord,
        r#"
SELECT
    tts_results.token as tts_result_token,

    tts_results.model_token as tts_model_token,
    tts_results.inference_text,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,
    users.email_gravatar_hash as maybe_creator_gravatar_hash,

    model_users.token as maybe_model_creator_user_token,
    model_users.username as maybe_model_creator_username,
    model_users.display_name as maybe_model_creator_display_name,
    model_users.email_gravatar_hash as maybe_model_creator_gravatar_hash,

    tts_results.public_bucket_wav_audio_path,
    tts_results.public_bucket_spectrogram_path,

    tts_results.file_size_bytes,
    tts_results.duration_millis,
    tts_results.created_at,
    tts_results.updated_at

FROM tts_results
LEFT OUTER JOIN tts_models
  ON tts_results.model_token = tts_models.token
LEFT OUTER JOIN users
  ON tts_results.maybe_creator_user_token = users.token
LEFT OUTER JOIN users as model_users
  ON tts_models.creator_user_token = model_users.token
WHERE
    tts_results.deleted_at IS NULL
    AND tts_results.token = ?
        "#,
      &path.token
    )
    .fetch_one(&server_state.mysql_pool)
    .await; // TODO: This will return error if it doesn't exist

  let ir : RawTtsResultRecord = match maybe_result {
    Ok(result) => result,
    Err(err) => {
      match err {
        RowNotFound => {
          return Err(GetTtsResultError::ServerError);
        },
        _ => {
          warn!("tts inference result query error: {:?}", err);
          return Err(GetTtsResultError::ServerError);
        }
      }
    }
  };

  let result_for_response = TtsResultRecordForResponse {
    tts_result_token: ir.tts_result_token.clone(),

    tts_model_token: ir.tts_model_token.clone(),
    inference_text: ir.inference_text.clone(),

    maybe_creator_user_token: ir.maybe_creator_user_token.clone(),
    maybe_creator_username: ir.maybe_creator_username.clone(),
    maybe_creator_display_name: ir.maybe_creator_display_name.clone(),
    maybe_creator_gravatar_hash: ir.maybe_creator_gravatar_hash.clone(),

    maybe_model_creator_user_token: ir.maybe_model_creator_user_token.clone(),
    maybe_model_creator_username: ir.maybe_model_creator_username.clone(),
    maybe_model_creator_display_name: ir.maybe_model_creator_display_name.clone(),
    maybe_model_creator_gravatar_hash: ir.maybe_model_creator_gravatar_hash.clone(),

    //is_mod_hidden_from_public: if ir.is_mod_hidden_from_public == 0 { false } else { true },
    //model_is_mod_approved: if ir.model_is_mod_approved == 0 { false } else { true },

    public_bucket_wav_audio_path: ir.public_bucket_wav_audio_path.clone(),
    public_bucket_spectrogram_path: ir.public_bucket_spectrogram_path.clone(),

    file_size_bytes: if ir.file_size_bytes > 0 { ir.file_size_bytes as u32 } else { 0 },
    duration_millis: if ir.duration_millis > 0 { ir.duration_millis as u32 } else { 0 },

    created_at: ir.created_at.clone(),
    updated_at: ir.updated_at.clone(),
  };

  let response = GetTtsResultSuccessResponse {
    success: true,
    result: result_for_response,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| GetTtsResultError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
