use actix_http::StatusCode;
use actix_web::{HttpResponse, ResponseError};
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use std::fmt;

#[derive(Debug, Serialize, Eq, PartialEq)]
pub enum CreateCheckoutSessionError {
    BadRequest,
    InvalidSession,
    PlanNotFound,
    ServerError,
    StripeError,
    /// User already subscribes to a plan. User should hit the Stripe Billing Portal instead.
    UserAlreadyHasPlan,
}

impl ResponseError for CreateCheckoutSessionError {
    fn status_code(&self) -> StatusCode {
        match *self {
            CreateCheckoutSessionError::BadRequest => StatusCode::BAD_REQUEST,
            CreateCheckoutSessionError::InvalidSession => StatusCode::UNAUTHORIZED,
            CreateCheckoutSessionError::PlanNotFound => StatusCode::NOT_FOUND,
            CreateCheckoutSessionError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
            CreateCheckoutSessionError::StripeError => StatusCode::INTERNAL_SERVER_ERROR,
            CreateCheckoutSessionError::UserAlreadyHasPlan => StatusCode::BAD_REQUEST,
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
