use actix_http::StatusCode;
use actix_web::{HttpResponse, ResponseError};
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use std::fmt;

#[derive(Debug, Serialize, Eq, PartialEq)]
pub enum CreateCheckoutSessionError {
    BadRequest,
    PlanNotFound,
    InvalidSession,
    ServerError,
    StripeError,
}

impl ResponseError for CreateCheckoutSessionError {
    fn status_code(&self) -> StatusCode {
        match *self {
            CreateCheckoutSessionError::BadRequest => StatusCode::BAD_REQUEST,
            CreateCheckoutSessionError::PlanNotFound => StatusCode::NOT_FOUND,
            CreateCheckoutSessionError::InvalidSession => StatusCode::UNAUTHORIZED,
            CreateCheckoutSessionError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
            CreateCheckoutSessionError::StripeError => StatusCode::INTERNAL_SERVER_ERROR,
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
