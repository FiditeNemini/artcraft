use anyhow::anyhow;
use log::warn;
use sqlx::error::Error::Database;
use sqlx::MySqlPool;

use errors::AnyhowResult;
use tokens::tokens::tts_model_upload_jobs::TtsModelUploadJobToken;

pub struct InsertTtsModelUploadJobArgs<'a> {
  pub uuid: &'a str,
  pub creator_user_token: &'a str,
  pub creator_ip_address: &'a str,
  pub creator_set_visibility: &'a str,
  pub title: &'a str,
  pub tts_model_type: &'a str,
  pub download_url: &'a str,

  pub mysql_pool: &'a MySqlPool,
}

// NB: Returns job token
pub async fn insert_tts_model_upload_job(args: InsertTtsModelUploadJobArgs<'_>) -> AnyhowResult<String> {
  // This token is returned to the client.
  let job_token = TtsModelUploadJobToken::generate().to_string();

  let query_result = sqlx::query!(
        r#"
INSERT INTO tts_model_upload_jobs
SET
  token = ?,
  uuid_idempotency_token = ?,
  creator_user_token = ?,
  creator_ip_address = ?,
  creator_set_visibility = ?,
  title = ?,
  tts_model_type = ?,
  download_url = ?,
  status = "pending"
        "#,
        job_token.to_string(),
        args.uuid,
        args.creator_user_token,
        args.creator_ip_address,
        args.creator_set_visibility,
        args.title,
        args.tts_model_type,
        args.download_url,
    )
      .execute(args.mysql_pool)
      .await;

  let _record_id = match query_result {
    Ok(res) => {
      res.last_insert_id()
    },
    Err(err) => {
      warn!("New tts model upload creation DB error: {:?}", err);

      // NB: SQLSTATE[23000]: Integrity constraint violation
      // NB: MySQL Error Code 1062: Duplicate key insertion (this is harder to access)
      match err {
        Database(ref err) => {
          let _maybe_code = err.code().map(|c| c.into_owned());
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
      return Err(anyhow!("error inserting model upload job record: {:?}", err));
    }
  };

  Ok(job_token)
}
