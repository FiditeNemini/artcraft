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
      email_address: args.email_address,
      email_gravatar_hash: args.email_gravatar_hash,
      password_hash: args.password_hash,
      ip_address: args.ip_address,
      maybe_source: args.maybe_source,
      maybe_user_token: args.maybe_user_token,
    },
    Transactor::for_pool(mysql_pool),
  ).await?;

  Ok(CreateAccountSuccessResult {
    user_token: result.user_token,
    user_id: result.user_id,
  })
}
