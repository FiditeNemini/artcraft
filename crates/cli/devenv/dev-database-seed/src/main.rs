use elasticsearch::Elasticsearch;
use log::info;
use sqlx::{MySql, Pool};
use sqlx::mysql::MySqlPoolOptions;

use config::shared_constants::{DEFAULT_MYSQL_CONNECTION_STRING, DEFAULT_RUST_LOG};
use errors::AnyhowResult;

use crate::cli_args::parse_cli_args;
use crate::seeding::users::seed_user_accounts;

pub mod bucket_clients;

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

  let _args = parse_cli_args()?;

  //let mut maybe_bucket_clients = None;

  //if args.seed_cloud_bucket {
  //  maybe_bucket_clients = Some(get_bucket_clients()?);
  //}

//  let mut maybe_elasticsearch = None;
//
//  if args.seed_elasticsearch {
//    maybe_elasticsearch = Some(get_elasticsearch_client());
//  }

  idempotent_always_seed(&pool).await?;

  // seed_media_files(&pool, maybe_bucket_clients.as_ref()).await?;
  //seed_zero_shot_tts(&pool, maybe_bucket_clients.as_ref()).await?;
  // seed_voice_conversion(&pool).await?;
  //seed_weights(&pool).await?;
  // seed_media_seedtool(&pool).await?;
  // seed_tts_tacotron2(&pool, maybe_bucket_clients.as_ref()).await?;
  
  // should seed the weights with a few files for hanashi
  //seed_weights_files(&pool, maybe_bucket_clients.as_ref()).await?;
  //println!("TESTING DOWLOAD");
  //test_seed_weights_files().await?;
  //info!("Done!");
  Ok(())
}

async fn idempotent_always_seed(mysql: &Pool<MySql>) -> AnyhowResult<()> {
  // NB: The following seed functions do not need to be commented out or removed.
  // They should be idempotent and always useful.
  seed_user_accounts(mysql).await?;
  Ok(())
}

fn get_elasticsearch_client() -> AnyhowResult<Elasticsearch> {
  // TODO(bt,2023-10-26): Allow connecting to instances by URL instead of the default dev URL.
  let client = Elasticsearch::default();
  Ok(client)
}
