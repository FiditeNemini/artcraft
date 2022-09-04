use std::collections::HashMap;
use actix_web::error::ResponseError;
use actix_web::error::UrlencodedError::ContentType;
use actix_web::http::{header, StatusCode};
use actix_web::web::Path;
use actix_web::{web, HttpResponse, HttpRequest};
use chrono::{DateTime, Utc};
use crate::http_server::endpoints::stripe::stripe_common::{PRODUCT_FAKEYOU_BASIC_PRICE_ID, STRIPE_SECRET_KEY};
use http_server_common::request::get_request_header_optional::get_request_header_optional;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use http_server_common::util::timer::MultiBenchmarkingTimer;
use log::{error, warn};
use reusable_types::entity_visibility::EntityVisibility;
use sqlx::MySqlPool;
use std::fmt;
use stripe::{CheckoutSession, CheckoutSessionMode, CreateCheckoutSession, CreateCheckoutSessionLineItems};

// TODO: This is duplicated in query_user_CreateCheckoutSession
// TODO: This handler has embedded queries.

#[derive(Serialize)]
pub struct CreateCheckoutSessionSuccessResponse {
  pub success: bool,
}

#[derive(Debug, Serialize)]
pub enum CreateCheckoutSessionError {
  ServerError,
}

impl ResponseError for CreateCheckoutSessionError {
  fn status_code(&self) -> StatusCode {
    match *self {
      CreateCheckoutSessionError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for CreateCheckoutSessionError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn stripe_create_checkout_session_handler(
  http_request: HttpRequest,
  mysql_pool: web::Data<MySqlPool>,
) -> Result<HttpResponse, CreateCheckoutSessionError>
{
  //let stripe = Client::new(STRIPE_SECRET_KEY);
  //let checkout = stripe.checkout();

  let stripe_client = stripe::Client::new(STRIPE_SECRET_KEY);

  let mut metadata = HashMap::new();
  metadata.insert("user_token".to_string(), "U:TEST".to_string());

  /*let params = CreateCheckoutSession {
    after_expiration: None,
    allow_promotion_codes: None,
    automatic_tax: None,
    billing_address_collection: None,
    cancel_url: "http://localhost:12345/stripe/checkout/cancel",
    client_reference_id: None,
    consent_collection: None,
    customer: None,
    customer_creation: None,
    customer_email: None,
    customer_update: None,
    discounts: None,
    expand: &[],
    expires_at: None,
    line_items: None,
    locale: None,
    metadata: Some(metadata),
    mode: Some(CheckoutSessionMode::Subscription),
    payment_intent_data: None,
    payment_method_options: None,
    payment_method_types: None,
    phone_number_collection: None,
    setup_intent_data: None,
    shipping_address_collection: None,
    shipping_options: None,
    submit_type: None,
    subscription_data: None,
    success_url: "http://localhost:12345/stripe/checkout/success",
    tax_id_collection: None
  };*/


  let checkout_session = {
    let mut params = CreateCheckoutSession::new("http://localhost:12345/stripe/checkout/cancel", "http://localhost:12345/stripe/checkout/success");

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
          CreateCheckoutSessionError::ServerError
        })?
  };

  let url = checkout_session.url.expect("must have url");

  //let response = CreateCheckoutSessionSuccessResponse {
  //  success: true,
  //};

  //let body = serde_json::to_string(&response)
  //    .map_err(|_e| CreateCheckoutSessionError::ServerError)?;

  //Ok(HttpResponse::Ok()
  //    .content_type("application/json")
  //    .body(body))

  Ok(HttpResponse::Found()
      .append_header((header::LOCATION, url.to_string()))
      .finish())
}
