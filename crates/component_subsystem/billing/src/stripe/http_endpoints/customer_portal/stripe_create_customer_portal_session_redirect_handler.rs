use actix_web::error::ResponseError;
use actix_web::error::UrlencodedError::ContentType;
use actix_web::http::{header, StatusCode};
use actix_web::web::{Path, Query};
use actix_web::{web, HttpResponse, HttpRequest};
use chrono::{DateTime, Utc};
use crate::stripe::stripe_config::StripeConfig;
use crate::stripe::traits::internal_product_to_stripe_lookup::InternalProductToStripeLookup;
use crate::stripe::traits::internal_user_lookup::InternalUserLookup;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::{error, warn};
use sqlx::MySqlPool;
use std::collections::HashMap;
use std::fmt;
use std::str::FromStr;
use stripe::{BillingPortalSession, CheckoutSession, CheckoutSessionMode, CreateBillingPortalSession, CreateCheckoutSession, CreateCheckoutSessionLineItems, CustomerId};

// =============== Error ===============

#[derive(Debug, Serialize, Eq, PartialEq)]
pub enum CreateCustomerPortalSessionError {
    BadRequest,
    InvalidSession,
    ServerError,
    StripeError,
}

impl ResponseError for CreateCustomerPortalSessionError {
    fn status_code(&self) -> StatusCode {
        match *self {
            CreateCustomerPortalSessionError::BadRequest => StatusCode::BAD_REQUEST,
            CreateCustomerPortalSessionError::InvalidSession => StatusCode::UNAUTHORIZED,
            CreateCustomerPortalSessionError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
            CreateCustomerPortalSessionError::StripeError => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        serialize_as_json_error(self)
    }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for CreateCustomerPortalSessionError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

pub async fn stripe_create_customer_portal_session_redirect_handler(
    http_request: HttpRequest,
    stripe_config: web::Data<StripeConfig>,
    stripe_client: web::Data<stripe::Client>,
    internal_product_to_stripe_lookup: web::Data<dyn InternalProductToStripeLookup>,
    internal_user_lookup: web::Data<dyn InternalUserLookup>,
) -> Result<HttpResponse, CreateCustomerPortalSessionError>
{
    let maybe_user_metadata = internal_user_lookup
        .lookup_user_from_http_request(&http_request)
        .await
        .map_err(|err| {
            error!("Error looking up user: {:?}", err);
            CreateCustomerPortalSessionError::ServerError // NB: This was probably *our* fault.
        })?;

    // NB: Our integration relies on an internal user token being present.
    let user_metadata = match maybe_user_metadata {
        None => return Err(CreateCustomerPortalSessionError::InvalidSession),
        Some(user_metadata) => user_metadata,
    };

    let stripe_customer_id = match user_metadata.maybe_existing_stripe_customer_id {
        Some(stripe_customer_id) => {
            CustomerId::from_str(&stripe_customer_id)
                .map_err(|err| {
                    error!("Problem constructing user's stripe customer id: {:?}", err);
                    CreateCustomerPortalSessionError::ServerError // NB: This was probably *our* fault.
                })?
        }
        None => {
            error!("No stripe customer ID to create a portal with");
            return Err(CreateCustomerPortalSessionError::InvalidSession);
        }
    };

    let mut params = CreateBillingPortalSession::new(stripe_customer_id);

    params.return_url = Some("http://localhost/return"); // TODO: Proper redirect
    params.configuration = Some("bpc_1LyPPREU5se17MekYiViZF12"); // TODO: Production portal configs

    let response = BillingPortalSession::create(stripe_client.as_ref(), params)
        .await
        .map_err(|e| {
            error!("Error: {:?}", e);
            CreateCustomerPortalSessionError::StripeError
        })?;

    let redirect_url = response.url;

    Ok(HttpResponse::Found()
        .append_header((header::LOCATION, redirect_url))
        .finish())
}
