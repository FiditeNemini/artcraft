use sqlx::MySqlPool;
use enums::by_table::{generic_synthetic_ids::id_category::IdCategory, model_weights::{weights_types::WeightsType, weights_category::WeightsCategory}};
use enums::common::visibility::Visibility;
use tokens::tokens::users::UserToken;

pub struct CreateModelWeightsArgs<'a> {
    pub token: &'a str,
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