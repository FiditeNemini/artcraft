use container_common::anyhow_result::AnyhowResult;
use crate::stripe::helpers::expand_customer_id::expand_customer_id;
use log::warn;
use stripe::Invoice;
use crate::stripe::helpers::common_metadata_keys::METADATA_USER_TOKEN;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;

// Handle event type: 'invoice.paid'
//
// https://stripe.com/docs/billing/subscriptions/webhooks :
//
// Sent when the invoice is successfully paid. You can provision access to your product when you
// receive this event and the subscription `status` is `active`.
//
// https://stripe.com/docs/billing/subscriptions/webhooks#active-subscriptions :
//
// 1. A few days prior to renewal, your site receives an invoice.upcoming event at the webhook
//    endpoint. You can listen for this event to add extra invoice items to the upcoming invoice.
// 2. Your site receives an invoice.paid event.
// 3. Your webhook endpoint finds the customer the payment was made for.
// 4. Your webhook endpoint updates the customer’s access expiration date in your database to the
//    appropriate date in the future (plus a day or two for leeway).
//
pub fn invoice_paid_handler(invoice: &Invoice) -> Result<(), StripeWebhookError> {

  let paid_status = invoice.status;

  // NB: We'll need this to send them to the "customer portal", which is how they can modify
  // or cancel their subscriptions.
  let maybe_stripe_customer_id  = invoice.customer
      .as_ref()
      .map(|c| expand_customer_id(c));

  // NB: Our internal user token.
  let maybe_user_token = invoice.metadata.get(METADATA_USER_TOKEN)
      .map(|t| t.to_string());

  warn!(">>> invoice.paid: {:?}, {:?}, {:?}", paid_status, maybe_stripe_customer_id, maybe_user_token);

  Ok(())
}