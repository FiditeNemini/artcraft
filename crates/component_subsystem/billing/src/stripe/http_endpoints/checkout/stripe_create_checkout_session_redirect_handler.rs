use actix_web::error::ResponseError;
use actix_web::error::UrlencodedError::ContentType;
use actix_web::http::{header, StatusCode};
use actix_web::web::{Path, Query};
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
use crate::stripe::traits::internal_user_lookup::InternalUserLookup;

// =============== Request ===============

#[derive(Deserialize)]
pub struct CreateCheckoutSessionRequest {
  price_key: Option<String>,
}

// =============== Error Response ===============

#[derive(Debug, Serialize)]
pub enum CreateCheckoutSessionError {
  NotAuthorizedError,
  ServerError,
}

impl ResponseError for CreateCheckoutSessionError {
  fn status_code(&self) -> StatusCode {
    match *self {
      CreateCheckoutSessionError::NotAuthorizedError => StatusCode::UNAUTHORIZED,
      CreateCheckoutSessionError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
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
  http_request: HttpRequest,
  request: Query<CreateCheckoutSessionRequest>,
  stripe_config: web::Data<StripeConfig>,
  mysql_pool: web::Data<MySqlPool>,
  internal_user_lookup: web::Data<dyn InternalUserLookup>,
) -> Result<HttpResponse, CreateCheckoutSessionError>
{
  let price_key = request.price_key.as_deref().unwrap_or("unknown");

  let maybe_user_metadata  = internal_user_lookup
      .lookup_user_from_http_request(&http_request, &mysql_pool)
      .await
      .map_err(|err| {
        error!("Error looking up user: {:?}", err);
        CreateCheckoutSessionError::ServerError // NB: This was probably *our* fault.
      })?;

  // NB: Our integration relies on an internal user token being present.
  let user_metadata = match maybe_user_metadata {
    None => return Err(CreateCheckoutSessionError::NotAuthorizedError),
    Some(user_metadata) => user_metadata,
  };

  if user_metadata.user_token.is_none() {
    return Err(CreateCheckoutSessionError::NotAuthorizedError);
  }

  let url = stripe_create_checkout_session_shared(
    &stripe_config,
    price_key,
    Some(&user_metadata))
      .await
      .map_err(|err| {
        error!("Error creating Stripe checkout session: {:?}", err);
        CreateCheckoutSessionError::ServerError
      })?;

  Ok(HttpResponse::Found()
      .append_header((header::LOCATION, url))
      .finish())
}
