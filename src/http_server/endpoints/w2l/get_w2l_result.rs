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
pub struct GetW2lResultPathInfo {
  token: String,
}

#[derive(Serialize)]
pub struct W2lResultRecordForResponse {
  pub w2l_result_token: String,
  pub maybe_w2l_template_token: Option<String>,
  pub maybe_tts_inference_result_token: Option<String>,

  pub template_type: Option<String>,
  pub template_title: Option<String>,

  pub maybe_creator_user_token: Option<String>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,

  pub file_size_bytes: u32,
  pub frame_width: u32,
  pub frame_height: u32,
  pub duration_millis: u32,

  //pub is_mod_hidden_from_public: bool, // converted
  //pub template_is_mod_approved: bool, // converted
  //pub maybe_mod_user_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct GetW2lResultSuccessResponse {
  pub success: bool,
  pub result: W2lResultRecordForResponse,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
}

#[derive(Debug, Display)]
pub enum GetW2lResultError {
  ServerError,
}

pub struct RawW2lResultRecord {
  pub w2l_result_token: String, // from field `w2l_results.token`

  pub maybe_w2l_template_token: Option<String>,
  pub maybe_tts_inference_result_token: Option<String>,

  pub template_type: Option<String>,
  pub template_title: Option<String>, // from field `w2l_templates.title`

  pub maybe_creator_user_token: Option<String>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,

  pub file_size_bytes: i32,
  pub frame_width: i32,
  pub frame_height: i32,
  pub duration_millis: i32,

  //pub is_mod_hidden_from_public: i8, // needs convert
  //pub template_is_mod_approved: i8, // needs convert
  //pub maybe_mod_user_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

impl ResponseError for GetW2lResultError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetW2lResultError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      GetW2lResultError::ServerError => "server error".to_string(),
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

pub async fn get_w2l_inference_result_handler(
  http_request: HttpRequest,
  path: Path<GetW2lResultPathInfo>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, GetW2lResultError>
{
  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
  let maybe_result = sqlx::query_as!(
      RawW2lResultRecord,
        r#"
SELECT
    w2l_results.token as w2l_result_token,
    w2l_results.maybe_tts_inference_result_token,

    w2l_templates.token as maybe_w2l_template_token,
    w2l_templates.template_type,
    w2l_templates.title as template_title,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,

    w2l_results.file_size_bytes,
    w2l_results.frame_width,
    w2l_results.frame_height,
    w2l_results.duration_millis,
    w2l_results.created_at,
    w2l_results.updated_at

FROM w2l_results
LEFT OUTER JOIN w2l_templates
  ON w2l_results.maybe_w2l_template_token = w2l_templates.token
LEFT OUTER JOIN users
  ON w2l_results.maybe_creator_user_token = users.token
WHERE
    w2l_results.deleted_at IS NULL
    AND w2l_results.token = ?
        "#,
      &path.token
    )
    .fetch_one(&server_state.mysql_pool)
    .await; // TODO: This will return error if it doesn't exist

  let ir : RawW2lResultRecord = match maybe_result {
    Ok(result) => result,
    Err(err) => {
      match err {
        RowNotFound => {
          return Err(GetW2lResultError::ServerError);
        },
        _ => {
          warn!("w2l inference result query error: {:?}", err);
          return Err(GetW2lResultError::ServerError);
        }
      }
    }
  };

  let result_for_response = W2lResultRecordForResponse {
    w2l_result_token: ir.w2l_result_token.clone(),
    maybe_w2l_template_token: ir.maybe_w2l_template_token.clone(),
    maybe_tts_inference_result_token: ir.maybe_tts_inference_result_token.clone(),

    template_type: ir.template_type.clone(),
    template_title: ir.template_title.clone(),

    maybe_creator_user_token: ir.maybe_creator_user_token.clone(),
    maybe_creator_username: ir.maybe_creator_username.clone(),
    maybe_creator_display_name: ir.maybe_creator_display_name.clone(),
    //is_mod_hidden_from_public: if ir.is_mod_hidden_from_public == 0 { false } else { true },
    //template_is_mod_approved: if ir.template_is_mod_approved == 0 { false } else { true },

    file_size_bytes: if ir.file_size_bytes > 0 { ir.file_size_bytes as u32 } else { 0 },
    frame_width: if ir.frame_width > 0 { ir.frame_width as u32 } else { 0 },
    frame_height: if ir.frame_height  > 0 { ir.frame_height as u32 } else { 0 },
    duration_millis: if ir.duration_millis > 0 { ir.duration_millis as u32 } else { 0 },

    created_at: ir.created_at.clone(),
    updated_at: ir.updated_at.clone(),
  };

  let response = GetW2lResultSuccessResponse {
    success: true,
    result: result_for_response,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| GetW2lResultError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
