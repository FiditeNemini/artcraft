use actix_web::error::ResponseError;
use actix_web::error::UrlencodedError::ContentType;
use actix_web::http::{header, StatusCode};
use actix_web::web::{Bytes, Path};
use actix_web::{web, HttpResponse, HttpRequest};
use chrono::{DateTime, Utc};
use crate::http_server::endpoints::stripe::stripe_common::{PRODUCT_FAKEYOU_BASIC_PRICE_ID, STRIPE_SECRET_KEY};
use http_server_common::request::get_request_header_optional::get_request_header_optional;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use http_server_common::util::timer::MultiBenchmarkingTimer;
use log::{error, warn};
use reusable_types::entity_visibility::EntityVisibility;
use sqlx::MySqlPool;
use std::collections::HashMap;
use std::fmt;
use stripe::{EventObject, EventType, Webhook};

#[derive(Serialize)]
pub struct StripeWebhookSuccessResponse {
  pub success: bool,
}

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

pub async fn stripe_webhook_handler(
  http_request: HttpRequest,
  request_body_bytes: Bytes,
  mysql_pool: web::Data<MySqlPool>,
) -> Result<HttpResponse, StripeWebhookError>
{
  let stripe_signature = get_request_header_optional(&http_request, "Stripe-Signature")
      .unwrap_or_default();

  warn!("Signature: {}", stripe_signature);

  // NB: Treat the request payload as unstructured and defer to Stripe libraries.
  let webhook_payload = String::from_utf8(request_body_bytes.to_vec())
      .map_err(|err| {
        error!("Could not decode request body to stripe webhook!");
        StripeWebhookError::BadRequest
      })?;

  let webhook_payload = Webhook::construct_event(&webhook_payload, &stripe_signature, STRIPE_SECRET_KEY)
      .map_err(|e| {
        error!("Could not decode stripe webhook: {:?}", e);
        StripeWebhookError::BadRequest
      })?;

  warn!("Event type: {:?}", webhook_payload.event_type);

  match webhook_payload.event_type {
    EventType::SubscriptionScheduleAborted => {}
    EventType::SubscriptionScheduleCanceled => {}
    EventType::SubscriptionScheduleCompleted => {}
    EventType::SubscriptionScheduleCreated => {}
    EventType::SubscriptionScheduleExpiring => {}
    EventType::SubscriptionScheduleReleased => {}
    EventType::SubscriptionScheduleUpdated => {}
    EventType::CheckoutSessionCompleted => {
      if let EventObject::CheckoutSession(checkout_session) = webhook_payload.data.object {
      }
    }
    EventType::PaymentIntentSucceeded => {
      if let EventObject::PaymentIntent(payment_intent) = webhook_payload.data.object {
      }
    }
    _ => {},
  }

  let stripe_client = stripe::Client::new(STRIPE_SECRET_KEY);

  let response = StripeWebhookSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| StripeWebhookError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
