
/// Configuration for Stripe, including secrets.
/// Inject these into Actix http handlers, etc.
/// Do not log!
#[derive(Clone)]
pub struct StripeConfig {
  pub checkout: StripeCheckout,
  pub secrets: StripeSecrets,
}

#[derive(Clone)]
pub struct StripeCheckout {
  pub success_url: Option<String>,
  pub cancel_url: Option<String>,
}

#[derive(Clone)]
pub struct StripeSecrets {
  /// The Stripe API key to use for the frontend or mobile apps.
  /// This is allowed in client code.
  pub publishable_key: Option<String>,

  /// The Stripe API key to use serverside. This is a secret value.
  pub secret_key: Option<String>,

  /// The Stripe secret used to validate inbound webhook payloads.
  pub secret_webhook_signing_key: Option<String>,
}