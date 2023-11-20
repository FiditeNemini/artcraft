use log::info;

use tokens::tokens::users::UserToken;
use sqlx::{ MySql, Pool };
use enums::by_table::model_weights::{
    weights_types::WeightsType,
    weights_category::WeightsCategory,
};
use errors::{ anyhow, AnyhowResult };
use mysql_queries::queries::users::user::get_user_token_by_username::get_user_token_by_username;

use crate::seeding::users::HANASHI_USERNAME;
use mysql_queries::queries::model_weights::create_weight::{ create_weight, CreateModelWeightsArgs };
use tokens::tokens::model_weights::ModelWeightToken;
use enums::common::visibility::Visibility;

pub async fn seed_weights(mysql_pool: &Pool<MySql>) -> AnyhowResult<()> {
    info!("Seeding weights...");

    let user_token = match get_user_token_by_username(HANASHI_USERNAME, mysql_pool).await? {
        None => {
            return Err(anyhow!("could not find user hanashi"));
        }
        Some(token) => token,
    };

    let model_weight_token1 = ModelWeightToken("1".to_string());
    let creator_token1 = UserToken("creatorToken!1".to_string());

    let model_weight_token2 = ModelWeightToken("2".to_string());
    let creator_token2 = UserToken("creatorToken2".to_string());

    let model_weight_token3 = ModelWeightToken("3".to_string());
    let creator_token3 = UserToken("creatorToken3".to_string());

    let model_weight_token4 = ModelWeightToken("4".to_string());
    let creator_token4 = UserToken("creatorToken4".to_string());

    let model_weights_args = vec![
        CreateModelWeightsArgs {
            token: &model_weight_token1, // replace with actual ModelWeightToken
            weights_type: WeightsType::RvcV2, // replace with actual WeightsType
            weights_category: WeightsCategory::VoiceConversion, // replace with actual WeightsCategory
            title: "Title 1".to_string(),
            maybe_thumbnail_token: Some("Thumbnail 1".to_string()),
            description_markdown: "Description 1".to_string(),
            description_rendered_html: "<p>Description 1</p>".to_string(),
            creator_user_token: Some(&creator_token1), // replace with actual UserToken
            creator_ip_address: "192.168.1.1",
            creator_set_visibility: Visibility::Public,
            maybe_last_update_user_token: Some("Last Update User Token 1".to_string()),
            original_download_url: Some("http://example.com/download1".to_string()),
            original_filename: Some("filename1.txt".to_string()),
            file_size_bytes: 1024,
            file_checksum_sha2: "checksum1".to_string(),
            private_bucket_hash: "bucket_hash1".to_string(),
            maybe_private_bucket_prefix: Some("_fake".to_string()),
            maybe_private_bucket_extension: Some("rvc".to_string()),
            cached_user_ratings_total_count: 10,
            cached_user_ratings_positive_count: 9,
            cached_user_ratings_negative_count: 1,
            maybe_cached_user_ratings_ratio: Some(0.9),
            version: 1,
            mysql_pool: &mysql_pool, // replace with actual MySqlPool
        },
        CreateModelWeightsArgs {
            token: &model_weight_token2, // replace with actual ModelWeightToken
            weights_type: WeightsType::HifiganTacotron2, // replace with actual WeightsType
            weights_category: WeightsCategory::TextToSpeech, // replace with actual WeightsCategory
            title: "Title 2".to_string(),
            maybe_thumbnail_token: Some("Thumbnail 2".to_string()),
            description_markdown: "Description 2".to_string(),
            description_rendered_html: "<p>Description 2</p>".to_string(),
            creator_user_token: Some(&creator_token2), // replace with actual UserToken
            creator_ip_address: "292.268.2.2",
            creator_set_visibility: Visibility::Public,
            maybe_last_update_user_token: Some("Last Update User Token 2".to_string()),
            original_download_url: Some("http://example.com/download2".to_string()),
            original_filename: Some("filename2.txt".to_string()),
            file_size_bytes: 2024,
            file_checksum_sha2: "checksum2".to_string(),
            private_bucket_hash: "bucket_hash2".to_string(),
            maybe_private_bucket_prefix: Some("_fake".to_string()),
            maybe_private_bucket_extension: Some("tt2".to_string()),
            cached_user_ratings_total_count: 20,
            cached_user_ratings_positive_count: 9,
            cached_user_ratings_negative_count: 2,
            maybe_cached_user_ratings_ratio: Some(0.9),
            version: 2,
            mysql_pool: &mysql_pool, // replace with actual MySqlPool
        },
        CreateModelWeightsArgs {
            token: &model_weight_token3, // replace with actual ModelWeightToken
            weights_type: WeightsType::StableDiffusion15, // replace with actual WeightsType
            weights_category: WeightsCategory::ImageGeneration, // replace with actual WeightsCategory
            title: "Title 3".to_string(),
            maybe_thumbnail_token: Some("Thumbnail 3".to_string()),
            description_markdown: "Description 3".to_string(),
            description_rendered_html: "<p>Description 3</p>".to_string(),
            creator_user_token: Some(&creator_token3), // replace with actual UserToken
            creator_ip_address: "392.368.3.3",
            creator_set_visibility: Visibility::Public,
            maybe_last_update_user_token: Some("Last Update User Token 3".to_string()),
            original_download_url: Some("http://example.com/download3".to_string()),
            original_filename: Some("filename3.txt".to_string()),
            file_size_bytes: 3024,
            file_checksum_sha2: "checksum3".to_string(),
            private_bucket_hash: "bucket_hash3".to_string(),
            maybe_private_bucket_prefix: Some("_fake".to_string()),
            maybe_private_bucket_extension: Some("safetensors".to_string()),
            cached_user_ratings_total_count: 10,
            cached_user_ratings_positive_count: 9,
            cached_user_ratings_negative_count: 1,
            maybe_cached_user_ratings_ratio: Some(0.9),
            version: 1,
            mysql_pool: &mysql_pool, // replace with actual MySqlPool
        },
        CreateModelWeightsArgs {
          token: &model_weight_token4, // replace with actual ModelWeightToken
          weights_type: WeightsType::LoRA, // replace with actual WeightsType
          weights_category: WeightsCategory::ImageGeneration, // replace with actual WeightsCategory
          title: "Title 4".to_string(),
          maybe_thumbnail_token: Some("Thumbnail 4".to_string()),
          description_markdown: "Description 4".to_string(),
          description_rendered_html: "<p>Description 4</p>".to_string(),
          creator_user_token: Some(&creator_token4), // replace with actual UserToken
          creator_ip_address: "192.168.1.1",
          creator_set_visibility: Visibility::Public,
          maybe_last_update_user_token: Some("Last Update User Token 4".to_string()),
          original_download_url: Some("http://example.com/download1".to_string()),
          original_filename: Some("filename1.txt".to_string()),
          file_size_bytes: 1024,
          file_checksum_sha2: "checksum4".to_string(),
          private_bucket_hash: "bucket_hash4".to_string(),
          maybe_private_bucket_prefix: Some("_fake".to_string()),
          maybe_private_bucket_extension: Some("LoRA".to_string()),
          cached_user_ratings_total_count: 10,
          cached_user_ratings_positive_count: 9,
          cached_user_ratings_negative_count: 1,
          maybe_cached_user_ratings_ratio: Some(0.9),
          version: 2,
          mysql_pool: &mysql_pool, // replace with actual MySqlPool
      }
    ];

    for model_weights_arg in model_weights_args {
        create_weight(model_weights_arg).await?;
    }
    Ok(())

}

