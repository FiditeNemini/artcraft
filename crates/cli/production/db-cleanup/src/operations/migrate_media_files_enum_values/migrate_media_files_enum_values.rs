use std::thread;
use std::time::Duration;

use log::info;
use sqlx::{MySql, Pool};

use errors::{anyhow, AnyhowResult};

use crate::cli_args::Args;
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

  query_pair.run_migration(mysql).await?;

  Ok(())
}
