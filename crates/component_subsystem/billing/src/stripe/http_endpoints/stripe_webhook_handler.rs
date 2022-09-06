use actix_web::error::ResponseError;
use actix_web::error::UrlencodedError::ContentType;
use actix_web::http::{header, StatusCode};
use actix_web::web::{Bytes, Path};
use actix_web::{web, HttpResponse, HttpRequest};
use chrono::{DateTime, Utc};
use crate::stripe::stripe_config::StripeConfig;
use crate::stripe::webhook_event_handlers::checkout_session_completed_handler::checkout_session_completed_handler;
use crate::stripe::webhook_event_handlers::invoice_paid_handler::invoice_paid_handler;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use http_server_common::request::get_request_header_optional::get_request_header_optional;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use http_server_common::util::timer::MultiBenchmarkingTimer;
use log::{error, warn};
use sqlx::MySqlPool;
use std::collections::HashMap;
use std::fmt;
use stripe::{EventObject, EventType, PaymentIntentStatus, Webhook};

#[derive(Serialize)]
pub struct StripeWebhookSuccessResponse {
  pub success: bool,
}

pub async fn stripe_webhook_handler(
  http_request: HttpRequest,
  request_body_bytes: Bytes,
  mysql_pool: web::Data<MySqlPool>,
  stripe_config: web::Data<StripeConfig>,
) -> Result<HttpResponse, StripeWebhookError>
{
  let secret_signing_key = stripe_config.secrets.secret_webhook_signing_key
      .as_deref()
      .ok_or(StripeWebhookError::ServerError)?;

  let stripe_signature = get_request_header_optional(&http_request, "Stripe-Signature")
      .unwrap_or_default();

  // NB: Treat the request payload as unstructured and defer to Stripe libraries.
  let webhook_payload = String::from_utf8(request_body_bytes.to_vec())
      .map_err(|err| {
        error!("Could not decode request body to stripe webhook!");
        StripeWebhookError::BadRequest
      })?;

  let webhook_payload = Webhook::construct_event(&webhook_payload, &stripe_signature, secret_signing_key)
      .map_err(|e| {
        error!("Could not decode stripe webhook: {:?}", e);
        StripeWebhookError::BadRequest
      })?;

  warn!("Event type: {:?}", webhook_payload.event_type);

  // CheckoutSessionCompleted
  // ChargeSucceeded
  // PaymentMethodAttached
  // CustomerCreated
  // CustomerUpdated
  // InvoiceCreated
  // InvoiceFinalized
  // CustomerSubscriptionCreated ------
  // InvoiceUpdated
  // CustomerSubscriptionUpdated -------
  // InvoicePaymentSucceeded
  // PaymentIntentSucceeded
  // PaymentIntentCreated

  // Events can be re-sent, so we need to make handling them idempotent.
  let stripe_event_id = webhook_payload.id.to_string();

  // NB: Whether this was test data or live data
  let is_production = webhook_payload.livemode;

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
        let _r = checkout_session_completed_handler(checkout_session)?;
      }
    }
    EventType::InvoiceCreated => {
      // TODO: We need to respond to this so we don't hold payments up by 72 hours!
      //  See: https://stripe.com/docs/billing/subscriptions/webhooks
    }
    EventType::InvoicePaid => {
      if let EventObject::Invoice(invoice) = webhook_payload.data.object {
        let _r = invoice_paid_handler(&invoice)?;
      }
    }
    EventType::InvoicePaymentFailed => {
    }
    EventType::PaymentIntentSucceeded => {
      if let EventObject::PaymentIntent(payment_intent) = webhook_payload.data.object {
      }
    }
    _ => {},
  }

  // let stripe_client = stripe::Client::new(STRIPE_SECRET_KEY);

  let response = StripeWebhookSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| StripeWebhookError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
