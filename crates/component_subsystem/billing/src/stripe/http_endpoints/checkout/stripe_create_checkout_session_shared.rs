use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use crate::stripe::stripe_config::StripeConfig;
use log::error;
use std::collections::HashMap;
use stripe::{CheckoutSession, CheckoutSessionMode, CreateCheckoutSession, CreateCheckoutSessionLineItems, CreateCheckoutSessionPaymentIntentData, CreateCheckoutSessionSubscriptionData};
use crate::stripe::helpers::common_metadata_keys::{METADATA_EMAIL, METADATA_USER_TOKEN, METADATA_USERNAME};

// NB: These are "test" product IDs.
// TODO: Pass these in via request; validate via a dynamically dispatched trait callable that can do
//  whatever the calling codebase needs
pub const PRODUCT_FAKEYOU_BASIC_ID : &'static str = "prod_MMxi2J5y69VPbO";
pub const PRODUCT_FAKEYOU_BASIC_PRICE_ID : &'static str = "price_1LeDnKEU5se17MekVr1iYYNf";

pub const PRODUCT_ONE_TIME_PURCHASE_ID : &'static str = "prod_MPQ6nWJ4k6lJmw";
pub const PRODUCT_ONE_TIME_PURCHASE_PRICE_ID : &'static str = "price_1LgbG9EU5se17MekZIw95gEO";

/// Create a checkout session and return the URL
/// If anything fails, treat it as a 500 server error.
pub async fn stripe_create_checkout_session_shared(
  stripe_config: &StripeConfig,
  price_key: &str,
  user_token: Option<&str>,
) -> AnyhowResult<String> {

  let stripe_client = {
    let api_secret = stripe_config.secrets.secret_key
        .as_deref()
        .ok_or(anyhow!("API key not configured"))?;
    stripe::Client::new(api_secret)
  };

  let success_url  = stripe_config.checkout.success_url
      .as_deref()
      .ok_or(anyhow!("Checkout Success URL not configured"))?;

  let cancel_url = stripe_config.checkout.cancel_url
      .as_deref()
      .ok_or(anyhow!("Checkout Cancel URL not configured"))?;

  let (price_id, is_subscription) = match price_key {
    "subscription" => (PRODUCT_FAKEYOU_BASIC_PRICE_ID, true),
    "one-time" => (PRODUCT_ONE_TIME_PURCHASE_PRICE_ID, false),
    _ => return Err(anyhow!("wrong price key!")),
  };

  let checkout_session = {
    let mut params = CreateCheckoutSession::new(
      cancel_url,
      success_url,
    );



    /*


    Bind these:

    - customer.subscription.updated  - Sent when the subscription is successfully started, after the payment is confirmed.
                                       Also sent whenever a subscription is changed. For example, adding a coupon, applying a
                                       discount, adding an invoice item, and changing plans all trigger this event.

    - customer.subscription.deleted  - Sent when a customer’s subscription ends.

    - invoice.created  - Do I need to do anything !?


    - invoice.paid	  - Sent when the invoice is successfully paid.
                        You can provision access to your product when you receive this event and the
                        subscription status is active.
     */

    // `client_reference_id`
    // Stripe Docs:
    //   A unique string to reference the Checkout Session.
    //   This can be a customer ID, a cart ID, or similar, and can be used to reconcile the session
    //   with your internal systems.
    //
    // Our Notes:
    //   This gets reported back in the Checkout Session (and related webhooks) as
    //   `client_reference_id`. Passing the same ID on multiple checkouts does not unify or
    //   cross-correlate customers and only seems to be metadata for the checkout session itself.
    //   This is probably only useful for tracking checkout session engagement.
    //params.client_reference_id = Some("SOME_INTERNAL_ID");

    // `customer_email`
    // Stripe Docs:
    //   If provided, this value will be used when the Customer object is created. If not provided,
    //   customers will be asked to enter their email address. Use this parameter to prefill
    //   customer data if you already have an email on file. To access information about the
    //   customer once a session is complete, use the customer field.
    //
    // Our Notes:
    //   This does not look up previous customers with the same email and will not unify or
    //   cross-correlate customers. By default the field will be un-editable in the checkout flow
    //   if this is specified.
    //params.customer_email = Some("email@example.com");

    let mut metadata = HashMap::new();

    if let Some(token) = user_token {
      metadata.insert(METADATA_USER_TOKEN.to_string(), token.to_string());
      metadata.insert(METADATA_USERNAME.to_string(), token.to_string());
      metadata.insert(METADATA_EMAIL.to_string(), token.to_string());
    }

    // NB: This metadata attaches to Stripe's Checkout Session object.
    // This does not attach to the subscription or payment intent, which have their own metadata
    // objects. (TODO: Confirm this.)
    params.metadata = Some(metadata.clone());

    let mut metadata = HashMap::new();

    if let Some(token) = user_token {
      metadata.insert(METADATA_USER_TOKEN.to_string(), "U:SECOND_ID".to_string());
      metadata.insert(METADATA_USERNAME.to_string(), "U:SECOND_ID".to_string());
      metadata.insert(METADATA_EMAIL.to_string(), "U:SECOND_ID".to_string());
    }

    if is_subscription {
      // Subscription mode: Use Stripe Billing to set up fixed-price subscriptions.
      params.mode = Some(CheckoutSessionMode::Subscription);

      // NB: This metadata attaches to the subscription entity itself.
      // This cannot be used for non-subscription, one-off payments.
      // https://support.stripe.com/questions/using-metadata-with-checkout-sessions
      params.subscription_data = Some(CreateCheckoutSessionSubscriptionData {
        metadata,
        ..Default::default()
      });

    } else {
      // Payment mode: Accept one-time payments for cards, iDEAL, and more.
      params.mode = Some(CheckoutSessionMode::Payment);

      // NB: This metadata attaches to the payment_intent entity itself.
      // This cannot be used for subscriptions.
      // https://support.stripe.com/questions/using-metadata-with-checkout-sessions
      params.payment_intent_data = Some(CreateCheckoutSessionPaymentIntentData {
        metadata: metadata.clone(),
        ..Default::default()
      });
    }

    params.line_items = Some(vec![
      CreateCheckoutSessionLineItems {
        price: Some(price_id.to_string()),
        quantity: Some(1),
        ..Default::default()
      }
    ]);

    CheckoutSession::create(&stripe_client, params)
        .await
        .map_err(|e| {
          error!("Error: {:?}", e);
          anyhow!("error creating checkout session against Stripe")
        })?
  };

  checkout_session.url.ok_or(anyhow!("checkout session does not contain a URL"))
}
