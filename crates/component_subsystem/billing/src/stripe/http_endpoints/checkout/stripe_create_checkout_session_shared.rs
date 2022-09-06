use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use crate::stripe::stripe_config::StripeConfig;
use log::error;
use std::collections::HashMap;
use stripe::{CheckoutSession, CheckoutSessionMode, CreateCheckoutSession, CreateCheckoutSessionLineItems};

// NB: These are "test" product IDs.
pub const PRODUCT_FAKEYOU_BASIC_ID : &'static str = "prod_MMxi2J5y69VPbO";
pub const PRODUCT_FAKEYOU_BASIC_PRICE_ID : &'static str = "price_1LeDnKEU5se17MekVr1iYYNf";

/// Create a checkout session and return the URL
/// If anything fails, treat it as a 500 server error.
pub async fn stripe_create_checkout_session_shared(
  stripe_config: &StripeConfig,
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

  let mut metadata = HashMap::new();

  if let Some(token) = user_token {
    metadata.insert("user_token".to_string(), token.to_string());
  }

  let checkout_session = {
    let mut params = CreateCheckoutSession::new(
      cancel_url,
      success_url,
    );

    params.mode = Some(CheckoutSessionMode::Subscription);

    params.line_items = Some(vec![
      CreateCheckoutSessionLineItems {
        price: Some(PRODUCT_FAKEYOU_BASIC_PRICE_ID.to_string()),
        quantity: Some(1),
        ..Default::default()
      }
    ]);

    params.expand = &["line_items", "line_items.data.price.product"];

    CheckoutSession::create(&stripe_client, params)
        .await
        .map_err(|e| {
          error!("Error: {:?}", e);
          anyhow!("error creating checkout session against Stripe")
        })?
  };

  checkout_session.url.ok_or(anyhow!("checkout session does not contain a URL"))
}
