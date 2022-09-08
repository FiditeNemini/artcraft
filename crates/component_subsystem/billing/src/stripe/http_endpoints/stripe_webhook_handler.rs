use actix_web::error::ResponseError;
use actix_web::error::UrlencodedError::ContentType;
use actix_web::http::{header, StatusCode};
use actix_web::web::{Bytes, Path};
use actix_web::{web, HttpResponse, HttpRequest};
use chrono::{DateTime, Utc};
use crate::stripe::stripe_config::StripeConfig;
use crate::stripe::webhook_event_handlers::checkout_session::checkout_session_completed_handler::checkout_session_completed_handler;
use crate::stripe::webhook_event_handlers::customer::customer_created_handler::customer_created_handler;
use crate::stripe::webhook_event_handlers::customer::customer_deleted_handler::customer_deleted_handler;
use crate::stripe::webhook_event_handlers::customer::customer_updated_handler::customer_updated_handler;
use crate::stripe::webhook_event_handlers::customer_subscription::customer_subscription_created_handler::customer_subscription_created_handler;
use crate::stripe::webhook_event_handlers::customer_subscription::customer_subscription_deleted_handler::customer_subscription_deleted_handler;
use crate::stripe::webhook_event_handlers::customer_subscription::customer_subscription_updated_handler::customer_subscription_updated_handler;
use crate::stripe::webhook_event_handlers::invoice::invoice_paid_handler::invoice_paid_handler;
use crate::stripe::webhook_event_handlers::invoice::invoice_payment_failed::invoice_payment_failed_handler;
use crate::stripe::webhook_event_handlers::invoice::invoice_payment_succeeded_handler::invoice_payment_succeeded_handler;
use crate::stripe::webhook_event_handlers::invoice::invoice_updated_handler::invoice_updated_handler;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use http_server_common::request::get_request_header_optional::get_request_header_optional;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use http_server_common::util::timer::MultiBenchmarkingTimer;
use log::{error, info, warn};
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


  // Events seen (handled):
  //
  // CustomerSubscriptionCreated ------
  // CustomerSubscriptionUpdated -------
  // InvoicePaymentSucceeded
  // CustomerCreated
  // CustomerUpdated
  //
  // Events seen (not yet handled):
  //
  // CheckoutSessionCompleted
  // ChargeSucceeded
  // PaymentMethodAttached
  // InvoiceCreated
  // InvoiceFinalized
  // InvoiceUpdated
  // PaymentIntentSucceeded
  // PaymentIntentCreated

  // Events can be re-sent, so we need to make handling them idempotent.
  let stripe_event_id = webhook_payload.id.to_string();

  // NB: Whether this was test data or live data
  let is_production = webhook_payload.livemode;

  info!("Stripe webhook event type: {:?}", webhook_payload.event_type);

  let mut unhandled_event_type = false;

  // NB:
  // - "Webhook endpoints might occasionally receive the same event more than once."
  // - "Stripe does not guarantee delivery of events in the order in which they are generated."
  match webhook_payload.event_type {
    EventType::SubscriptionScheduleAborted => {}
    EventType::SubscriptionScheduleCanceled => {}
    EventType::SubscriptionScheduleCompleted => {}
    EventType::SubscriptionScheduleCreated => {}
    EventType::SubscriptionScheduleExpiring => {}
    EventType::SubscriptionScheduleReleased => {}
    EventType::SubscriptionScheduleUpdated => {}

    // =============== CHECKOUT SESSIONS ===============

    EventType::CheckoutSessionCompleted => {
      if let EventObject::CheckoutSession(checkout_session) = webhook_payload.data.object {
        let _r = checkout_session_completed_handler(checkout_session)?;
      }
    }

    // EventType::CheckoutSessionExpired => {}
    // EventType::CheckoutSessionAsyncPaymentFailed => {}
    // EventType::CheckoutSessionAsyncPaymentSucceeded => {}

    // =============== CUSTOMERS ===============

    EventType::CustomerCreated => {
      if let EventObject::Customer(customer) = webhook_payload.data.object {
        let _r = customer_created_handler(&customer)?;
      }
    }
    EventType::CustomerUpdated => {
      if let EventObject::Customer(customer) = webhook_payload.data.object {
        let _r = customer_updated_handler(&customer)?;
      }
    }
    EventType::CustomerDeleted => {
      if let EventObject::Customer(customer) = webhook_payload.data.object {
        let _r = customer_deleted_handler(&customer)?;
      }
    }

    // =============== CUSTOMER SUBSCRIPTIONS ===============

    EventType::CustomerSubscriptionCreated => {
      if let EventObject::Subscription(subscription) = webhook_payload.data.object {
        let _r = customer_subscription_created_handler(&subscription)?;
      }
    }
    EventType::CustomerSubscriptionUpdated => {
      if let EventObject::Subscription(subscription) = webhook_payload.data.object {
        let _r = customer_subscription_updated_handler(&subscription)?;
      }
    }
    EventType::CustomerSubscriptionDeleted => {
      if let EventObject::Subscription(subscription) = webhook_payload.data.object {
        let _r = customer_subscription_deleted_handler(&subscription)?;
      }
    }

    // EventType::CustomerSubscriptionPendingUpdateApplied => {}
    // EventType::CustomerSubscriptionPendingUpdateExpired => {}
    // EventType::CustomerSubscriptionTrialWillEnd => {}

    // =============== INVOICES ===============

    EventType::InvoiceCreated => {
      // TODO: We need to respond to this so we don't hold payments up by 72 hours!
      //  See: https://stripe.com/docs/billing/subscriptions/webhooks
    }
    EventType::InvoiceUpdated => {
      if let EventObject::Invoice(invoice) = webhook_payload.data.object {
        let _r = invoice_updated_handler(&invoice)?;
      }
    }
    EventType::InvoicePaid => {
      if let EventObject::Invoice(invoice) = webhook_payload.data.object {
        let _r = invoice_paid_handler(&invoice)?;
      }
    }
    EventType::InvoicePaymentSucceeded => {
      if let EventObject::Invoice(invoice) = webhook_payload.data.object {
        let _r = invoice_payment_succeeded_handler(&invoice)?;
      }
    }
    EventType::InvoicePaymentFailed => {
      if let EventObject::Invoice(invoice) = webhook_payload.data.object {
        let _r = invoice_payment_failed_handler(&invoice)?;
      }
    }

    // EventType::InvoiceDeleted => {}
    // EventType::InvoiceFinalizationFailed => {}
    // EventType::InvoiceFinalized => {}
    // EventType::InvoiceItemCreated => {}
    // EventType::InvoiceItemDeleted => {}
    // EventType::InvoiceItemUpdated => {}
    // EventType::InvoiceMarkedUncollectible => {}
    // EventType::InvoicePaymentActionRequired => {}
    // EventType::InvoiceSent => {}
    // EventType::InvoiceUpcoming => {}
    // EventType::InvoiceUpdated => {}
    // EventType::InvoiceVoided => {}

    // =============== PAYMENT INTENTS ===============

    EventType::PaymentIntentSucceeded => {
      if let EventObject::PaymentIntent(payment_intent) = webhook_payload.data.object {
      }
    }

    // EventType::PaymentIntentAmountCapturableUpdated => {}
    // EventType::PaymentIntentCanceled => {}
    // EventType::PaymentIntentCreated => {}
    // EventType::PaymentIntentPartiallyFunded => {}
    // EventType::PaymentIntentPaymentFailed => {}
    // EventType::PaymentIntentProcessing => {}
    // EventType::PaymentIntentRequiresAction => {}
    // EventType::PaymentIntentRequiresCapture => {}

    // =============== Ignored ===============

    // Ignoring these types:
    //   Account* (6),
    //   ApplicationFee* (2),
    //   BalanceAvailable (1),
    //   BillingPortal* (2),
    //   CapabilityCreated (1),
    //   Charge* (13),
    //   [CheckoutSession* handled above],
    //   Coupon* (3),
    //   CreditNote* (3),
    //   CustomerDiscount* (3),
    //   CustomerSource* (4),
    //   [CustomerSubscription* handled above],
    //   CreditTax* (3),
    //   FileCreated (1),
    //   IdentityVerification* (6),
    //   [Invoice* handled above],
    //   IssuingAuthorization* (3),
    //   IssuingCard* (2),
    //   IssuingCardholder* (2),
    //   IssuingDispute* (2),
    //   IssuingTransaction* (2),
    //   MandateUpdated (1),
    //   Order* (6),
    //   [PaymentIntent* handled above],
    //   PaymentLink* (2),
    //   PaymentMethod* (4),
    //   Payout* (5),
    //   Person* (3),
    //   Plan* (3),
    //   Price* (3),
    //   Product* (3),
    //   PromotionCode* (2),
    //   Quote* (4),
    //   RadarEarlyFraudWarning* (2),
    //   Recipient* (3),
    //   ReportingReport* (3),
    //   Review* (2),
    //   SetupIntent* (5),
    //   SigmaScheduledQueryRunCreated (1),
    //   Sku (3),
    //   Source* (7),
    //   TaxRate* (2),
    //   TerminalReader* (2),
    //   TestHelpersTestClock* (5),
    //   Topup* (5),
    //   Transfer* (5),

    _ => {
      unhandled_event_type = true;
    },
  }

  if unhandled_event_type {
    warn!("UNHANDLED STRIPE WEBHOOK EVENT TYPE: {:?}", webhook_payload.event_type);
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
