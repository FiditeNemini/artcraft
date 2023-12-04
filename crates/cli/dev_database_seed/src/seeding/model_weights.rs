use std::vec;

use buckets::public::media_files::original_file;
use log::info;

use tokens::tokens::users::UserToken;
use sqlx::{ MySql, Pool };
use enums::by_table::model_weights::{
    weights_types::{WeightsType, self},
    weights_category::{WeightsCategory, self},
};
use errors::{ anyhow, AnyhowResult };

use crate::seeding::users::HANASHI_USERNAME;
use mysql_queries::queries::model_weights::create_weight::{ create_weight, CreateModelWeightsArgs };
use tokens::tokens::model_weights::ModelWeightToken;
use enums::common::visibility::Visibility;

use mysql_queries::queries::users::user::get_user_token_by_username::get_user_token_by_username;

pub async fn seed_weights_for_paging(
    mysql_pool: &Pool<MySql>) -> AnyhowResult<()>
{

    let user_token = match get_user_token_by_username(HANASHI_USERNAME, mysql_pool).await? {
        None => {
            return Err(anyhow!("could not find user hanashi"));
        }
        Some(token) => token,
    };

    // create a loop that loops from 1 to 100
    for i in 1..=100 {
        // create a new weight
        let model_weight_token = ModelWeightToken(format!("item:{}", i));
        let title = format!("Title {}", i);
        let description = format!("Description {}", i);
        let description_rendered_html = format!("<p>{}</p>", description);
        let original_filename = format!("filename{}.txt", i);
        let original_download_url = format!("http://example.com/download{}", i);
        let thumbnail_token = format!("Thumbnail {}", i);
        let private_bucket_hash = format!("bucket_hash{}", i);
        let private_bucket_prefix = format!("_fake{}", i);
        let private_bucket_extension = format!("rvc{}", i);
        let cached_user_ratings_total_count = i;
        let cached_user_ratings_positive_count = i;
        let cached_user_ratings_negative_count = i;
        let cached_user_ratings_ratio = i as u32 / 100;
        let version = i as i32;

        let weights_category = match i {
            1..=20 => WeightsCategory::VoiceConversion,
            21..=40 => WeightsCategory::TextToSpeech,
            41..=60 => WeightsCategory::ImageGeneration,
            61..=80 => WeightsCategory::ImageGeneration,
            81..=100 => WeightsCategory::ImageGeneration,
            _ => WeightsCategory::ImageGeneration
        };

        let weights_types = match i {
            1..=20 => WeightsType::RvcV2,
            21..=40 => WeightsType::HifiganTacotron2,
            41..=60 => WeightsType::StableDiffusion15,
            61..=80 => WeightsType::StableDiffusionXL,
            81..=100 => WeightsType::LoRA,
            _ => WeightsType::LoRA
        };

        let args = CreateModelWeightsArgs {
            token: &model_weight_token, // replace with actual ModelWeightToken
            weights_type: weights_types, // replace with actual WeightsType
            weights_category: weights_category, // replace with actual WeightsCategory
            title: title,
            maybe_thumbnail_token: Some(thumbnail_token),
            description_markdown: description,
            description_rendered_html: description_rendered_html,
            creator_user_token: Some(&user_token), // replace with actual UserToken
            creator_ip_address: "192.168.1.1",
            creator_set_visibility: Visibility::Public,
            maybe_last_update_user_token: Some(user_token.to_string()),
            original_download_url: Some(original_download_url),
            original_filename: Some(original_filename),
            file_size_bytes: 1024,
            file_checksum_sha2: "checksum1".to_string(),
            private_bucket_hash: "bucket_hash1".to_string(),
            maybe_private_bucket_prefix: Some("_fake".to_string()),
            maybe_private_bucket_extension: Some("rvc".to_string()),
            cached_user_ratings_total_count: cached_user_ratings_total_count,
            cached_user_ratings_positive_count: cached_user_ratings_positive_count,
            cached_user_ratings_negative_count: cached_user_ratings_ratio,
            maybe_cached_user_ratings_ratio: Some(0.9),
            version: version,
            mysql_pool: &mysql_pool, // replace with actual MySqlPool
        };

        create_weight(args).await?;
        }
    Ok(())

}
pub async fn seed_weights_for_user_token(
    mysql_pool: &Pool<MySql>,
    user_token: UserToken
) -> AnyhowResult<()> {
    info!("Seeding weights...");

    let model_weight_token1 = ModelWeightToken("11".to_string());
    let model_weight_token2 = ModelWeightToken("22".to_string());
    let model_weight_token3 = ModelWeightToken("33".to_string());
    let model_weight_token4 = ModelWeightToken("44".to_string());
    let model_weight_token5 = ModelWeightToken("55".to_string());

    let model_weights_args = vec![
        CreateModelWeightsArgs {
            token: &model_weight_token1, // replace with actual ModelWeightToken
            weights_type: WeightsType::RvcV2, // replace with actual WeightsType
            weights_category: WeightsCategory::VoiceConversion, // replace with actual WeightsCategory
            title: "Title 1".to_string(),
            maybe_thumbnail_token: Some("Thumbnail 1".to_string()),
            description_markdown: "Description 1".to_string(),
            description_rendered_html: "<p>Description 1</p>".to_string(),
            creator_user_token: Some(&user_token), // replace with actual UserToken
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
            creator_user_token: Some(&user_token), // replace with actual UserToken
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
            creator_user_token: Some(&user_token), // replace with actual UserToken
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
            creator_user_token: Some(&user_token), // replace with actual UserToken
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
        },
        CreateModelWeightsArgs {
            token: &model_weight_token5, // replace with actual ModelWeightToken
            weights_type: WeightsType::LoRA, // replace with actual WeightsType
            weights_category: WeightsCategory::ImageGeneration, // replace with actual WeightsCategory
            title: "Title 5".to_string(),
            maybe_thumbnail_token: Some("Thumbnail 4".to_string()),
            description_markdown: "Description 4".to_string(),
            description_rendered_html: "<p>Description 4</p>".to_string(),
            creator_user_token: Some(&user_token), // replace with actual UserToken
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
pub async fn seed_weights(mysql_pool: &Pool<MySql>) -> AnyhowResult<()> {
    info!("Seeding weights...");

    let user_token = match get_user_token_by_username(HANASHI_USERNAME, mysql_pool).await? {
        None => {
            return Err(anyhow!("could not find user hanashi"));
        }
        Some(token) => token,
    };

    let model_weight_token1 = ModelWeightToken("1".to_string());
    let creator_token1 = UserToken("creatorToken1".to_string());

    let model_weight_token2 = ModelWeightToken("2".to_string());
    let creator_token2 = UserToken("creatorToken2".to_string());

    let model_weight_token3 = ModelWeightToken("3".to_string());
    let creator_token3 = UserToken("creatorToken3".to_string());

    let model_weight_token4 = ModelWeightToken("4".to_string());
    let creator_token4 = UserToken("creatorToken4".to_string());

    let model_weight_token5 = ModelWeightToken("5".to_string());
    let creator_token5 = UserToken("creatorToken5".to_string());

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
        },
        CreateModelWeightsArgs {
            token: &model_weight_token5, // replace with actual ModelWeightToken
            weights_type: WeightsType::LoRA, // replace with actual WeightsType
            weights_category: WeightsCategory::ImageGeneration, // replace with actual WeightsCategory
            title: "Title 5".to_string(),
            maybe_thumbnail_token: Some("Thumbnail 5".to_string()),
            description_markdown: "Description 5".to_string(),
            description_rendered_html: "<p>Description 5</p>".to_string(),
            creator_user_token: Some(&creator_token5), // replace with actual UserToken
            creator_ip_address: "192.168.1.1",
            creator_set_visibility: Visibility::Public,
            maybe_last_update_user_token: Some("Last Update User Token 5".to_string()),
            original_download_url: Some("http://example.com/download1".to_string()),
            original_filename: Some("filename1.txt".to_string()),
            file_size_bytes: 1025,
            file_checksum_sha2: "checksum5".to_string(),
            private_bucket_hash: "bucket_hash5".to_string(),
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

    // adds this to HANASHI
    get_user_token_by_username(HANASHI_USERNAME, mysql_pool).await?;
    seed_weights_for_user_token(mysql_pool, user_token).await?;
    seed_weights_for_paging(mysql_pool).await?;
    Ok(())
}
