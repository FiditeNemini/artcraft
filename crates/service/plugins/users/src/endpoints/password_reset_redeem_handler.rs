use std::fmt::Display;

use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use actix_web::http::StatusCode;
use log::{error, warn};
use serde::Deserialize;
use sqlx::MySqlPool;
use strum_macros::Display;

use http_server_common::request::get_request_ip::get_request_ip;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use mysql_queries::queries::users::user::lookup_user_for_login_by_email::lookup_user_for_login_by_email;
use mysql_queries::queries::users::user::lookup_user_for_login_by_username::lookup_user_for_login_by_username;
use mysql_queries::queries::users::user_password_resets::lookup_password_reset_request::lookup_password_reset_request;

#[derive(Deserialize)]
pub struct PasswordResetRedemptionRequest {
    username_or_email: String,
    reset_token: String,
    new_password: String,
    new_password_validation: String,
}

#[derive(Serialize)]
pub struct PasswordResetRedemptionResponse {
    success: bool,
}

#[derive(Serialize, Debug, Display)]
pub enum PasswordResetRedemptionError {
    /// Account does not exist or reset token is wrong.
    InvalidRedemption,
    PasswordsDoNotMatch,
    Internal,
}

#[derive(Serialize, Debug)]
pub struct PasswordResetRedemptionErrorResponse {
    kind: PasswordResetRedemptionError,
}
impl Display for PasswordResetRedemptionErrorResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl From<PasswordResetRedemptionError> for PasswordResetRedemptionErrorResponse {
    fn from(value: PasswordResetRedemptionError) -> Self {
        Self { kind: value }
    }
}
impl From<errors::AnyhowError> for PasswordResetRedemptionErrorResponse {
    fn from(value: errors::AnyhowError) -> Self {
        log::error!("Internal error: {value}");
        Self { kind: PasswordResetRedemptionError::Internal }
    }
}

impl ResponseError for PasswordResetRedemptionErrorResponse {
    //TODO: Yknow, clean this up and stuff
    fn status_code(&self) -> StatusCode {
        StatusCode::INTERNAL_SERVER_ERROR
    }
  
    fn error_response(&self) -> HttpResponse {
        serialize_as_json_error(self)
    }
  }

pub async fn password_reset_redeem_handler(
    http_request: HttpRequest,
    request: web::Json<PasswordResetRedemptionRequest>,
    mysql_pool: web::Data<MySqlPool>,
) -> Result<HttpResponse, PasswordResetRedemptionErrorResponse> {
    let username_or_email = request.username_or_email.trim();

    //let user = if username_or_email.contains("@") {
    //    lookup_user_for_login_by_email(&username_or_email, &mysql_pool).await
    //} else {
    //    lookup_user_for_login_by_username(&username_or_email, &mysql_pool).await
    //}.map_err(|e| {
    //    warn!("Password reset redemption user lookup error: {:?}", e);
    //    PasswordResetRedemptionError::InvalidRedemption
    //})?;

    let ip_address = get_request_ip(&http_request);

    //TODO: Handle banned users, they shouldn't be able to do this

    let result = lookup_password_reset_request(&request.reset_token, &mysql_pool).await
        .map_err(|err| {
            log::error!("Password reset error {:?}", err);
            err
        });

    let reset_state = match result {
        Ok(Some(reset_state)) => reset_state,
        Ok(None) => {
            warn!("No such reset request.");
            return Err(PasswordResetRedemptionErrorResponse {
                kind: PasswordResetRedemptionError::InvalidRedemption,
            });
        }
        Err(err) => {
            error!("lookup error: {err}");
            return Err(PasswordResetRedemptionErrorResponse {
                kind: PasswordResetRedemptionError::InvalidRedemption,
            });
        }
    };


    println!("Reset state: {}", reset_state.user_token);

    let response = PasswordResetRedemptionResponse {
        success: true,
    };

    let body = serde_json::to_string(&response)
        .map_err(|e| {
            error!("error returning response: {:?}",  e);
            PasswordResetRedemptionError::Internal
        })?;

    Ok(HttpResponse::Ok()
        .content_type("application/json")
        .body(body))
}
