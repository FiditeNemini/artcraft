use anyhow::anyhow;
use sqlx::MySqlPool;
use enums::common::visibility::Visibility;
use enums::by_table::generic_synthetic_ids::id_category::IdCategory;

use errors::AnyhowResult;
use tokens::tokens::zs_dataset::ZsDatasetToken;
use tokens::tokens::zs_voice::ZsVoiceToken;
use tokens::users::user::UserToken;
use crate::queries::generic_synthetic_ids::transactional_increment_generic_synthetic_id::transactional_increment_generic_synthetic_id;

pub struct CreateVoiceArgs<'a> {
    pub voice_token: &'a ZsVoiceToken,

    pub dataset_token: &'a ZsDatasetToken,
    pub dataset_version: u64,

    pub model_category: &'a str,
    pub model_type: &'a str,
    pub model_version: u64,
    pub model_encoding_type: &'a str,

    pub voice_title: &'a str,
    // TODO(Kasisnu): Is this a create/update field?
    // should it be nullable
    pub bucket_hash: &'a str,
    pub maybe_creator_user_token: Option<&'a str>,
    pub maybe_mod_user_token: Option<&'a str>,

    pub creator_ip_address: &'a str,
    pub creator_set_visibility: &'a Visibility,
    pub mysql_pool: &'a MySqlPool
}

// pub async fn create_voice(args: CreateVoiceArgs<'_>) -> AnyhowResult<()>{
//     // TODO: enforce checks for idempotency token
//     let mut maybe_creator_synthetic_id : Option<u64> = None;
//
//     let mut transaction = args.mysql_pool.begin().await?;
//     if let Some(creator_user_token) = args.maybe_creator_user_token.as_deref() {
//         let user_token = UserToken::new_from_str(creator_user_token);
//
//         let next_zs_dataset_synthetic_id = transactional_increment_generic_synthetic_id(
//             &user_token,
//             IdCategory::ZsVoice,
//             &mut transaction
//         ).await?;
//
//         maybe_creator_synthetic_id = Some(next_zs_dataset_synthetic_id);
//     }
//
// }
//
