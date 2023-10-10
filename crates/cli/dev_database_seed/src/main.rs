use log::info;
use sqlx::mysql::MySqlPoolOptions;

use config::shared_constants::{DEFAULT_MYSQL_CONNECTION_STRING, DEFAULT_RUST_LOG};
use errors::AnyhowResult;

use crate::seeding::users::seed_user_accounts;
use crate::seeding::voice_conversion::seed_voice_conversion;
use crate::seeding::zero_shot_tts::seed_zero_shot_tts;

pub mod seeding;

#[tokio::main]
pub async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  info!("Database seed CLI script.");

  let db_connection_string =
      easyenv::get_env_string_or_default(
        "MYSQL_URL",
        DEFAULT_MYSQL_CONNECTION_STRING);

  let pool = MySqlPoolOptions::new()
      .max_connections(easyenv::get_env_num("MYSQL_MAX_CONNECTIONS", 3)?)
      .connect(&db_connection_string)
      .await?;

  seed_user_accounts(&pool).await?;
  seed_zero_shot_tts(&pool).await?;
  seed_voice_conversion(&pool).await?;

  info!("Done!");
  Ok(())
}
