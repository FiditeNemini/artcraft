use anyhow::anyhow;
use sqlx::MySqlPool;

use enums::by_table::generic_synthetic_ids::id_category::IdCategory;
use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use tokens::tokens::zs_voice_datasets::ZsVoiceDatasetToken;
use tokens::tokens::zs_voices::ZsVoiceToken;
use tokens::tokens::users::UserToken;

use crate::queries::generic_synthetic_ids::transactional_increment_generic_synthetic_id::transactional_increment_generic_synthetic_id;

pub struct CreateVoiceArgs<'a> {
  pub dataset_token: &'a ZsVoiceDatasetToken,

  // TODO(bt,2023-10-06): These should be *Rust Enums* to limit their possible range of values.
  pub model_category: &'a str,
  pub model_type: &'a str,
  pub model_version: u64,
  pub model_encoding_type: &'a str,

  pub voice_title: &'a str,
  // TODO(Kasisnu): Is this a create/update field?
  // should it be nullable
  pub bucket_hash: &'a str,
  pub maybe_creator_user_token: Option<&'a UserToken>,

  pub creator_ip_address: &'a str,
  pub creator_set_visibility: Visibility,
  pub mysql_pool: &'a MySqlPool
}

pub async fn create_voice(args: CreateVoiceArgs<'_>) -> AnyhowResult<ZsVoiceToken>{
  let voice_token = ZsVoiceToken::generate();

  // TODO: enforce checks for idempotency token
  let mut maybe_creator_synthetic_id : Option<u64> = None;

  let mut transaction = args.mysql_pool.begin().await?;

  if let Some(creator_user_token) = args.maybe_creator_user_token.as_deref() {
    let next_zs_dataset_synthetic_id = transactional_increment_generic_synthetic_id(
      creator_user_token,
      IdCategory::ZsDataset,
      &mut transaction
    ).await?;

    maybe_creator_synthetic_id = Some(next_zs_dataset_synthetic_id);
  }

  let query_result = sqlx::query!(
    r#"
    INSERT INTO zs_voices
    SET
      token = ?,
      dataset_token = ?,
      model_category = ?,
      model_type = ?,
      encoding_type = ?,
      title = ?,
      bucket_hash = ?,
      maybe_creator_user_token = ?,
      creator_ip_address = ?,
      creator_set_visibility = ?,
      maybe_creator_synthetic_id = ?
    "#,
    voice_token.as_str(),
    args.dataset_token,
    args.model_category,
    args.model_type,
    args.model_encoding_type,
    args.voice_title,
    args.bucket_hash,
    args.maybe_creator_user_token,
    args.creator_ip_address,
    args.creator_set_visibility.to_str(),
    maybe_creator_synthetic_id
  ).execute(args.mysql_pool).await;

  // TODO(Kasisnu): This should probably rollback
  transaction.commit().await?;

  match query_result {
    Ok(_) => Ok(voice_token),
    Err(err) => Err(anyhow!("zs voice creation error: {:?}", err)),
  }
}