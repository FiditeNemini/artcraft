use log::{error, warn};
use container_common::anyhow_result::AnyhowResult;
use crate::stripe::helpers::expand_customer_id::expand_customer_id;
use stripe::CheckoutSession;
use crate::stripe::helpers::common_metadata_keys::METADATA_USER_TOKEN;
use crate::stripe::webhook_event_handlers::stripe_webhook_error::StripeWebhookError;

// After the subscription signup succeeds, the customer returns to your website at the success_url,
// which initiates a checkout.session.completed webhooks. When you receive a checkout.session.completed
// event, you can provision the subscription. Continue to provision each month (if billing monthly) as
// you receive invoice.paid events. If you receive an invoice.payment_failed event, notify your customer
// and send them to the customer portal to update their payment method.
pub fn checkout_session_completed_handler(checkout_session: CheckoutSession) -> Result<(), StripeWebhookError> {

  let stripe_checkout_id = checkout_session.id.to_string();

  // NB: We'll need this to send them to the "customer portal", which is how they can modify or cancel
  // their subscriptions.
  let maybe_stripe_customer_id  = checkout_session.customer
      .as_ref()
      .map(|c| expand_customer_id(c));

  // NB: Our internal user token.
  let maybe_user_token = checkout_session.metadata.get(METADATA_USER_TOKEN)
      .map(|t| t.to_string());

  error!(">>> checkout.session.completed: {:?}, {:?}", maybe_stripe_customer_id, maybe_user_token);

  Ok(())
}
