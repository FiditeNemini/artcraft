use actix_http::StatusCode;
use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use log::error;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use crate::stripe::traits::internal_user_lookup::InternalUserLookup;

// =============== Success Response ===============

#[derive(Serialize)]
pub struct SuccessResponse {
  pub success: bool,
  pub maybe_loyalty_program: Option<String>,
  pub active_subscriptions: Vec<SubscriptionProductKey>,
}

#[derive(Serialize)]
pub struct SubscriptionProductKey {
  pub namespace: String,
  pub product_slug: String,
}

// =============== Error Response ===============

#[derive(Debug, Serialize, Eq, PartialEq, Copy, Clone)]
pub enum EndpointError {
  InvalidSession,
  ServerError,
}

impl ResponseError for EndpointError {
  fn status_code(&self) -> StatusCode {
    match *self {
      EndpointError::InvalidSession => StatusCode::UNAUTHORIZED,
      EndpointError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl std::fmt::Display for EndpointError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn list_active_user_subscriptions_handler(
  http_request: HttpRequest,
  internal_user_lookup: web::Data<dyn InternalUserLookup>,
) -> Result<HttpResponse, EndpointError>
{
  let maybe_user_metadata = internal_user_lookup
      .lookup_user_from_http_request(&http_request)
      .await
      .map_err(|err| {
        error!("Error looking up user: {:?}", err);
        EndpointError::ServerError // NB: This was probably *our* fault.
      })?;

  // NB: Our integration relies on an internal user token being present.
  let user_metadata = match maybe_user_metadata {
    None => return Err(EndpointError::InvalidSession),
    Some(user_metadata) => user_metadata,
  };

  let response = SuccessResponse {
    success: true,
    maybe_loyalty_program: user_metadata.maybe_loyalty_program_key,
    active_subscriptions: user_metadata.existing_subscription_keys
        .into_iter()
        .map(|sub| SubscriptionProductKey {
          namespace: sub.internal_subscription_namespace,
          product_slug: sub.internal_subscription_product_slug,
        })
        .collect(),
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| EndpointError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}