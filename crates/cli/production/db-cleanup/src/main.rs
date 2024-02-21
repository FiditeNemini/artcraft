use log::info;
use sqlx::{MySql, Pool};
use sqlx::mysql::MySqlPoolOptions;

use container_common::anyhow_result::AnyhowResult;
use easyenv::init_all_with_default_logging;

use crate::cli_args::Action;
use crate::operations::delete_user_files::delete_user_files::delete_user_files;

mod cli_args;
mod operations;

#[tokio::main]
async fn main() -> AnyhowResult<()> {
  println!("db-cleanup: hard or soft delete database records");

  init_all_with_default_logging(None);

  // NB: This secrets file differs from the rest because we might want to delete from production.
  // (Hopefully this isn't getting out of hand at this point.)
  easyenv::from_filename(".env-db-cleanup-secrets")?;

  let args = cli_args::parse_cli_args()?;

  let mysql = get_mysql("MYSQL_PRODUCTION_URL").await?;

  match args.action {
    Action::DeleteUserFiles => {
      delete_user_files(&args, &mysql).await?;
    }
  }

  Ok(())
}

async fn get_mysql(env_var_name: &str) -> errors::AnyhowResult<Pool<MySql>> {
  info!("Connecting to MySQL {env_var_name}...");

  let pool = MySqlPoolOptions::new()
      .max_connections(easyenv::get_env_num("MYSQL_MAX_CONNECTIONS", 3)?)
      .connect(&easyenv::get_env_string_required(env_var_name)?)
      .await?;

  Ok(pool)
}
