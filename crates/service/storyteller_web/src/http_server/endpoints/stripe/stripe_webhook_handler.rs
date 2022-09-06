use actix_web::error::ResponseError;
use actix_web::error::UrlencodedError::ContentType;
use actix_web::http::{header, StatusCode};
use actix_web::web::{Bytes, Path};
use actix_web::{web, HttpResponse, HttpRequest};
use chrono::{DateTime, Utc};
use http_server_common::request::get_request_header_optional::get_request_header_optional;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use http_server_common::util::timer::MultiBenchmarkingTimer;
use log::{error, warn};
use reusable_types::entity_visibility::EntityVisibility;
use sqlx::MySqlPool;
use std::collections::HashMap;
use std::fmt;
use stripe::{EventObject, EventType, PaymentIntentStatus, Webhook};
use crate::http_server::endpoints::stripe::stripe_common::{get_customer_id, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SIGNING_SECRET_KEY};

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

  let webhook_payload = Webhook::construct_event(&webhook_payload, &stripe_signature, STRIPE_WEBHOOK_SIGNING_SECRET_KEY)
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
      // After the subscription signup succeeds, the customer returns to your website at the success_url,
      // which initiates a checkout.session.completed webhooks. When you receive a checkout.session.completed
      // event, you can provision the subscription. Continue to provision each month (if billing monthly) as
      // you receive invoice.paid events. If you receive an invoice.payment_failed event, notify your customer
      // and send them to the customer portal to update their payment method.
      if let EventObject::CheckoutSession(checkout_session) = webhook_payload.data.object {

        let stripe_checkout_id = checkout_session.id.to_string();

        // NB: We'll need this to send them to the "customer portal", which is how they can modify or cancel
        // their subscriptions.
        let maybe_stripe_customer_id  = checkout_session.customer
            .as_ref()
            .map(|c| get_customer_id(c));

        let maybe_user_token = checkout_session.metadata.get("user_token")
            .map(|t| t.to_string());

      }
    }
    EventType::InvoicePaid => {
      // https://stripe.com/docs/billing/subscriptions/webhooks#active-subscriptions :
      //
      // 1. A few days prior to renewal, your site receives an invoice.upcoming event at the webhook
      //    endpoint. You can listen for this event to add extra invoice items to the upcoming invoice.
      // 2. Your site receives an invoice.paid event.
      // 3. Your webhook endpoint finds the customer the payment was made for.
      // 4. Your webhook endpoint updates the customer’s access expiration date in your database to the
      //    appropriate date in the future (plus a day or two for leeway).
      //
      // https://stripe.com/docs/billing/subscriptions/webhooks :
      //
      // Sent when the invoice is successfully paid. You can provision access to your product when you
      // receive this event and the subscription status is active.
      if let EventObject::Invoice(invoice) = webhook_payload.data.object {
        let paid_status = invoice.status;
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
