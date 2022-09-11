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

     Stripe webhook event type: PaymentIntentCreated
      UNHANDLED STRIPE WEBHOOK EVENT TYPE: PaymentIntentCreated

      [-] 127.0.0.1:54490 "POST /stripe/webhook HTTP/1.1" 200 16 "-" "Stripe/1.0 (+https://stripe.com/docs/webhooks)" 0.003373

      Stripe webhook event type: CustomerCreated

      >>> customer.created: "cus_MPQxICCzeD8wKm", None
      [-] 127.0.0.1:54492 "POST /stripe/webhook HTTP/1.1" 200 16 "-" "Stripe/1.0 (+https://stripe.com/docs/webhooks)" 0.002464
      Stripe webhook event type: PaymentIntentSucceeded

      [-] 127.0.0.1:54492 "POST /stripe/webhook HTTP/1.1" 200 16 "-" "Stripe/1.0 (+https://stripe.com/docs/webhooks)" 0.003981
      Stripe webhook event type: ChargeSucceeded
      UNHANDLED STRIPE WEBHOOK EVENT TYPE: ChargeSucceeded

      [-] 127.0.0.1:54492 "POST /stripe/webhook HTTP/1.1" 200 16 "-" "Stripe/1.0 (+https://stripe.com/docs/webhooks)" 0.002594
      Stripe webhook event type: CheckoutSessionCompleted

      >>> checkout.session.completed: Some("cus_MPQxICCzeD8wKm"), None
      [-] 127.0.0.1:54492 "POST /stripe/webhook HTTP/1.1" 200 16 "-" "Stripe/1.0 (+https://stripe.com/docs/webhooks)" 0.002465
      [-] 127.0.0.1:54494 "GET /stripe/checkout/success HTTP/1.1" 200 16 "-" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:104.0) Gecko/20100101 Firefox/104.0" 0.000522



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
    params.client_reference_id = Some("U:SOME_INTERNAL_REFERENCE_ID");

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
    params.customer_email = Some("customer@someinternalemail.com");
    // TODO ^ This makes it un-editable. (maybe it can be changed?)

    let mut metadata = HashMap::new();

    if let Some(token) = user_token {
      metadata.insert(METADATA_USER_TOKEN.to_string(), token.to_string());
      metadata.insert(METADATA_USERNAME.to_string(), token.to_string());
      metadata.insert(METADATA_EMAIL.to_string(), token.to_string());
    }

    // TODO: What does this attach to?
    params.metadata = Some(metadata.clone());

    if is_subscription {
      // Subscription mode: Use Stripe Billing to set up fixed-price subscriptions.
      params.mode = Some(CheckoutSessionMode::Subscription);

      // NB: This metadata attaches to the subscription entity itself.
      // https://support.stripe.com/questions/using-metadata-with-checkout-sessions
      params.subscription_data = Some(CreateCheckoutSessionSubscriptionData {
        metadata,
        ..Default::default()
      });

    } else {
      // Payment mode: Accept one-time payments for cards, iDEAL, and more.
      params.mode = Some(CheckoutSessionMode::Payment);

      // TODO: Should this also be on subscriptions (?)
      // NB: This metadata attaches to the payment_intent entity itself.
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

    // TODO: Is this necessary?
    //params.expand = &["line_items", "line_items.data.price.product"];

    CheckoutSession::create(&stripe_client, params)
        .await
        .map_err(|e| {
          error!("Error: {:?}", e);
          anyhow!("error creating checkout session against Stripe")
        })?
  };

  checkout_session.url.ok_or(anyhow!("checkout session does not contain a URL"))
}
