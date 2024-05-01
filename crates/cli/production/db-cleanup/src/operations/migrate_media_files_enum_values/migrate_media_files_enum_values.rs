use std::thread;
use std::time::Duration;
use log::info;
use sqlx::{MySql, Pool};

use errors::{anyhow, AnyhowResult};
use mysql_queries::queries::users::user_profiles::get_user_profile_by_username::get_user_profile_by_username;

use crate::cli_args::Args;
use crate::operations::delete_user_files::delete_user_files::delete_all_files;
use crate::operations::migrate_media_files_enum_values::query_pair::QueryPair;

pub async fn migrate_media_files_enum_values(_args: &Args, mysql: &Pool<MySql>) -> AnyhowResult<()> {
  info!("migrate all media files enum values");

  let query_pair = QueryPair {
    count_query: r#"
      select count(*) as record_count
      from media_files
      where media_class = "unknown"
      and maybe_origin_model_type = "so_vits_svc"
    "#.to_string(),
    migrate_query: r#"
      update media_files
      set media_class = "audio"
      where media_class = "unknown"
      and maybe_origin_model_type = "so_vits_svc"
      limit 50000
    "#.to_string(),
  };

  run_query_pair(&query_pair, mysql).await?;

  Ok(())
}

pub async fn run_query_pair(query_pair: &QueryPair, mysql: &Pool<MySql>) -> AnyhowResult<()> {
  loop {
    info!("Running count query: {}", query_pair.count_query());

    let count = query_pair.run_count_query(mysql).await?;

    info!("Count: {}", count);
    if count == 0 {
      break;
    }

    info!("Running migrate query: {}", query_pair.migrate_query());
    query_pair.run_migrate_query(&mysql).await?;

    thread::sleep(Duration::from_millis(1000));
  }

  Ok(())
}
