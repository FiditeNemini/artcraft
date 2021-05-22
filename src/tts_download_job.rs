#![allow(dead_code)]
#![allow(unused_mut)]
#![allow(unused_imports)]
#![warn(unused_must_use)]
//#![allow(warnings)]

pub mod job;
pub mod util;

use chrono::Utc;
use crate::job::job_queries::TtsUploadJobRecord;
use crate::job::job_queries::query_tts_upload_job_records;
use crate::util::anyhow_result::AnyhowResult;
use log::info;
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use std::time::Duration;

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
    let jobs = query_tts_upload_job_records(&pool).await;
    for job in jobs {
      info!("Job: {:?}", job);
    }
    std::thread::sleep(Duration::from_millis(500));
  }

  Ok(())
}

