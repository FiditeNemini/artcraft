use container_common::anyhow_result::AnyhowResult;
use crate::stripe::helpers::common_metadata_keys::METADATA_USER_TOKEN;
use crate::stripe::helpers::expand_customer_id::expand_customer_id;
use crate::stripe::helpers::expand_product_id::expand_product_id;
use crate::stripe::helpers::expand_subscription_id::expand_subscription_id;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;
use log::error;
use stripe::{Invoice, InvoiceLineItemType, InvoiceStatus};

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

  let invoice_id = invoice.id.to_string();

  let is_production= invoice.livemode.unwrap_or(false);

  let paid_status = invoice.status;

  match invoice.status {
    Some(InvoiceStatus::Paid) => {
      // Stripe Docs: Your webhook endpoint updates the customer’s access expiration date in your
      // database to the appropriate date in the future (plus a day or two for leeway).

      error!(" ======================= INVOICE IS PAID ===========================");
    }
    _ => {},
    //None => {}
    //Some(status) => match status {
    //  InvoiceStatus::Deleted => {}
    //  InvoiceStatus::Draft => {}
    //  InvoiceStatus::Open => {}
    //  InvoiceStatus::Paid => {}
    //  InvoiceStatus::Uncollectible => {}
    //  InvoiceStatus::Void => {}
    //}
  }

  error!(" -> invoice data lines = {}", invoice.lines.data.len());

  /*
    ======================= INVOICE IS PAID ===========================
  -> invoice data lines = 1
    -> subscription = "sub_1Lgk5BEU5se17MekYFmwTX6v"
    -> subscription_item = "si_MPZDG0ikIjHnLJ"
    -> invoice_item = ""
    -> price.id = "price_1LeDnKEU5se17MekVr1iYYNf"
    -> USER_TOKEN = "U:SECOND_ID"
    -> type_ = Subscription
    --> SUBSCRIPTION <--

   */
  invoice.lines.data.iter().for_each(|line| {
    error!("   -> subscription = {:?}", line.subscription.as_ref().map(|s| s.clone()).unwrap_or("".to_string()));
    error!("   -> subscription_item = {:?}", line.subscription_item.as_ref().map(|s| s.clone()).unwrap_or("".to_string()));
    error!("   -> invoice_item = {:?}", line.invoice_item.as_ref().map(|s| s.to_string()).unwrap_or("".to_string()));
    error!("   -> price.id = {:?}", line.price.as_ref().map(|price| price.id.to_string()).unwrap_or("".to_string()));
    error!("   -> product.id = {:?}", line.price.as_ref().map(|price| price.product.clone()));
    error!("   -> USER_TOKEN = {:?}", line.metadata.get(METADATA_USER_TOKEN).map(|d| d.to_string()).unwrap_or("".to_string()));
    error!("   -> type_ = {:?}", line.type_);
    match line.type_ {
      InvoiceLineItemType::InvoiceItem => {
        error!("   --> INVOICE ITEM <--   ");
      }
      InvoiceLineItemType::Subscription => {
        error!("   --> SUBSCRIPTION <--   ");
      }
    }
  });

  let maybe_stripe_subscription_id = invoice.subscription
      .as_ref()
      .map(|s| expand_subscription_id(s));

  // NB: We'll need this to send them to the "customer portal", which is how they can modify
  // or cancel their subscriptions.
  let maybe_stripe_customer_id  = invoice.customer
      .as_ref()
      .map(|c| expand_customer_id(c));

  // NB: Our internal user token.
  let maybe_user_token = invoice.metadata.get(METADATA_USER_TOKEN)
      .map(|t| t.to_string());

  error!(">>> invoice.paid: {:?}, {:?}, {:?}, {:?}, {:?}",
    invoice_id,
    paid_status,
    maybe_stripe_customer_id,
    maybe_stripe_subscription_id,
    maybe_user_token
  );

  Ok(())
}