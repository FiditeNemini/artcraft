use std::os::linux::raw;

use anyhow::anyhow;
use chrono::{ DateTime, Utc };
use enums::by_table::model_weights::weights_types;
use log::{ info, warn };
use sqlx::{ MySql, MySqlPool, query, Acquire, MySqlConnection };
use sqlx::pool::PoolConnection;

use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use tokens::tokens::model_weights::ModelWeightToken;

use enums::by_table::model_weights::{
    weights_types::WeightsType,
    weights_category::WeightsCategory,
};
use tokens::tokens::users::UserToken;

#[derive(Serialize)]
pub struct WeightsJoinUserRecord {
    pub token: ModelWeightToken,

    pub weights_type: WeightsType,
    pub weights_category: WeightsCategory,
    
    pub title: String,
    
    pub maybe_thumbnail_token: Option<String>,
    
    pub description_markdown: String,
    pub description_rendered_html: String,
    
    pub creator_user_token: UserToken,
    pub creator_ip_address: String,
    pub creator_set_visibility: Visibility,
    
    pub maybe_last_update_user_token: Option<UserToken>,
    
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
    pub cached_user_ratings_last_updated_at: DateTime<Utc>,
    
    pub version: i32,
    
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    
    pub user_deleted_at: Option<DateTime<Utc>>,
    pub mod_deleted_at: Option<DateTime<Utc>>,
    
    pub creator_username: String,
    pub creator_display_name: String,
    pub creator_email_gravatar_hash: String,
}

pub async fn list_weights_by_creator_username(
    mysql_pool:  &mut PoolConnection<MySql>,
    creator_username: &str,
    can_see_deleted: bool
) -> AnyhowResult<Vec<WeightsJoinUserRecord>> {
    let mut connection = mysql_pool.acquire().await?;

    let raw_weights: Vec<RawWeightJoinUser> = get_raw_weights_by_creator_username(&mut connection, creator_username, can_see_deleted).await?;
    let weights_records: Vec<WeightsJoinUserRecord> = map_to_weights(raw_weights).await;

    let filtered_weights: Vec<WeightsJoinUserRecord> = weights_records.into_iter().filter(|weight| {
        weight.creator_username == creator_username && weight.creator_set_visibility == Visibility::Public && can_see_deleted
    }).collect();

    Ok(filtered_weights)
}

pub async fn get_raw_weights_by_creator_username(
    connection:  &mut MySqlConnection,
    creator_username: &str,
    can_see_deleted: bool
) -> AnyhowResult<Vec<RawWeightJoinUser>> {

    let connection = connection.acquire().await?;
    
    if can_see_deleted {
        let raw_weights: Vec<RawWeightJoinUser> = sqlx::query_as!(
            RawWeightJoinUser,
            r#"
            SELECT              
                mw.token as `token: tokens::tokens::model_weights::ModelWeightToken`,
                mw.title,
                mw.weights_type as `weights_type: enums::by_table::model_weights::weights_types::WeightsType`,
                mw.weights_category as `weights_category: enums::by_table::model_weights::weights_category::WeightsCategory`,
                mw.maybe_thumbnail_token,
                mw.description_markdown,
                mw.description_rendered_html,
                users.token as `creator_user_token: tokens::tokens::users::UserToken`,
                users.username as creator_username,
                users.display_name as creator_display_name,
                users.email_gravatar_hash as creator_email_gravatar_hash,
                mw.creator_ip_address,
                mw.creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`,
                mw.maybe_last_update_user_token as `maybe_last_update_user_token: tokens::tokens::users::UserToken`,
                mw.original_download_url,
                mw.original_filename,
                mw.file_size_bytes,
                mw.file_checksum_sha2,
                mw.private_bucket_hash,
                mw.maybe_private_bucket_prefix,
                mw.maybe_private_bucket_extension,
                mw.cached_user_ratings_negative_count,
                mw.cached_user_ratings_positive_count,
                mw.cached_user_ratings_total_count,
                mw.maybe_cached_user_ratings_ratio,
                mw.cached_user_ratings_last_updated_at,
                mw.version,
                mw.created_at,
                mw.updated_at,
                mw.user_deleted_at,
                mw.mod_deleted_at
            FROM model_weights as mw
            JOIN users
                ON users.token = mw.creator_user_token
            WHERE
                users.username = ?
            "#,
            creator_username).fetch_all(connection)
        .await?;
        return Ok(raw_weights);
    } else {
        let raw_weights: Vec<RawWeightJoinUser> = sqlx::query_as!(
            RawWeightJoinUser,
            r#"
            SELECT
                mw.token as `token: tokens::tokens::model_weights::ModelWeightToken`,
                mw.title,
                mw.weights_type as `weights_type: enums::by_table::model_weights::weights_types::WeightsType`,
                mw.weights_category as `weights_category: enums::by_table::model_weights::weights_category::WeightsCategory`,
                mw.maybe_thumbnail_token,
                mw.description_markdown,
                mw.description_rendered_html,
                users.token as `creator_user_token: tokens::tokens::users::UserToken`,
                users.username as creator_username,
                users.display_name as creator_display_name,
                users.email_gravatar_hash as creator_email_gravatar_hash,
                mw.creator_ip_address,
                mw.creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`,
                mw.maybe_last_update_user_token as `maybe_last_update_user_token: tokens::tokens::users::UserToken`,
                mw.original_download_url,
                mw.original_filename,
                mw.file_size_bytes,
                mw.file_checksum_sha2,
                mw.private_bucket_hash,
                mw.maybe_private_bucket_prefix,
                mw.maybe_private_bucket_extension,
                mw.cached_user_ratings_negative_count,
                mw.cached_user_ratings_positive_count,
                mw.cached_user_ratings_total_count,
                mw.maybe_cached_user_ratings_ratio,
                mw.cached_user_ratings_last_updated_at,
                mw.version,
                mw.created_at,
                mw.updated_at,
                mw.user_deleted_at,
                mw.mod_deleted_at
            FROM model_weights as mw
            JOIN users
                ON users.token = mw.creator_user_token
            WHERE
                users.username = ?
                AND mw.user_deleted_at IS NULL
                AND mw.mod_deleted_at IS NULL
            "#,
            creator_username).fetch_all(connection).await?;

        Ok(raw_weights)
    }
}

pub async fn map_to_weights(dataset:Vec<RawWeightJoinUser>) -> Vec<WeightsJoinUserRecord> {
    let weights: Vec<WeightsJoinUserRecord> = dataset
        .into_iter()
        .map(|dataset: RawWeightJoinUser| {
            WeightsJoinUserRecord {
                token: dataset.token,
                title: dataset.title,
                weights_type: dataset.weights_type,
                weights_category: dataset.weights_category,
                maybe_thumbnail_token: dataset.maybe_thumbnail_token,
                description_markdown: dataset.description_markdown,
                description_rendered_html: dataset.description_rendered_html,

                creator_user_token: dataset.creator_user_token,
                creator_ip_address: dataset.creator_ip_address,
                creator_set_visibility: dataset.creator_set_visibility,

                maybe_last_update_user_token: dataset.maybe_last_update_user_token,
                original_download_url: dataset.original_download_url,
                original_filename: dataset.original_filename,
                file_size_bytes: dataset.file_size_bytes,
                file_checksum_sha2: dataset.file_checksum_sha2,
                private_bucket_hash: dataset.private_bucket_hash,
                maybe_private_bucket_prefix: dataset.maybe_private_bucket_prefix,
                maybe_private_bucket_extension: dataset.maybe_private_bucket_extension,

                cached_user_ratings_negative_count: dataset.cached_user_ratings_negative_count,
                cached_user_ratings_positive_count: dataset.cached_user_ratings_positive_count,
                cached_user_ratings_total_count: dataset.cached_user_ratings_total_count,

                maybe_cached_user_ratings_ratio: dataset.maybe_cached_user_ratings_ratio,
                cached_user_ratings_last_updated_at: dataset.cached_user_ratings_last_updated_at,
                version: dataset.version,
                created_at: dataset.created_at,
                updated_at: dataset.updated_at,
                user_deleted_at: dataset.user_deleted_at,
                mod_deleted_at: dataset.mod_deleted_at,

                creator_username:dataset.creator_username,
                creator_display_name:dataset.creator_display_name,
                creator_email_gravatar_hash:dataset.creator_email_gravatar_hash
            }
        }).collect();

        weights
}


  #[derive(Serialize)]
  pub struct RawWeightJoinUser {
    pub token: ModelWeightToken,

    pub weights_type: WeightsType,
    pub weights_category: WeightsCategory,
    
    pub title: String,
    
    pub maybe_thumbnail_token: Option<String>,
    
    pub description_markdown: String,
    pub description_rendered_html: String,
    
    pub creator_user_token: UserToken,
    pub creator_ip_address: String,
    pub creator_set_visibility: Visibility,
    
    pub maybe_last_update_user_token: Option<UserToken>,
    
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
    pub cached_user_ratings_last_updated_at: DateTime<Utc>,
    
    pub version: i32,
    
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    
    pub user_deleted_at: Option<DateTime<Utc>>,
    pub mod_deleted_at: Option<DateTime<Utc>>,
    
    pub creator_username: String,
    pub creator_display_name: String,
    pub creator_email_gravatar_hash: String,
}
