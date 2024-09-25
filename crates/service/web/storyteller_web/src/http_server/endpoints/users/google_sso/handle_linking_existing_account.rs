use crate::http_server::endpoints::users::google_sso::google_sso_handler::GoogleCreateAccountErrorResponse;
use crate::http_server::endpoints::users::google_sso::handle_new_sso_account::NewSsoAccountInfo;
pub use actix_web::HttpRequest;
use google_sign_in::claims::claims::Claims;
use http_server_common::request::get_request_ip::get_request_ip;
use log::warn;
use mysql_queries::queries::google_sign_in_accounts::insert_google_sign_in_account::{insert_google_sign_in_account, InsertGoogleSignInArgs};
use mysql_queries::queries::users::user::lookup_user_for_login_result::UserRecordForLogin;
use sqlx::pool::PoolConnection;
use sqlx::{Acquire, MySql};

pub async fn handle_linking_existing_account(
  user_account: UserRecordForLogin,
  http_request: &HttpRequest,
  subject: &str,
  mysql_connection: &mut PoolConnection<MySql>,
  claims: Claims,
)
  -> Result<NewSsoAccountInfo, GoogleCreateAccountErrorResponse>
{
  // TODO: Double check email address in the claims before linking!

  let mut transaction = mysql_connection.begin()
      .await
      .map_err(|e| {
        warn!("Could not begin transaction: {:?}", e);
        GoogleCreateAccountErrorResponse::server_error()
      })?;

  let ip_address = get_request_ip(&http_request);

  let _token = insert_google_sign_in_account(InsertGoogleSignInArgs {
    subject,
    maybe_user_token: Some(&user_account.token),
    email_address: "todo@todo.com", // TODO // NB: The one from the Google claims, not our canonicalized one.
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
    user_token: user_account.token,
    user_display_name: user_account.display_name,
    username_is_not_customized: user_account.username_is_not_customized,
  })
}
