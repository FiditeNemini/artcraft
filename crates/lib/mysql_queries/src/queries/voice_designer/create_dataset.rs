use anyhow::anyhow;
use sqlx::MySqlPool;
use enums::common::visibility::Visibility;

use errors::AnyhowResult;
use tokens::tokens::dataset::ZsDatasetToken;

pub struct CreateDatasetArgs<'a> {
    pub dataset_token: &'a ZsDatasetToken,
    pub dataset_title: &'a str,
    pub maybe_creator_user_token: Option<&'a str>,
    pub creator_ip_address: &'a str,
    pub creator_set_visibility: &'a Visibility,
    pub maybe_mod_user_token: Option<&'a str>,
    pub mysql_pool: &'a MySqlPool
}

pub async fn create_dataset(args: CreateDatasetArgs<'_>) -> AnyhowResult<()>{

    // (KS/noob questions): confirm if dataset version is different from synthetic id
    // * confirm if language tags can only be "updated" or should be configurable on create
    // * should dataset token be passed in or created here?
    // * how is the anonymous visitor token brought down here?
    // ie, how are users anonymous if user session is validated before we reach here
    // * could creator token be null?
    // TODO: enforce checks for idempotency token

    let query_result = sqlx::query!(
        r#"
        INSERT INTO zs_voice_datasets
        SET
            token = ?,
            title = ?,
            maybe_creator_user_token = ?,
            creator_ip_address = ?,
            creator_set_visibility = ?,
            maybe_mod_user_token = ?
        "#,
        args.dataset_token.as_str(),
        args.dataset_title,
        args.maybe_creator_user_token,
        args.creator_ip_address,
        args.creator_set_visibility.to_str(),
        args.maybe_mod_user_token
    ).execute(args.mysql_pool).await;

    match query_result {
        Ok(_) => Ok(()),
        Err(err) => Err(anyhow!("zs dataset creation error: {:?}", err)),
    }

}

