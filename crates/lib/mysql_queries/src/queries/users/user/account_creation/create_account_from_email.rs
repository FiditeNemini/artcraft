// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use sqlx::MySqlPool;

use crate::queries::users::user::account_creation::create_account_error::CreateAccountError;
use crate::queries::users::user::account_creation::create_account_generic::{create_account_generic, GenericCreateAccountArgs};
use crate::utils::transactor::Transactor;
use tokens::tokens::users::UserToken;

pub struct CreateAccountFromEmailArgs<'a> {
  pub username: &'a str,
  pub display_name: &'a str,
  pub email_address: &'a str,
  pub email_gravatar_hash: &'a str,
  pub password_hash: &'a str,
  pub ip_address: &'a str,
  pub maybe_source: Option<&'a str>,

  /// In production code, send this as `None`.
  /// Only provide an external user token for db integration tests and db seeding tools.
  /// This allows for knowing the user token a priori.
  pub maybe_user_token: Option<&'a UserToken>,
}

pub struct CreateAccountSuccessResult {
  pub user_token: UserToken,
  pub user_id: u64,
}


pub async fn create_account_from_email(
  mysql_pool: &MySqlPool,
  args: CreateAccountFromEmailArgs<'_>,
) -> Result<CreateAccountSuccessResult, CreateAccountError>
{
  let result= create_account_generic(
    GenericCreateAccountArgs {
      username: args.username,
      display_name: args.display_name,
      ip_address: args.ip_address,
      maybe_feature_flags: None,
      maybe_source: args.maybe_source,
      maybe_create_method: None, // TODO

      // Email+Password accounts do not yet have confirmed emails
      email_address: args.email_address,
      email_gravatar_hash: args.email_gravatar_hash,
      email_confirmed_by_google: false,

      // Email+Password accounts have passwords (of course)
      password_hash: args.password_hash,
      is_without_password: false,

      // NB: This is just for testing.
      maybe_user_token: args.maybe_user_token,
    },
    Transactor::for_pool(mysql_pool),
  ).await?;

  Ok(CreateAccountSuccessResult {
    user_token: result.user_token,
    user_id: result.user_id,
  })
}
