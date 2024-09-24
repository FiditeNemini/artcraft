// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use chrono::{DateTime, Utc};
use sqlx::{Executor, MySql};

use crate::helpers::boolean_converters::i8_to_bool;
use crate::helpers::transform_optional_result::transform_optional_result;
use errors::AnyhowResult;
use tokens::tokens::google_sign_in_accounts::GoogleSignInAccountToken;
use tokens::tokens::users::UserToken;

#[derive(Serialize, Debug)]
pub struct GoogleSignInAccount {
  pub token: GoogleSignInAccountToken,

  /// Google's identifier for the user
  pub subject: String,

  pub maybe_user_token: Option<UserToken>,

  pub email_address: Option<String>,
  pub is_email_verified: bool,

  pub maybe_locale: Option<String>,

  pub maybe_name: Option<String>,
  pub maybe_given_name: Option<String>,
  pub maybe_family_name: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
struct GoogleSignInAccountRaw {
  token: GoogleSignInAccountToken,

  subject: String,

  maybe_user_token: Option<UserToken>,

  email_address: Option<String>,
  is_email_verified: i8,

  maybe_locale: Option<String>,

  maybe_name: Option<String>,
  maybe_given_name: Option<String>,
  maybe_family_name: Option<String>,

  created_at: DateTime<Utc>,
  updated_at: DateTime<Utc>,
}

pub async fn get_google_sign_in_account<'a, 'e, E>(
  subject: &str,
  mysql_executor: E,
)
  -> AnyhowResult<Option<GoogleSignInAccount>>
where E: 'a + Executor<'e, Database = MySql>
{
  let record = select_record(subject, mysql_executor).await;

  let record = match transform_optional_result(record)? {
    None => return Ok(None),
    Some(record) => record,
  };

  Ok(Some(GoogleSignInAccount{
    token: record.token,
    subject: record.subject,
    maybe_user_token: record.maybe_user_token,
    email_address: record.email_address,
    is_email_verified: i8_to_bool(record.is_email_verified),
    maybe_locale: record.maybe_locale,
    maybe_name: record.maybe_name,
    maybe_given_name: record.maybe_given_name,
    maybe_family_name: record.maybe_family_name,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }))
}

async fn select_record<'a, 'e, E>(
  subject: &str,
  mysql_executor: E,
)
  -> Result<GoogleSignInAccountRaw, sqlx::Error>
where E: 'a + Executor<'e, Database = MySql>
{
  sqlx::query_as!(
      GoogleSignInAccountRaw,
        r#"
SELECT
    token as `token: tokens::tokens::google_sign_in_accounts::GoogleSignInAccountToken`,

    subject,

    maybe_user_token as `maybe_user_token: tokens::tokens::users::UserToken`,

    email_address,
    is_email_verified,

    maybe_locale,
    maybe_name,
    maybe_given_name,
    maybe_family_name,

    created_at,
    updated_at

FROM google_sign_in_accounts
WHERE
    subject = ?
        "#,
     subject
    )
      .fetch_one(mysql_executor)
      .await
}
