use std::fmt;
use std::sync::Arc;

use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Json;
use actix_web::{web, HttpRequest, HttpResponse};

use crate::http_server::endpoints::app_state::components::get_user_locale::get_user_locale;
use crate::state::server_state::ServerState;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;

// =============== Success Response ===============

#[derive(Serialize, Default)]
pub struct DetectLocaleResponse {
  pub success: bool,
  /// Full BCP47 language tags
  pub full_language_tags: Vec<String>,
  /// Parsed out languages
  pub language_codes: Vec<String>,
}

// =============== Error Response ===============

#[derive(Debug, Serialize)]
pub enum DetectLocaleError {
  ServerError,
}

impl ResponseError for DetectLocaleError {
  fn status_code(&self) -> StatusCode {
    match *self {
      DetectLocaleError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for DetectLocaleError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

// =============== Handler ===============

pub async fn detect_locale_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
) -> Result<Json<DetectLocaleResponse>, DetectLocaleError> {
  let locale = get_user_locale(&http_request);

  Ok(Json(DetectLocaleResponse {
    success: true,
    full_language_tags: locale.full_language_tags,
    language_codes: locale.language_codes,
  }))
}
