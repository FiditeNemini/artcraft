#![allow(dead_code)]
#![allow(unused_mut)]
#![allow(unused_imports)]
#![warn(unused_must_use)]
//#![allow(warnings)]

pub mod util;

use crate::util::anyhow_result::AnyhowResult;
use std::time::Duration;
use log::info;
use chrono::Utc;
use sqlx::mysql::MySqlPoolOptions;
use sqlx::MySqlPool;

const DEFAULT_RUST_LOG: &'static str = "debug,actix_web=info";

#[async_std::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  info!("Obtaining hostname...");

  let server_hostname = hostname::get()
    .ok()
    .and_then(|h| h.into_string().ok())
    .unwrap_or("storyteller-web-unknown".to_string());

  info!("Hostname: {}", &server_hostname);

  let db_connection_string =
    easyenv::get_env_string_or_default(
      "MYSQL_URL",
      "mysql://root:root@localhost/storyteller");

  info!("Connecting to database...");

  let pool = MySqlPoolOptions::new()
    .max_connections(5)
    .connect(&db_connection_string)
    .await?;


  loop {
    query_and_download(&pool).await;
    std::thread::sleep(Duration::from_millis(500));
  }

  Ok(())
}

/// table: tts_model_upload_jobs
#[derive(Debug)]
pub struct JobRecord {
  pub id: i64,
  pub uuid_idempotency_token: String,
  pub creator_user_token: String,
  pub creator_ip_address: String,
  pub creator_set_visibility: String, // TODO
  pub title: String,
  pub tts_model_type: String, // TODO
  pub maybe_subject_token: Option<String>,
  pub maybe_actor_subject_token: Option<String>,
  pub download_url: Option<String>,
  pub download_url_type: String, // TODO
  pub status: String, // TODO
  pub attempt_count: i32,
  pub failure_reason: Option<String>,
  pub created_at: chrono::DateTime<Utc>,
  pub updated_at: chrono::DateTime<Utc>,
  pub retry_at: Option<chrono::DateTime<Utc>>,
}

pub async fn query_and_download(pool: &MySqlPool) {

  let job_records = sqlx::query_as!(
      JobRecord,
        r#"
SELECT *
FROM tts_model_upload_jobs
WHERE
  (
    status IN ("pending", "attempt_failed")
  )
  AND
  (
    retry_at IS NULL
    OR
    retry_at < CURRENT_TIMESTAMP
  )
  LIMIT 20
        "#,
    )
    .fetch_all(pool)
    .await; // TODO: This will return error if it doesn't exist

  info!("Job records...");
  for job_record in job_records {
    info!("job record: {:?}", job_record);
  }
/*

  let query_result = sqlx::query!(
        r#"
INSERT INTO w2l_template_upload_jobs
SET
  uuid_idempotency_token = ?,
  creator_user_token = ?,
  creator_ip_address = ?,
  creator_set_visibility = ?,
  title = ?,
  template_type = ?,
  maybe_subject_token = ?,
  maybe_actor_subject_token = ?,
  download_url = ?,
  download_url_type = ?,
  status = "pending"
        "#,
        uuid.to_string(),
        user_session.user_token.to_string(),
        ip_address.to_string(),
        creator_set_visibility.to_string(),
        title.to_string(),
        template_type,
        maybe_subject_token,
        maybe_actor_subject_token,
        download_url,
        download_url_type
    )
    .execute(&server_state.mysql_pool)
    .await;
 */
}