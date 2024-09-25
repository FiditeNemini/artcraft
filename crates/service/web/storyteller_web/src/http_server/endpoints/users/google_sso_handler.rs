// NB: Incrementally getting rid of build warnings...
//#![forbid(unused_imports)]
//#![forbid(unused_mut)]
//#![forbid(unused_variables)]

use std::collections::{HashMap, HashSet};
use std::fmt;
use std::fmt::Formatter;

use crate::http_server::endpoints::beta_keys::redeem_beta_key_handler::RedeemBetaKeyError;
use crate::http_server::endpoints::users::session_info_handler::SessionInfoError;
use crate::http_server::session::http::http_user_session_manager::HttpUserSessionManager;
use crate::http_server::validations::is_reserved_username::is_reserved_username;
use crate::http_server::validations::validate_passwords::validate_passwords;
use crate::http_server::validations::validate_username::validate_username;
use crate::state::certs::google_sign_in_cert::GoogleSignInCert;
use crate::util::email_to_gravatar::email_to_gravatar;
use crate::util::enroll_in_studio::enroll_in_studio;
use crate::util::generate_random_username::generate_random_username;
use actix_helpers::extractors::get_request_origin_uri::get_request_origin_uri;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::{Data, Json};
use actix_web::{web, HttpRequest, HttpResponse};
use errors::AnyhowResult;
use google_sign_in::certs::download_certs::download_cert_key_set;
use google_sign_in::claims::claims::Claims;
use google_sign_in::decode_and_verify_token_claims::decode_and_verify_token_claims;
use google_sign_in::VerificationOptions;
use http_server_common::request::get_request_ip::get_request_ip;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::{info, warn};
use mysql_queries::mediators::firehose_publisher::FirehosePublisher;
use mysql_queries::queries::google_sign_in_accounts::get_google_sign_in_account_by_subject::{get_google_sign_in_account, GoogleSignInAccount};
use mysql_queries::queries::google_sign_in_accounts::insert_google_sign_in_account::{insert_google_sign_in_account, InsertGoogleSignInArgs};
use mysql_queries::queries::users::user::account_creation::create_account_from_google_sso::{create_account_from_google_sso, CreateAccountFromGoogleSsoArgs};
use mysql_queries::queries::users::user_sessions::create_user_session::create_user_session;
use mysql_queries::utils::transactor::Transactor;
use password::bcrypt_hash_password::bcrypt_hash_password;
use sqlx::pool::PoolConnection;
use sqlx::{Acquire, MySql, MySqlPool};
use tokens::tokens::user_sessions::UserSessionToken;
use user_input_common::check_for_slurs::contains_slurs;
use utoipa::ToSchema;

#[derive(ToSchema, Deserialize)]
pub struct GoogleCreateAccountRequest {
  pub google_credential: String,
}

#[derive(ToSchema, Serialize)]
pub struct GoogleCreateAccountSuccessResponse {
  pub success: bool,

  /// A signed session that can be sent as a header, bypassing cookies.
  /// This is useful for API clients that don't support cookies or Google
  /// browsers killing cross-domain cookies.
  pub signed_session: String,

  /// If the username was automatically generated and not yet customized,
  /// this will report true. We should show the user a dialogue to change
  /// their username.
  pub username_not_yet_customized: bool,

  /// The user's username. If we want to present a username customization
  /// flow, we'll need this.
  pub username: String,
}

#[derive(ToSchema, Serialize, Debug)]
pub struct GoogleCreateAccountErrorResponse {
  pub success: bool,
  pub error_type: GoogleCreateAccountErrorType,
  pub error_fields: HashMap<String, String>,
}

#[derive(ToSchema, Copy, Clone, Debug, Serialize)]
pub enum GoogleCreateAccountErrorType {
  BadRequest, // Other request malformed errors, eg. bad Origin header
  BadInput,
  EmailTaken,
  ServerError,
  UsernameReserved,
  UsernameTaken,
}

impl GoogleCreateAccountErrorResponse {
  fn server_error() -> Self {
    Self {
      success: false,
      error_type: GoogleCreateAccountErrorType::ServerError,
      error_fields: HashMap::new(),
    }
  }

  fn bad_request() -> Self {
    Self {
      success: false,
      error_type: GoogleCreateAccountErrorType::BadRequest,
      error_fields: HashMap::new(),
    }
  }
}

// NB: Not using DeriveMore since Clion doesn't understand it.
impl fmt::Display for GoogleCreateAccountErrorResponse {
  fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self.error_type)
  }
}

impl ResponseError for GoogleCreateAccountErrorResponse {
  fn status_code(&self) -> StatusCode {
    match self.error_type {
      GoogleCreateAccountErrorType::BadRequest => StatusCode::BAD_REQUEST,
      GoogleCreateAccountErrorType::BadInput => StatusCode::BAD_REQUEST,
      GoogleCreateAccountErrorType::EmailTaken => StatusCode::BAD_REQUEST,
      GoogleCreateAccountErrorType::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      GoogleCreateAccountErrorType::UsernameReserved => StatusCode::BAD_REQUEST,
      GoogleCreateAccountErrorType::UsernameTaken => StatusCode::BAD_REQUEST,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}


/// Sign in or sign up with "Sign in with Google" credentials.
/// This supports both sign up for new users and sign in for existing users.
#[utoipa::path(
  post,
  tag = "Users",
  path = "/v1/accounts/google_sso",
  responses(
    (status = 200, description = "Success", body = GoogleCreateAccountSuccessResponse),
    (status = 400, description = "Bad input", body = GoogleCreateAccountErrorResponse),
    (status = 401, description = "Not authorized", body = GoogleCreateAccountErrorResponse),
    (status = 500, description = "Server error", body = GoogleCreateAccountErrorResponse),
  ),
  params(
    ("request" = GoogleCreateAccountRequest, description = "Payload for Request"),
  )
)]
pub async fn create_account_from_google_sign_in_handler(
  http_request: HttpRequest,
  request: Json<GoogleCreateAccountRequest>,
  mysql_pool: Data<MySqlPool>,
  session_cookie_manager: Data<HttpUserSessionManager>,
  google_sign_in_cert: Data<GoogleSignInCert>,
) -> Result<HttpResponse, GoogleCreateAccountErrorResponse>
{
  let claims = check_claims(&request, google_sign_in_cert).await?;

  info!("Google JWT credential claims: email {:?}, verified: {}",
    claims.email(),
    claims.email_verified());

  let subject = claims.subject()
      .map(|s| s.to_string())
      .ok_or_else(|| {
        warn!("no subject in google claims");
        GoogleCreateAccountErrorResponse::bad_request()
      })?;

  let mut mysql_connection = mysql_pool.acquire()
      .await
      .map_err(|e| {
        warn!("Could not acquire DB pool: {:?}", e);
        GoogleCreateAccountErrorResponse::server_error()
      })?;

  let maybe_sso_account = get_google_sign_in_account(&subject, &mut *mysql_connection)
      .await
      .map_err(|err| {
        warn!("error getting google sign in account: {:?}", err);
        GoogleCreateAccountErrorResponse::server_error()
      })?;

  match maybe_sso_account {
    None => {
      create_new_sso_account(
        &http_request,
        &subject,
        &mut mysql_connection,
        claims,
      ).await?
    },
    Some(sso_account) => login_existing_sso_account(sso_account).await,
  }

  /*
  - Record does not exist, no user with email exists --> create account
  - Record does not exist, user with email exists
       --> link account **ONLY** if Google or ask for password(?)
  - Record exists --> update + login
   */

  let response = GoogleCreateAccountSuccessResponse {
    success: true,
    signed_session: "todo".to_string(),
    username_not_yet_customized: false,
    username: "todo".to_string(),
  };

  let body = serde_json::to_string(&response)
    .map_err(|_e| GoogleCreateAccountErrorResponse::server_error())?;

  Ok(HttpResponse::Ok()
    // .cookie(session_cookie) // TODO / FIXME
    .content_type("application/json")
    .body(body))
}

async fn check_claims(
  request: &Json<GoogleCreateAccountRequest>,
  google_sign_in_cert: Data<GoogleSignInCert>,
) -> Result<Claims, GoogleCreateAccountErrorResponse> {
  let keys = google_sign_in_cert.fetch_key_map(false)
      .await
      .map_err(|e| {
        warn!("error downloading google certs: {:?}", e);
        GoogleCreateAccountErrorResponse::server_error()
      })?;

  let verification_options = Some(build_options());

  let claims = match decode_and_verify_token_claims(&keys, &request.google_credential, verification_options) {
    Ok(claims) => claims,
    Err(err) => {
      warn!("error decoding google token claims (will retry certs): {:?}", err);

      let keys = google_sign_in_cert.fetch_key_map(true) // NB: REFRESH
          .await
          .map_err(|e| {
            warn!("error refreshing google certs: {:?}", e);
            GoogleCreateAccountErrorResponse::server_error()
          })?;

      let verification_options = Some(build_options());

      let claims = decode_and_verify_token_claims(&keys, &request.google_credential, verification_options)
          .map_err(|e| {
            warn!("error decoding google token claims: {:?}", e);
            GoogleCreateAccountErrorResponse::bad_request()
          })?;

      claims
    },
  };

  Ok(claims)
}

// TODO(bt,2024-09-22): Make this configurable via env vars.
fn build_options() -> VerificationOptions {
  VerificationOptions {
    allowed_issuers: Some(HashSet::from([
      "https://accounts.google.com".to_string(),
      "accounts.google.com".to_string(),
    ])),
    allowed_audiences: Some(HashSet::from([
      "788843034237-uqcg8tbgofrcf1to37e1bqphd924jaf6.apps.googleusercontent.com".to_string(),
    ])),
    ..Default::default()
  }
}

async fn create_new_sso_account(
  http_request: &HttpRequest,
  subject: &str,
  mysql_connection: &mut PoolConnection<MySql>,
  claims: Claims,
)
  -> Result<(), GoogleCreateAccountErrorResponse>
{
  let email_address = claims.email()
      .ok_or_else(|| {
        warn!("no email address in google claims");
        GoogleCreateAccountErrorResponse::bad_request()
      })?;

  let ip_address = get_request_ip(&http_request);

  let display_name = generate_random_username();
  let username = display_name.trim().to_lowercase();

  info!("generated username: {}", username);

  let mut transaction = mysql_connection.begin()
      .await
      .map_err(|e| {
        warn!("Could not begin transaction: {:?}", e);
        GoogleCreateAccountErrorResponse::server_error()
      })?;

  let _token = insert_google_sign_in_account(InsertGoogleSignInArgs {
    subject,
    maybe_user_token: None,
    email_address,
    is_email_verified: claims.email_verified(),
    maybe_locale: None,
    maybe_name: None,
    maybe_given_name: None,
    maybe_family_name: None,
    creator_ip_address: &ip_address,
    transaction: &mut transaction,
  }).await.map_err(|err| {
    warn!("error inserting google sign in account: {:?}", err);
    GoogleCreateAccountErrorResponse::server_error()
  })?;

  let email_address = email_address.trim().to_lowercase();
  let email_gravatar_hash = email_to_gravatar(&email_address);

  let user_token = create_account_from_google_sso(
    CreateAccountFromGoogleSsoArgs {
      username: &username,
      display_name: &display_name,
      email_address: &email_address,
      email_gravatar_hash: &email_gravatar_hash,
      email_confirmed_by_google: claims.email_verified(),
      ip_address: &ip_address,
      maybe_source: None,
    },
    Transactor::for_transaction(&mut transaction),
  ).await.map_err(|err| {
    warn!("error creating account from google sso: {:?}", err);
    GoogleCreateAccountErrorResponse::server_error()
  })?;

  Ok(())
}

async fn login_existing_sso_account(sso_account: GoogleSignInAccount) {

}
