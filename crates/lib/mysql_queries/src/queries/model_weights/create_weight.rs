use container_common::anyhow_result::AnyhowResult;
use sqlx::MySqlPool;
use enums::by_table::{
    generic_synthetic_ids::id_category::IdCategory,
    model_weights::{ weights_types::WeightsType, weights_category::WeightsCategory },
};
use enums::common::visibility::Visibility;
use tokens::tokens::{ users::UserToken, model_weights::{ ModelWeightToken, self } };

pub struct CreateModelWeightsArgs<'a> {
    pub token: &'a ModelWeightToken,
    pub weights_type: WeightsType,
    pub weights_category: WeightsCategory,
    pub title: String,
    pub maybe_thumbnail_token: Option<String>,
    pub description_markdown: String,
    pub description_rendered_html: String,
    pub creator_user_token: Option<&'a UserToken>,
    pub creator_ip_address: &'a str,
    pub creator_set_visibility: Visibility,
    pub maybe_last_update_user_token: Option<String>,
    pub original_download_url: Option<String>,
    pub original_filename: Option<String>,
    pub file_size_bytes: i32,
    pub file_checksum_sha2: String,
    pub private_bucket_hash: String,
    pub maybe_private_bucket_prefix: Option<String>,
    pub maybe_private_bucket_extension: Option<String>,
    pub cached_user_ratings_total_count: u32,
    pub cached_user_ratings_positive_count: u32,
    pub cached_user_ratings_negative_count: u32,
    pub maybe_cached_user_ratings_ratio: Option<f32>,
    pub version: i32,
    pub mysql_pool: &'a MySqlPool,
}

pub async fn create_weight(args: CreateModelWeightsArgs<'_>) -> AnyhowResult<ModelWeightToken> {
    let model_weights_token = ModelWeightToken::generate();

    let mut transaction = args.mysql_pool.begin().await?;

    if let Some(create_user_token) = args.creator_user_token.as_deref() {
        let next_model_weights_synthetic_id = transactional_increment_generic_synthetic_id(
            create_user_token,
            IdCategory::ModelWeights,
            &mut transaction
        ).await?;

        maybe_creator_synthetic_id = Some(next_model_weights_synthetic_id);
    }

    let query_result = sqlx::query!(
        r#"
        INSERT INTO model_weights
        SET
          token = ?,
          weights_type = ?,
          weights_category = ?,
          title = ?,
          maybe_thumbnail_token = ?,
          description_markdown = ?,
          description_rendered_html = ?,
          creator_user_token = ?,
          creator_ip_address = ?,
          creator_set_visibility = ?,
          maybe_last_update_user_token = ?,
          original_download_url = ?,
          original_filename = ?,
          file_size_bytes = ?,
          file_checksum_sha2 = ?,
          private_bucket_hash = ?,
          maybe_private_bucket_prefix = ?,
          maybe_private_bucket_extension = ?,
          cached_user_ratings_total_count = ?,
          cached_user_ratings_positive_count = ?,
          cached_user_ratings_negative_count = ?,
          maybe_cached_user_ratings_ratio = ?,
          version = ?
        "#,
        args.token.as_str(),
        args.weights_type.to_str(),
        args.weights_category.to_str(),
        args.title,
        args.maybe_thumbnail_token,
        args.description_markdown,
        args.description_rendered_html,
        args.creator_user_token,
        args.creator_ip_address,
        args.creator_set_visibility.to_str(),
        args.maybe_last_update_user_token,
        args.original_download_url,
        args.original_filename,
        args.file_size_bytes,
        args.file_checksum_sha2,
        args.private_bucket_hash,
        args.maybe_private_bucket_prefix,
        args.maybe_private_bucket_extension,
        args.cached_user_ratings_total_count,
        args.cached_user_ratings_positive_count,
        args.cached_user_ratings_negative_count,
        args.maybe_cached_user_ratings_ratio,
        args.version
    ).execute(args.mysql_pool).await;

    match query_result {
        Ok(_) => {
            Ok(model_weights_token);
        }
        Err(err) => {
            transaction.rollback().await?;
            warn!("Transaction failure: {:?}", err);
        }
    }
}

// CREATE TABLE model_weights (
//     id BIGINT(20) NOT NULL AUTO_INCREMENT,
//     token VARCHAR(32) NOT NULL,
//     weights_type VARCHAR(32) NOT NULL,
//     weights_category VARCHAR(32) NOT NULL,
//     title VARCHAR(255) NOT NULL,
//     maybe_thumbnail_token VARCHAR(32) DEFAULT NULL,
//     description_markdown TEXT NOT NULL,
//     description_rendered_html TEXT NOT NULL,
//     creator_user_token VARCHAR(32) NOT NULL,
//     creator_ip_address VARCHAR(40) NOT NULL,
//     creator_set_visibility ENUM(
//       'public',
//       'hidden',
//       'private'
//     ) NOT NULL DEFAULT 'public',
//     maybe_last_update_user_token VARCHAR(32) DEFAULT NULL,
//     original_download_url VARCHAR(512) DEFAULT NULL,
//     original_filename VARCHAR(255) DEFAULT NULL,
//     file_size_bytes INT(10) NOT NULL DEFAULT 0,
//     file_checksum_sha2 CHAR(64) NOT NULL,
//     private_bucket_hash  VARCHAR(32) NOT NULL,
//     maybe_private_bucket_prefix VARCHAR(16) DEFAULT NULL,
//     maybe_private_bucket_extension VARCHAR(16) DEFAULT NULL,
//     cached_user_ratings_total_count INT(10) UNSIGNED NOT NULL DEFAULT 0,
//     cached_user_ratings_positive_count INT(10) UNSIGNED NOT NULL DEFAULT 0,
//     cached_user_ratings_negative_count INT(10) UNSIGNED NOT NULL DEFAULT 0,
//     maybe_cached_user_ratings_ratio FLOAT,
//     cached_user_ratings_last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     version INT NOT NULL DEFAULT 0,
//     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     user_deleted_at TIMESTAMP NULL,
//     mod_deleted_at TIMESTAMP NULL,
//     PRIMARY KEY (id),
//     UNIQUE KEY (token)
//   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
