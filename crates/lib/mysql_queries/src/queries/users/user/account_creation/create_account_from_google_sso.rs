// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use sqlx::{MySql, MySqlPool, Transaction};

use crate::queries::users::user::account_creation::create_account_error::CreateAccountError;
use crate::queries::users::user::account_creation::create_account_generic::{create_account_generic, GenericCreateAccountArgs};
use crate::utils::transactor::Transactor;
use tokens::tokens::users::UserToken;

pub struct CreateAccountFromGoogleSsoArgs<'a, 't> {
  pub username: &'a str,
  pub display_name: &'a str,
  pub email_address: &'a str,
  pub email_gravatar_hash: &'a str,
  pub password_hash: &'a str,
  pub ip_address: &'a str,
  pub maybe_source: Option<&'a str>,

  pub transaction: &'a mut Transaction<'t, MySql>,
}

pub async fn create_account_from_google_sso(
  mysql_pool: &MySqlPool,
  args: CreateAccountFromGoogleSsoArgs<'_, '_>,
) -> Result<UserToken, CreateAccountError>
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
      maybe_user_token: None,
    },
    Transactor::for_pool(mysql_pool),
  ).await?;

  Ok(result.user_token)
}
