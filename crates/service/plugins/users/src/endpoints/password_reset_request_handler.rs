use std::fmt::Display;

use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use actix_web::http::StatusCode;
use log::{error, warn};
use serde::Deserialize;
use sqlx::MySqlPool;
use strum_macros::Display;

use crockford::crockford_entropy_lower;
use email_sender::letter_exports;
use email_sender::letter_exports::Message;
use email_sender::smtp_email_sender::SmtpEmailSender;
use http_server_common::request::get_request_ip::get_request_ip;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use mysql_queries::queries::users::user::lookup_user_for_login_by_email::lookup_user_for_login_by_email;
use mysql_queries::queries::users::user::lookup_user_for_login_by_username::lookup_user_for_login_by_username;
use mysql_queries::queries::users::user_password_resets::create_password_reset_request::create_password_reset;
use server_environment::ServerEnvironment;

#[derive(Deserialize)]
pub struct PasswordResetRequestedRequest {
    username_or_email: String,
}

#[derive(Serialize)]
pub struct PasswordResetRequestedResponse {
    success: bool,
}

#[derive(Serialize, Debug, Display)]
pub enum PasswordResetRequestedRequestError {
    NoSuchUser,
    Internal,
}

#[derive(Serialize, Debug)]
pub struct PasswordResetRequestedErrorResponse {
    success: bool,
    kind: PasswordResetRequestedRequestError,
}
impl Display for PasswordResetRequestedErrorResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl From<PasswordResetRequestedRequestError> for PasswordResetRequestedErrorResponse {
    fn from(value: PasswordResetRequestedRequestError) -> Self {
        Self { kind: value, success: false }
    }
}
impl From<errors::AnyhowError> for PasswordResetRequestedErrorResponse {
    fn from(value: errors::AnyhowError) -> Self {
        log::error!("Internal error: {value}");
        Self { kind: PasswordResetRequestedRequestError::Internal, success: false }
    }
}

impl ResponseError for PasswordResetRequestedErrorResponse {
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
pub async fn password_reset_request_handler(
    http_request: HttpRequest,
    request: web::Json<PasswordResetRequestedRequest>,
    mysql_pool: web::Data<MySqlPool>,
    server_environment: web::Data<ServerEnvironment>,
    sender: web::Data<SmtpEmailSender>,
) -> Result<HttpResponse, PasswordResetRequestedErrorResponse> {

    let username_or_email = request.username_or_email.trim();

    let user = if username_or_email.contains("@") {
        lookup_user_for_login_by_email(&username_or_email, &mysql_pool).await
    } else {
        lookup_user_for_login_by_username(&username_or_email, &mysql_pool).await
    }.map_err(|e| {
        warn!("Password reset user lookup error: {:?}", e);
        //TODO: This could be anything, not necessarily a lookup.  The name is misleading 🤷🏻
        PasswordResetRequestedRequestError::NoSuchUser
    })?;

    let secret_key = crockford_entropy_lower(32);

    //TODO: Handle banned users, they shouldn't be able to do this

    let ip_address = get_request_ip(&http_request);

    create_password_reset(&mysql_pool, &user, ip_address, secret_key.clone()).await
        .map_err(|err| {
            log::error!("Error creating password reset: {err}");
            PasswordResetRequestedRequestError::Internal
        })?;

    let from_address = "Support <support@storyteller.ai>"
        .parse()
        .map_err(|err| {
            log::error!("Error parsing from address: {err}");
            PasswordResetRequestedRequestError::Internal
        })?;

    let to_address = user.email_address
        .parse()
        .map_err(|err| {
            log::error!("Error parsing to address: {err}");
            PasswordResetRequestedRequestError::Internal
        })?;

    // TODO(bt,2023-11-12): Environmentally configure, allow overrides.
    let link = match **server_environment {
        ServerEnvironment::Development => format!("http://dev.fakeyou.com:7000/password-reset/verify?token={secret_key}"),
        ServerEnvironment::Production => format!("https://fakeyou.com/password-reset/verify?token={secret_key}"),
    };

    let message = format!(r#"
      <a href="{link}">Click here to reset your password!</a>
      <br />
      <br />
      If you can't click the link, here's the secret reset code: {secret_key}
      <br />
      <br />
      Thank You,
      <br />
      <br />
      Storyteller.ai (FakeYou) Team
    "#);

    let email = Message::builder()
        .from(from_address)
        .to(to_address)
        .subject("FakeYou Password Reset")
        .header(letter_exports::ContentType::TEXT_HTML)
        .body(message)
        .map_err(|err| {
            log::error!("Error constructing email: {err}");
            PasswordResetRequestedRequestError::Internal
        })?;

    sender.send_message(&email).map_err(|err| {
        log::error!("Error sending email: {err}");
        PasswordResetRequestedRequestError::Internal
    })?;

    let response = PasswordResetRequestedResponse {
        success: true,
    };

    let body = serde_json::to_string(&response)
        .map_err(|e| {
            error!("error returning response: {:?}",  e);
            PasswordResetRequestedRequestError::Internal
        })?;

    Ok(HttpResponse::Ok()
        .content_type("application/json")
        .body(body))
}
