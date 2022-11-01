// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use crate::tokens::Tokens;
use log::warn;
use sqlx::MySqlPool;
use sqlx::error::Error::Database;

pub struct CreateAccountArgs<'a> {
  pub username: &'a str,
  pub display_name: &'a str,
  pub email_address: &'a str,
  pub email_gravatar_hash: &'a str,
  pub password_hash: &'a str,
  pub ip_address: &'a str,
}

pub struct CreateAccountSuccessResult {
  pub user_token: String,
  pub user_id: u64,
}

pub enum CreateAccountError {
  EmailIsTaken,
  UsernameIsTaken,
  DatabaseError,
  OtherError,
}

pub async fn create_account(
  mysql_pool: &MySqlPool,
  args: CreateAccountArgs<'_>,
) -> Result<CreateAccountSuccessResult, CreateAccountError>
{
  const INITIAL_PROFILE_MARKDOWN : &'static str = "";
  const INITIAL_PROFILE_RENDERED_HTML : &'static str = "";
  const INITIAL_USER_ROLE: &'static str = "user";

  let user_token = Tokens::new_user()
      .map_err(|_e| {
        warn!("problem creating user token");
        CreateAccountError::OtherError
      })?;

  let query_result = sqlx::query!(
        r#"
INSERT INTO users (
  token,
  username,
  display_name,
  email_address,
  email_gravatar_hash,
  profile_markdown,
  profile_rendered_html,
  user_role_slug,
  password_hash,
  ip_address_creation,
  ip_address_last_login,
  ip_address_last_update
)
VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
        "#,
        &user_token,
        args.username,
        args.display_name,
        args.email_address,
        args.email_gravatar_hash,
        INITIAL_PROFILE_MARKDOWN,
        INITIAL_PROFILE_RENDERED_HTML,
        INITIAL_USER_ROLE,
        args.password_hash,
        args.ip_address,
        args.ip_address,
        args.ip_address,
    )
      .execute(mysql_pool)
      .await;

  let record_id = match query_result {
    Ok(res) => {
      res.last_insert_id()
    },
    Err(err) => {
      warn!("New user creation DB error: {:?}", err);

      // NB: SQLSTATE[23000]: Integrity constraint violation
      // NB: MySQL Error Code 1062: Duplicate key insertion (this is harder to access)
      match err {
        Database(err) => {
          let maybe_code = err.code().map(|c| c.into_owned());
          match maybe_code.as_deref() {
            Some("23000") => {
              if err.message().contains("username") {
                return Err(CreateAccountError::UsernameIsTaken);
              } else if err.message().contains("email_address") {
                return Err(CreateAccountError::EmailIsTaken);
              }
            }
            _ => {},
          }
        },
        _ => {},
      }
      return Err(CreateAccountError::DatabaseError);
    }
  };

  Ok(CreateAccountSuccessResult {
    user_token,
    user_id: record_id,
  })
}
