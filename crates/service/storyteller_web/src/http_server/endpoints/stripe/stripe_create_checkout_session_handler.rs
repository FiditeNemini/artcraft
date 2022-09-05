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
use std::collections::HashMap;
use std::fmt;
use stripe::{CheckoutSession, CheckoutSessionMode, CreateCheckoutSession, CreateCheckoutSessionLineItems};

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
  let stripe_client = stripe::Client::new(STRIPE_SECRET_KEY);

  let mut metadata = HashMap::new();
  metadata.insert("user_token".to_string(), "U:TEST".to_string());

  let checkout_session = {
    let mut params = CreateCheckoutSession::new(
      "http://localhost:12345/stripe/checkout/cancel",
      "http://localhost:12345/stripe/checkout/success"
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
          CreateCheckoutSessionError::ServerError
        })?
  };

  let url = checkout_session.url.expect("must have url");

  Ok(HttpResponse::Found()
      .append_header((header::LOCATION, url.to_string()))
      .finish())
}
