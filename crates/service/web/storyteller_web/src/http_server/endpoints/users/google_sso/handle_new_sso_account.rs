use crate::http_server::endpoints::users::google_sso::google_sso_handler::{GoogleCreateAccountErrorResponse, GoogleCreateAccountSuccessResponse};
use crate::http_server::endpoints::users::google_sso::handle_new_sso_account_for_new_user::{handle_new_sso_account_for_new_user, CreateArgs};
use crate::http_server::endpoints::users::google_sso::handle_new_sso_account_for_existing_user::{handle_new_sso_account_for_existing_user, LinkArgs};
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

pub struct NewSsoArgs<'a> {
  pub http_request: &'a HttpRequest,
  pub claims: Claims,
  pub claims_subject: &'a str,
  pub claims_email_address: &'a str,
  pub mysql_connection: &'a mut PoolConnection<MySql>,
}

pub struct NewSsoAccountInfo {
  pub user_token: UserToken,
  pub user_display_name: String,
  pub username_is_not_customized: bool,
}

pub async fn handle_new_sso_account(
  args: NewSsoArgs<'_>
)
  -> Result<NewSsoAccountInfo, GoogleCreateAccountErrorResponse>
{
  // NB: We use this routine to "normalize" email addresses in the user table.
  // It won't necessarily match the email address in the Google claims.
  // A better normalization function in the future may handle dots and plus
  // signs in Gmail addresses, for instance.
  let user_email_address = canonicalize_email_for_users_table(&args.claims_email_address);

  let maybe_user_account =
      lookup_user_for_login_by_email_with_transactor(&user_email_address, Transactor::for_connection(args.mysql_connection))
          .await
          .map_err(|err| {
            warn!("error looking up user by email: {:?}", err);
            GoogleCreateAccountErrorResponse::server_error()
          })?;

  match maybe_user_account {
    Some(user_account) => {
      handle_new_sso_account_for_existing_user(LinkArgs {
        http_request: args.http_request,
        claims: args.claims,
        claims_subject: args.claims_subject,
        claims_email_address: &args.claims_email_address,
        user_account,
        mysql_connection: args.mysql_connection,
      }).await
    },
    None => {
      handle_new_sso_account_for_new_user(CreateArgs {
        http_request: args.http_request,
        claims: args.claims,
        claims_subject: args.claims_subject,
        claims_email_address: &args.claims_email_address,
        user_email_address: &user_email_address,
        mysql_connection: args.mysql_connection,
      }).await
    },
  }
}
