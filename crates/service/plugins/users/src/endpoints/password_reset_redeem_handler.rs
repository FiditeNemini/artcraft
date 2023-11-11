/* 
    ~ B R A I N S T O R M ~

    - redeem reset request
        - needs a way to identify the user because only the tuple is unique (user + key)
            username or email address
        - provide new password
 */

use std::fmt::Display;

use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use actix_web::http::StatusCode;
use log::{error, warn};
use serde::Deserialize;
use sqlx::MySqlPool;
use strum_macros::Display;

use crockford::crockford_entropy_lower;
use http_server_common::request::get_request_ip::get_request_ip;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use mysql_queries::queries::users::user::create_password_reset_request::create_password_reset;
use mysql_queries::queries::users::user::lookup_user_for_login_by_email::lookup_user_for_login_by_email;
use mysql_queries::queries::users::user::lookup_user_for_login_by_username::lookup_user_for_login_by_username;

/// This can be reused in login requests in the future!
#[derive(Deserialize)]
pub enum UserLogin {
    Email(String),
    Username(String),
}

#[derive(Deserialize)]
pub struct PasswordResetRequisitionRequest {
    login: UserLogin,
}

#[derive(Serialize)]
pub struct PasswordResetRequisitionResponse {
    success: bool,
}

#[derive(Serialize, Debug, Display)]
pub enum PasswordResetRequisitionRequestError {
    NoSuchUser,
    Internal,
}

#[derive(Serialize, Debug)]
pub struct PasswordResetRequisitionErrorResponse {
    kind: PasswordResetRequisitionRequestError,
}
impl Display for PasswordResetRequisitionErrorResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl From<PasswordResetRequisitionRequestError> for PasswordResetRequisitionErrorResponse {
    fn from(value: PasswordResetRequisitionRequestError) -> Self {
        Self { kind: value }
    }
}
impl From<errors::AnyhowError> for PasswordResetRequisitionErrorResponse {
    fn from(value: errors::AnyhowError) -> Self {
        log::error!("Internal error: {value}");
        Self { kind: PasswordResetRequisitionRequestError::Internal }
    }
}

impl ResponseError for PasswordResetRequisitionErrorResponse {
    //TODO: Yknow, clean this up and stuff
    fn status_code(&self) -> StatusCode {
        StatusCode::INTERNAL_SERVER_ERROR
    }
  
    fn error_response(&self) -> HttpResponse {
        serialize_as_json_error(self)
    }
  }

/// 
/// Non-authenticated!
/// 
/// - create password reset request
///     - sends email?
///     - inserts record and stuff
pub async fn password_reset_redeem_handler(
    http_request: HttpRequest,
    request: web::Json<PasswordResetRequisitionRequest>,
    mysql_pool: web::Data<MySqlPool>,
) -> Result<HttpResponse, PasswordResetRequisitionErrorResponse> {

    let ip_address = get_request_ip(&http_request);

    let user = match &request.login { 
        UserLogin::Email(email) => lookup_user_for_login_by_email(&email, &mysql_pool).await,
        UserLogin::Username(username) => lookup_user_for_login_by_username(&username, &mysql_pool).await,
    }.map_err(|e| {
        warn!("Password reset user lookup: {:?}", e);
        PasswordResetRequisitionRequestError::NoSuchUser
        //TODO: This could be anything, not necessarily a lookup.  The name is misleading 🤷🏻
    })?;

    let secret_key = crockford_entropy_lower(32);

    //TODO: Handle banned users, they shouldn't be able to do this

    create_password_reset(&mysql_pool, &user, ip_address, secret_key.clone()).await
        .map_err(|err| {
            log::error!("Password reset error {:?}", err);
            err
        })?;

    let response = PasswordResetRequisitionResponse {
        success: true,
    };

    let body = serde_json::to_string(&response)
        .map_err(|e| {
            error!("error returning response: {:?}",  e);
            PasswordResetRequisitionRequestError::Internal
        })?;

    Ok(HttpResponse::Ok()
        .content_type("application/json")
        .body(body))
}
