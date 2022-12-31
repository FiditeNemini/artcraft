use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use enums::core::visibility::Visibility;
use enums::workers::generic_download_type::GenericDownloadType;
use sqlx::MySqlPool;
use tokens::jobs::download::DownloadJobToken;

pub struct Args <'a> {
  pub job_token: &'a DownloadJobToken,
  pub uuid_idempotency_token: &'a str,
  pub download_type: GenericDownloadType,
  pub download_url: &'a str,
  pub title: &'a str,
  pub creator_user_token: &'a str,
  pub creator_ip_address: &'a str,
  pub creator_set_visibility: Visibility,
  pub mysql_pool: &'a MySqlPool,
}

pub async fn insert_generic_download_job(args: Args<'_>) -> AnyhowResult<u64> {

  let query = sqlx::query!(
        r#"
INSERT INTO generic_download_jobs
SET
  token = ?,
  uuid_idempotency_token = ?,
  download_type = ?,
  download_url = ?,
  title = ?,
  creator_user_token = ?,
  creator_ip_address = ?,
  creator_set_visibility = ?,
  status = "pending"
        "#,
        args.job_token,
        args.uuid_idempotency_token,
        args.download_type.to_str(),
        args.download_url,
        args.title,
        args.creator_user_token,
        args.creator_ip_address,
        args.creator_set_visibility.to_str(),
    );

  let query_result = query.execute(args.mysql_pool)
      .await;

  let record_id = match query_result {
    Ok(res) => {
      res.last_insert_id()
    },
    Err(err) => {
      return Err(anyhow!("error inserting new generic download job: {:?}", err));
    }
  };

  Ok(record_id)
}
