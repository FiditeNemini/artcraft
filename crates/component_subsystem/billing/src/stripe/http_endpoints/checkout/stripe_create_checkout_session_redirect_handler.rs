use actix_web::error::ResponseError;
use actix_web::error::UrlencodedError::ContentType;
use actix_web::http::{header, StatusCode};
use actix_web::web::Path;
use actix_web::{web, HttpResponse, HttpRequest};
use chrono::{DateTime, Utc};
use crate::stripe::http_endpoints::checkout::stripe_create_checkout_session_shared::stripe_create_checkout_session_shared;
use crate::stripe::stripe_config::StripeConfig;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::{error, warn};
use sqlx::MySqlPool;
use std::collections::HashMap;
use std::fmt;
use stripe::{CheckoutSession, CheckoutSessionMode, CreateCheckoutSession, CreateCheckoutSessionLineItems};

#[derive(Serialize)]
pub struct CreateCheckoutSessionSuccessResponse {
  pub success: bool,
}

#[derive(Debug, Serialize)]
pub enum CreateCheckoutSessionError {
  ServerError,
}

impl ResponseError for CreateCheckoutSessionError {
  fn status_code(&self) -> StatusCode {
    match *self {
      CreateCheckoutSessionError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for CreateCheckoutSessionError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn stripe_create_checkout_session_redirect_handler(
  _http_request: HttpRequest,
  _mysql_pool: web::Data<MySqlPool>,
  stripe_config: web::Data<StripeConfig>,
) -> Result<HttpResponse, CreateCheckoutSessionError>
{
  let user_token = Some("U:TEST");

  let url = stripe_create_checkout_session_shared(&stripe_config, user_token)
      .await
      .map_err(|err| {
        error!("Error creating Stripe checkout session: {:?}", err);
        CreateCheckoutSessionError::ServerError
      })?;

  Ok(HttpResponse::Found()
      .append_header((header::LOCATION, url))
      .finish())
}
