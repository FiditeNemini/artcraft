use crate::http_server::endpoints::users::google_sso::google_sso_handler::GoogleCreateAccountErrorResponse;
use actix_web::HttpRequest;
use http_server_common::request::get_request_ip::get_request_ip;
use log::warn;
use mysql_queries::queries::google_sign_in_accounts::get_google_sign_in_account_by_subject::GoogleSignInAccount;
use mysql_queries::queries::users::user_sessions::create_user_session_with_transactor::create_user_session_with_transactor;
use mysql_queries::utils::transactor::Transactor;
use sqlx::pool::PoolConnection;
use sqlx::MySql;

pub async fn handle_existing_sso_account(
  http_request: &HttpRequest,
  sso_account: GoogleSignInAccount,
  mysql_connection: &mut PoolConnection<MySql>,
)
  -> Result<(), GoogleCreateAccountErrorResponse>
{
  let user_token = match sso_account.maybe_user_token {
    Some(token) => token.clone(),
    None => {
      // NB: If accounts get into this state (e.g. if we support de-linking), we'll need to
      // consider how to migrate accounts and handle all the various account states.
      // For now, we'll just deny this possibility.
      warn!("no user token for existing google sign in account");
      return Err(GoogleCreateAccountErrorResponse::server_error());
    },
  };

  let ip_address = get_request_ip(&http_request);

  let create_session_result = create_user_session_with_transactor(
    &user_token,
    &ip_address,
    Transactor::for_connection(mysql_connection),
  ).await;

  Ok(())
}
