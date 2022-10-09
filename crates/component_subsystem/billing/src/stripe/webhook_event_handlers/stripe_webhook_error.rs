//! Returned by the webhook endpoint, but also dispatched event handler functions.

use actix_web::http::StatusCode;
use actix_web::{HttpResponse, ResponseError};
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use std::fmt;

#[derive(Debug, Serialize)]
pub enum StripeWebhookError {
  BadRequest,
  ServerError,
}

impl ResponseError for StripeWebhookError {
  fn status_code(&self) -> StatusCode {
    match *self {
      StripeWebhookError::BadRequest => StatusCode::BAD_REQUEST,
      StripeWebhookError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for StripeWebhookError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

