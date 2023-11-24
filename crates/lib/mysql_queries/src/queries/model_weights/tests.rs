#[cfg(test)]
mod tests {
    use sqlx::MySqlPool;
    use rand::Rng;

    use tokio;
    use log::{ error };

    use container_common::anyhow_result::AnyhowResult;
    use sqlx::mysql::MySqlPoolOptions;
    use config::shared_constants::{ DEFAULT_MYSQL_CONNECTION_STRING };
    // common tests
    use enums::by_table::model_weights::{
        weights_types::WeightsType,
        weights_category::WeightsCategory,
    };
    use enums::common::visibility::Visibility;
    use tokens::tokens::{ users::UserToken, model_weights::ModelWeightToken };

    use crate::queries::model_weights::create_weight::CreateModelWeightsArgs;
    use crate::queries::model_weights::create_weight::create_weight;
    use crate::queries::model_weights::get_weight::get_weight_by_token;


    async fn setup() -> sqlx::Pool<sqlx::MySql> {
        println!("Dropped database model_weights");

        let db_connection_string = DEFAULT_MYSQL_CONNECTION_STRING;
        let pool = MySqlPoolOptions::new()
            .max_connections(3)
            .connect(&db_connection_string).await
            .unwrap();

        // delete everything that exists in the database
        delete_all_weights_for_table(&pool).await.unwrap();
        pool
    }

    pub async fn delete_all_weights_for_table(
        mysql_pool: &MySqlPool
    ) -> AnyhowResult<()> {
        // write a query that deletes all weights
        let _r = sqlx
            ::query!(
                r#"
    UPDATE model_weights
    SET
      user_deleted_at = CURRENT_TIMESTAMP
    WHERE
      user_deleted_at IS NULL
            "#,
            )
            .execute(mysql_pool).await?;
        Ok(())
    }

    #[tokio::test]
    async fn test_create_weights() -> AnyhowResult<()> {
        let db_connection_string = DEFAULT_MYSQL_CONNECTION_STRING;

        let mut rng = rand::thread_rng();
        let random_number: u32 = rng.gen();
        let model_weight_token1 = ModelWeightToken(random_number.to_string());

        let pool = setup().await;
        // create a random token for the model weight 

        let creator_token1 = UserToken("creatorToken!1".to_string());

        let args = CreateModelWeightsArgs {
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
            mysql_pool: &pool, // replace with actual MySqlPool
        };

        create_weight(args).await?;

        let result = get_weight_by_token(&model_weight_token1, false, &pool).await?;
        
        let result = result.unwrap();

        // check if the result is the same as the args
        assert_eq!(result.token, model_weight_token1);
        assert_eq!(result.title, "Title 1".to_string());
        assert_eq!(result.weights_type, WeightsType::RvcV2);
        assert_eq!(result.weights_category, WeightsCategory::VoiceConversion);
        assert_eq!(result.maybe_thumbnail_token, Some("Thumbnail 1".to_string()));
        assert_eq!(result.description_markdown, "Description 1".to_string());
        assert_eq!(result.description_rendered_html, "<p>Description 1</p>".to_string());
        assert_eq!(result.creator_user_token, creator_token1);
        assert_eq!(result.creator_ip_address, "192.168.1.1".to_string());
        assert_eq!(result.creator_set_visibility, Visibility::Public);
        assert_eq!(result.maybe_last_update_user_token,  Some(UserToken("Last Update User Token 1".to_string())));
        assert_eq!(result.original_download_url, Some("http://example.com/download1".to_string()));
        assert_eq!(result.original_filename, Some("filename1.txt".to_string()));
        assert_eq!(result.file_size_bytes, 1024);
        assert_eq!(result.file_checksum_sha2, "checksum1".to_string());
        assert_eq!(result.private_bucket_hash, "bucket_hash1".to_string());
        assert_eq!(result.maybe_private_bucket_prefix, Some("_fake".to_string()));
        assert_eq!(result.maybe_private_bucket_extension, Some("rvc".to_string()));
        assert_eq!(result.cached_user_ratings_total_count, 10);
        assert_eq!(result.cached_user_ratings_positive_count, 9);
        assert_eq!(result.cached_user_ratings_negative_count, 1);
        assert_eq!(result.maybe_cached_user_ratings_ratio, Some(0.9));
        assert_eq!(result.version, 1);

        Ok(())
    }

}
