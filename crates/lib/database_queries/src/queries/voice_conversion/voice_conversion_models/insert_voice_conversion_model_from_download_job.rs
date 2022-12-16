use anyhow::anyhow;
use chrono::Utc;
use container_common::anyhow_result::AnyhowResult;
use reusable_types::db::enums::entity_visibility::EntityVisibility;
use sqlx::MySqlPool;
use std::path::Path;
use tokens::voice_conversion::model::VoiceConversionModelToken;

pub struct Args<'a, P: AsRef<Path>> {
  pub title: &'a str,

  pub original_download_url: &'a str,
  pub original_filename: &'a str,
  pub file_size_bytes: u64,

  pub creator_user_token: &'a str,
  pub creator_ip_address: &'a str,
  pub creator_set_visibility: EntityVisibility,

  pub private_bucket_hash: &'a str,
  pub private_bucket_object_name: P,

  pub mysql_pool: &'a MySqlPool,
}


pub async fn insert_voice_conversion_model_from_download_job<P: AsRef<Path>>(
  args: Args<'_, P>,
) -> AnyhowResult<(u64, VoiceConversionModelToken)> {

  let model_token = VoiceConversionModelToken::generate();

  let private_bucket_object_name = &args.private_bucket_object_name
      .as_ref()
      .display()
      .to_string();

  // NB: 'rocket_vc' is codename for 'softvc'
  let query_result = sqlx::query!(
        r#"
INSERT INTO voice_conversion_models
SET
  token = ?,
  model_type = "rocket_vc",
  title = ?,
  description_markdown = '',
  description_rendered_html = '',
  creator_user_token = ?,
  ip_address_creation = ?,
  ip_address_last_update = ?,
  original_download_url = ?,
  private_bucket_hash = ?,
  private_bucket_object_name = ?,
  file_size_bytes = ?
        "#,
      &model_token,
      args.title,
      args.creator_user_token,
      args.creator_ip_address,
      args.creator_ip_address,
      args.original_download_url,
      args.private_bucket_hash,
      private_bucket_object_name,
      args.file_size_bytes
    )
      .execute(args.mysql_pool)
      .await;

  let record_id = match query_result {
    Ok(res) => res.last_insert_id(),
    Err(err) => return Err(anyhow!("Mysql error: {:?}", err)),
  };

  Ok((record_id, model_token))
}
