use anyhow::anyhow;
use sqlx::MySqlPool;
use enums::common::visibility::Visibility;
use enums::by_table::generic_synthetic_ids::id_category::IdCategory;

use errors::AnyhowResult;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::users::UserToken;
use crate::queries::generic_synthetic_ids::transactional_increment_generic_synthetic_id::transactional_increment_generic_synthetic_id;

pub struct UpdateMediaFileArgs<'a> {
    pub media_file_token: &'a MediaFileToken,
    pub maybe_creator_user_token: Option<&'a str>,
    pub creator_ip_address: &'a str,
    pub creator_set_visibility: &'a Visibility,
    pub maybe_mod_user_token: Option<&'a str>,
    pub mysql_pool: &'a MySqlPool
}

pub async fn update_media_file(args: UpdateMediaFileArgs<'_>) -> AnyhowResult<()>{
    // TODO: enforce checks for idempotency token
    let mut transaction = args.mysql_pool.begin().await?;
    let query_result = sqlx::query!(
        r#"
        UPDATE media_files
        SET
            maybe_creator_user_token = ?,
            creator_ip_address = ?,
            creator_set_visibility = ?,
            maybe_mod_user_token = ?

        WHERE token = ?
        LIMIT 1
        "#,
        args.maybe_creator_user_token,
        args.creator_ip_address,
        args.creator_set_visibility.to_str(),
        args.maybe_mod_user_token,
        args.media_file_token.as_str(),
    ).execute(args.mysql_pool).await;
    // TODO(Kasisnu): This should probably rollback
    transaction.commit().await?;
    match query_result {
        Ok(_) => Ok(()),
        Err(err) => Err(anyhow!("media_file update error: {:?}", err)),
    }
}