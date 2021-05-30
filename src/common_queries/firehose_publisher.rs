use anyhow::anyhow;
use crate::util::anyhow_result::AnyhowResult;
use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;
use log::{warn,info};
use sqlx::{MySqlPool};
use std::sync::Arc;
use sqlx::error::Error::Database;

enum FirehoseEvent {
  UserSignUp,
}

impl FirehoseEvent {
  pub fn to_db_value(&self) -> &'static str {
    match self {
      FirehoseEvent::UserSignUp => "user_sign_up",
    }
  }
}

#[derive(Clone)]
pub struct FirehosePublisher {
  pub mysql_pool: MySqlPool,
}

impl FirehosePublisher {

  pub async fn publish_user_sign_up(&self, user_token: &str) -> AnyhowResult<()> {
    let token = random_prefix_crockford_token("EV", 32)?;
    let event_type = FirehoseEvent::UserSignUp;

    let query_result = sqlx::query!(
        r#"
INSERT INTO firehose_entries
SET
  token = ?,
  event_type = ?,
  maybe_target_user_token = ?,
  maybe_target_entity_token = ?
        "#,
      token,
      event_type.to_db_value(),
      user_token,
      user_token,
    )
      .execute(&self.mysql_pool)
      .await;

    let record_id = match query_result {
      Ok(res) => {
        res.last_insert_id()
      },
      Err(err) => {
        warn!("Insert record DB error: {:?}", err);

        // NB: SQLSTATE[23000]: Integrity constraint violation
        // NB: MySQL Error Code 1062: Duplicate key insertion (this is harder to access)
        match err {
          Database(err) => {
            let maybe_code = err.code().map(|c| c.into_owned());
            /*match maybe_code.as_deref() {
              Some("23000") => {
                if err.message().contains("username") {
                  return Err(UsernameTaken);
                } else if err.message().contains("email_address") {
                  return Err(EmailTaken);
                }
              }
              _ => {},
            }*/
          },
          _ => {},
        }
        return Err(anyhow!("Error inserting record"));
      }
    };


    Ok(())
  }
}
