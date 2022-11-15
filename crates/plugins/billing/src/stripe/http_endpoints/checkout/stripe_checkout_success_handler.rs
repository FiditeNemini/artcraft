use actix_web::error::ResponseError;
use actix_web::error::UrlencodedError::ContentType;
use actix_web::http::{header, StatusCode};
use actix_web::web::Path;
use actix_web::{web, HttpResponse, HttpRequest};
use chrono::{DateTime, Utc};
use http_server_common::request::get_request_header_optional::get_request_header_optional;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::{error, warn};
use sqlx::MySqlPool;
use std::collections::HashMap;
use std::fmt;

#[derive(Serialize)]
pub struct CheckoutSessionSuccessHandlerSuccessResponse {
  pub success: bool,
}

#[derive(Debug, Serialize)]
pub enum CheckoutSessionSuccessHandlerError {
  ServerError,
}

impl ResponseError for CheckoutSessionSuccessHandlerError {
  fn status_code(&self) -> StatusCode {
    match *self {
      CheckoutSessionSuccessHandlerError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for CheckoutSessionSuccessHandlerError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn stripe_checkout_success_handler(
  http_request: HttpRequest,
  mysql_pool: web::Data<MySqlPool>,
) -> Result<HttpResponse, CheckoutSessionSuccessHandlerError>
{
  let response = CheckoutSessionSuccessHandlerSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| CheckoutSessionSuccessHandlerError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
