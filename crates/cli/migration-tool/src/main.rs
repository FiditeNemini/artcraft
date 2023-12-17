//! migration-tool
//!
//! Migrate database records.
//!


use log::info;
use sqlx::{MySql, Pool};
use sqlx::mysql::MySqlPoolOptions;

use config::shared_constants::DEFAULT_RUST_LOG;
use errors::AnyhowResult;

use crate::deps::Deps;
use crate::migrations::voice_conversion_to_weights::migrate::migrate_voice_conversion_to_weights;

pub mod deps;
pub mod migrations;

#[tokio::main]
pub async fn main() -> AnyhowResult<()> {
  println!("migration-tool: migrate database records");

  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  // NB: This secrets file differs from the rest because we might actually want to cross
  // development/production boundaries for migration. We don't want to pull in secrets
  // from other sources. (Hopefully this isn't getting out of hand at this point.)
  easyenv::from_filename(".env-migration-tool-secrets")?;

  let deps = Deps {
    mysql_development: get_mysql("MYSQL_DEVELOPMENT_URL").await?,
    mysql_production: get_mysql("MYSQL_PRODUCTION_URL").await?,
  };

  migrate_voice_conversion_to_weights(&deps).await?;

  Ok(())
}
async fn get_mysql(env_var_name: &str) -> AnyhowResult<Pool<MySql>> {
  info!("Connecting to MySQL {env_var_name}...");

  let pool = MySqlPoolOptions::new()
      .max_connections(easyenv::get_env_num("MYSQL_MAX_CONNECTIONS", 3)?)
      .connect(&easyenv::get_env_string_required(env_var_name)?)
      .await?;

  Ok(pool)
}
