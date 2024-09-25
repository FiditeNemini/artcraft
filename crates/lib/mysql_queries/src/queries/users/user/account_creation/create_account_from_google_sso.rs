// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use crate::queries::users::user::account_creation::create_account_error::CreateAccountError;
use crate::queries::users::user::account_creation::create_account_generic::{create_account_generic, GenericCreateAccountArgs};
use crate::utils::transactor::Transactor;
use tokens::tokens::users::UserToken;

/// SSO accounts do not have passwords at account creation
/// The password hash field is nullable, so we can't leave it null/empty.
const SSO_PASSWORD : &str = "*";

pub struct CreateAccountFromGoogleSsoArgs<'a> {
  pub username: &'a str,
  pub display_name: &'a str,

  pub email_address: &'a str,
  pub email_gravatar_hash: &'a str,
  pub email_confirmed_by_google: bool,

  pub ip_address: &'a str,
  pub maybe_source: Option<&'a str>,
}

pub async fn create_account_from_google_sso(
  args: CreateAccountFromGoogleSsoArgs<'_>,
  transactor: Transactor<'_, '_>,
) -> Result<UserToken, CreateAccountError>
{

  let result= create_account_generic(
    GenericCreateAccountArgs {
      username: args.username,
      display_name: args.display_name,
      ip_address: args.ip_address,
      maybe_source: args.maybe_source,
      maybe_feature_flags: None,
      maybe_create_method: None, // TODO

      // SSO accounts have an email reported from Google
      email_address: args.email_address,
      email_gravatar_hash: args.email_gravatar_hash,
      email_confirmed_by_google: args.email_confirmed_by_google,

      // SSO accounts start without a password
      password_hash: SSO_PASSWORD,
      is_without_password: true,

      // NB: This is just for testing.
      maybe_user_token: None,
    },
    transactor,
  ).await?;

  Ok(result.user_token)
}
