use std::time::Duration;
use elasticsearch::Elasticsearch;

use log::info;
use sqlx::mysql::MySqlPoolOptions;

use cloud_storage::bucket_client::BucketClient;
use config::shared_constants::{DEFAULT_MYSQL_CONNECTION_STRING, DEFAULT_RUST_LOG};
use errors::AnyhowResult;
use crate::cli_args::parse_cli_args;

use crate::seeding::users::seed_user_accounts;
use crate::seeding::voice_conversion::seed_voice_conversion;
use crate::seeding::zero_shot_tts::seed_zero_shot_tts;

pub mod cli_args;
pub mod seeding;

#[tokio::main]
pub async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  info!("Database seed CLI script.");

  // NB: Read secrets (eg. ACCESS_KEY)
  easyenv::from_filename(".env-secrets")?;

  let db_connection_string =
      easyenv::get_env_string_or_default(
        "MYSQL_URL",
        DEFAULT_MYSQL_CONNECTION_STRING);

  let pool = MySqlPoolOptions::new()
      .max_connections(easyenv::get_env_num("MYSQL_MAX_CONNECTIONS", 3)?)
      .connect(&db_connection_string)
      .await?;

  let args = parse_cli_args()?;

  let mut maybe_public_bucket_client = None;

  if args.seed_cloud_bucket {
    maybe_public_bucket_client = Some(get_bucket_client()?);
  }

  let mut maybe_elasticsearch = None;

  if args.seed_elasticsearch {
    maybe_elasticsearch = Some(get_elasticsearch_client());
  }

  seed_user_accounts(&pool).await?;
  seed_zero_shot_tts(&pool, maybe_public_bucket_client.as_ref()).await?;
  seed_voice_conversion(&pool).await?;

  info!("Done!");
  Ok(())
}

fn get_bucket_client() -> AnyhowResult<BucketClient> {
  let access_key = easyenv::get_env_string_required("ACCESS_KEY")?;
  let secret_key = easyenv::get_env_string_required("SECRET_KEY")?;
  let region_name = easyenv::get_env_string_required("REGION_NAME")?;
  let public_bucket_name = easyenv::get_env_string_required("PUBLIC_BUCKET_NAME")?;

  let bucket_timeout = easyenv::get_env_duration_seconds_or_default(
    "BUCKET_TIMEOUT_SECONDS", Duration::from_secs(60 * 5));

  info!("Configuring GCS bucket...");

  let public_bucket_client = BucketClient::create(
    &access_key,
    &secret_key,
    &region_name,
    &public_bucket_name,
    None,
    Some(bucket_timeout),
  )?;

  Ok(public_bucket_client)
}

fn get_elasticsearch_client() -> AnyhowResult<Elasticsearch> {
  // TODO(bt,2023-10-26): Allow connecting to instances by URL instead of the default dev URL.
  let client = Elasticsearch::default();
  Ok(client)
}
