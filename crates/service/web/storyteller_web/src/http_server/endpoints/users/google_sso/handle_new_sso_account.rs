use crate::http_server::endpoints::users::google_sso::google_sso_handler::{GoogleCreateAccountErrorResponse, GoogleCreateAccountSuccessResponse};
use crate::http_server::endpoints::users::google_sso::handle_linking_existing_account::handle_linking_existing_account;
use crate::http_server::session::http::http_user_session_manager::HttpUserSessionManager;
use crate::http_server::session::lookup::user_session_feature_flags::UserSessionFeatureFlags;
use crate::util::canonicalize_email_for_users_table::canonicalize_email_for_users_table;
use crate::util::email_to_gravatar::email_to_gravatar;
use crate::util::generate_random_username::generate_random_username;
use actix_web::{HttpRequest, HttpResponse};
use enums::by_table::users::user_feature_flag::UserFeatureFlag;
use google_sign_in::claims::claims::Claims;
use http_server_common::request::get_request_ip::get_request_ip;
use log::{error, info, warn};
use mysql_queries::queries::google_sign_in_accounts::insert_google_sign_in_account::{insert_google_sign_in_account, InsertGoogleSignInArgs};
use mysql_queries::queries::users::user::account_creation::create_account_error::CreateAccountError;
use mysql_queries::queries::users::user::account_creation::create_account_from_google_sso::{create_account_from_google_sso, CreateAccountFromGoogleSsoArgs};
use mysql_queries::queries::users::user::lookup_user_for_login_by_email_with_transactor::lookup_user_for_login_by_email_with_transactor;
use mysql_queries::utils::transactor::Transactor;
use sqlx::pool::PoolConnection;
use sqlx::{Acquire, MySql};
use tokens::tokens::user_sessions::UserSessionToken;
use tokens::tokens::users::UserToken;

pub struct NewSsoAccountInfo {
  pub user_token: UserToken,
  pub user_display_name: String,
  pub username_is_not_customized: bool,
}

pub async fn handle_new_sso_account(
  http_request: &HttpRequest,
  subject: &str,
  mysql_connection: &mut PoolConnection<MySql>,
  claims: Claims,
)
  -> Result<NewSsoAccountInfo, GoogleCreateAccountErrorResponse>
{
  let email_address = claims.email()
      .map(|email| email.to_string())
      .ok_or_else(|| {
        warn!("no email address in google claims");
        GoogleCreateAccountErrorResponse::bad_request()
      })?;

  let ip_address = get_request_ip(&http_request);

  // NB: We use this routine to "normalize" email addresses in the user table.
  // It won't necessarily match the email address in the Google claims.
  // A better normalization function in the future may handle dots and plus
  // signs in Gmail addresses, for instance.
  let user_email_address = canonicalize_email_for_users_table(&email_address);
  let user_email_gravatar_hash = email_to_gravatar(&user_email_address);

  let maybe_user_account =
      lookup_user_for_login_by_email_with_transactor(&user_email_address, Transactor::for_connection(mysql_connection))
          .await
          .map_err(|err| {
            warn!("error looking up user by email: {:?}", err);
            GoogleCreateAccountErrorResponse::server_error()
          })?;

  match maybe_user_account {
    Some(user_account) => {
      let account_info = handle_linking_existing_account(
        user_account,
        http_request,
        subject,
        mysql_connection,
        claims,
      ).await?;
      
      return Ok(account_info);
    },
    None => {
    },
  }

  let mut transaction = mysql_connection.begin()
      .await
      .map_err(|e| {
        warn!("Could not begin transaction: {:?}", e);
        GoogleCreateAccountErrorResponse::server_error()
      })?;

  // Enroll users in studio temporarily.
  let user_feature_flags = studio_feature_flags();

  let mut maybe_user_token = None;
  let mut maybe_user_display_name = None;

  for _ in 0..3 {
    // NB: We try a few times to make sure we don't hit a username collision.
    let display_name = generate_random_username();
    let username = display_name.trim().to_lowercase();

    info!("generated username: {}", username);

    let result = create_account_from_google_sso(
      CreateAccountFromGoogleSsoArgs {
        username: &username,
        display_name: &display_name,
        email_address: &user_email_address,
        email_gravatar_hash: &user_email_gravatar_hash,
        email_confirmed_by_google: claims.email_verified(),
        maybe_feature_flags: user_feature_flags.as_deref(),
        ip_address: &ip_address,
        maybe_source: None, // TOO: Add source
      },
      Transactor::for_transaction(&mut transaction),
    ).await;

    match result {
      Ok(token) => {
        maybe_user_token = Some(token);
        maybe_user_display_name = Some(display_name);
        break;
      },
      Err(CreateAccountError::UsernameIsTaken) => {
        continue; // NB: We'll try again with a new username.
      },
      Err(err) => {
        warn!("error creating account from google sso: {:?}", err);
        return Err(GoogleCreateAccountErrorResponse::server_error());
      },
    }
  }

  let user_token = maybe_user_token.ok_or_else(|| {
    error!("no username without collision after several tries (token)");
    GoogleCreateAccountErrorResponse::server_error()
  })?;

  let user_display_name = maybe_user_display_name.ok_or_else(|| {
    error!("no username without collision after several tries (display name)");
    GoogleCreateAccountErrorResponse::server_error()
  })?;

  let _token = insert_google_sign_in_account(InsertGoogleSignInArgs {
    subject,
    maybe_user_token: Some(&user_token),
    email_address: &email_address, // NB: The one from the Google claims, not our canonicalized one.
    is_email_verified: claims.email_verified(),
    maybe_locale: None, // TODO
    maybe_name: None, // TODO
    maybe_given_name: None, // TODO
    maybe_family_name: None, // TODO
    creator_ip_address: &ip_address,
    transaction: &mut transaction,
  }).await.map_err(|err| {
    warn!("error inserting google sign in account: {:?}", err);
    GoogleCreateAccountErrorResponse::server_error()
  })?;

  transaction.commit()
      .await
      .map_err(|e| {
        warn!("Could not commit transaction: {:?}", e);
        GoogleCreateAccountErrorResponse::server_error()
      })?;

  Ok(NewSsoAccountInfo {
    user_token,
    user_display_name,
    username_is_not_customized: true, // New account with random username
  })
}

fn studio_feature_flags() -> Option<String> {
  let mut user_feature_flags = UserSessionFeatureFlags::empty();

  user_feature_flags.add_flags([
    UserFeatureFlag::Studio,
    UserFeatureFlag::VideoStyleTransfer,
  ]);

  let user_feature_flags = user_feature_flags
      .maybe_serialize_string();

  user_feature_flags
}
