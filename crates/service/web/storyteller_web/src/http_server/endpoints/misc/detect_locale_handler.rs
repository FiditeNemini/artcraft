use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use log::{log, warn};

use http_server_common::request::get_request_header_optional::get_request_header_optional;
use http_server_common::request::parse_accept_language::parse_accept_language;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;

use crate::state::server_state::ServerState;

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

pub const FORCE_LOCALE_COOKIE_HEADER_NAME : &str = "force-locale";

pub async fn detect_locale_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, DetectLocaleError> {

  let mut maybe_accept_language =
      get_request_header_optional(&http_request, "accept-language");

  if let Some(cookie) = http_request.cookie(FORCE_LOCALE_COOKIE_HEADER_NAME) {
    warn!("Overriding default accept language with custom value (from cookie)");
    maybe_accept_language = Some(cookie.value().to_string());

  } else if let Some(header) = get_request_header_optional(&http_request, FORCE_LOCALE_COOKIE_HEADER_NAME) {
    warn!("Overriding default accept language with custom value (from header)");
    maybe_accept_language = Some(header);
  }

  let accept_language = maybe_accept_language.unwrap_or("en".to_string());

  let mut response = DetectLocaleResponse::default();
  response.success = true;

  let language_tags = parse_accept_language(&accept_language);

  for language_tag in language_tags.iter() {
    response.full_language_tags.push(language_tag.to_string());
    response.language_codes.push(language_tag.primary_language().to_string());
  }

  let body = serde_json::to_string(&response)
      .map_err(|e| DetectLocaleError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
