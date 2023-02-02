use actix_web::error::ResponseError;
use actix_web::error::UrlencodedError::ContentType;
use actix_web::http::{header, StatusCode};
use actix_web::web::{Path, Query};
use actix_web::{web, HttpResponse, HttpRequest};
use chrono::{DateTime, Utc};
use crate::stripe::http_endpoints::checkout::create::stripe_create_checkout_session_error::CreateCheckoutSessionError;
use crate::stripe::http_endpoints::checkout::create::stripe_create_checkout_session_shared::stripe_create_checkout_session_shared;
use crate::stripe::stripe_config::StripeConfig;
use crate::stripe::traits::internal_product_to_stripe_lookup::InternalProductToStripeLookup;
use crate::stripe::traits::internal_user_lookup::InternalUserLookup;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::{error, warn};
use sqlx::MySqlPool;
use std::collections::HashMap;
use std::fmt;
use stripe::{CheckoutSession, CheckoutSessionMode, CreateCheckoutSession, CreateCheckoutSessionLineItems};
use reusable_types::server_environment::ServerEnvironment;
use url_config::third_party_url_redirector::ThirdPartyUrlRedirector;

// =============== Request ===============

#[derive(Deserialize)]
pub struct CreateCheckoutSessionRequest {
  product: Option<String>,
}

pub async fn stripe_create_checkout_session_redirect_handler(
  http_request: HttpRequest,
  request: Query<CreateCheckoutSessionRequest>,
  stripe_config: web::Data<StripeConfig>,
  stripe_client: web::Data<stripe::Client>,
  server_environment: web::Data<ServerEnvironment>,
  url_redirector: web::Data<ThirdPartyUrlRedirector>,
  internal_product_to_stripe_lookup: web::Data<dyn InternalProductToStripeLookup>,
  internal_user_lookup: web::Data<dyn InternalUserLookup>,
) -> Result<HttpResponse, CreateCheckoutSessionError>
{
  let maybe_internal_product_key = request.product.as_deref();

  let url = stripe_create_checkout_session_shared(
    maybe_internal_product_key,
    &http_request,
    &stripe_config,
    server_environment.get_ref().clone(),
    &stripe_client,
    &url_redirector,
    internal_product_to_stripe_lookup.get_ref(),
    internal_user_lookup.get_ref(),
  ).await?;

  Ok(HttpResponse::Found()
      .append_header((header::LOCATION, url))
      .finish())
}
