use anyhow::anyhow;
use sqlx::MySqlPool;

use log::info;
use sqlx::mysql::MySqlPoolOptions;

use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use tokens::tokens::model_weights::ModelWeightToken;

use config::shared_constants::{DEFAULT_MYSQL_CONNECTION_STRING, DEFAULT_RUST_LOG};

pub struct UpdateWeightArgs<'a> {
    pub weight_token: &ModelWeightToken,
    pub title: Option<&'a str>,
    pub description_markdown: &'a str,
    pub description_rendered_html: &'a str,
    pub creator_set_visibility: &'a Visibility,
    pub mysql_pool: &'a MySqlPool,
}

pub async fn update_weights(args: UpdateWeightArgs<'_>) -> AnyhowResult<()> {
    let mut transaction = args.mysql_pool.begin().await?;

    let query_result = sqlx
        ::query(
            r#"
        UPDATE model_weights
        SET
            title = ?,
            description_markdown = ?,
            description_rendered_html = ?,
            creator_set_visibility = ?,
            version = version + 1
        WHERE token = ?
        LIMIT 1
        "#,
            args.title,
            description_markdown,
            description_rendered_html,
            args.creator_set_visibility.to_str(),
            args.weight_token.as_str()
        )
        .execute(args.mysql_pool).await;

    transaction.commit().await?;

    match query_result {
        Ok(_) => Ok(()),
        Err(err) => { 
            transaction.rollback().await?;
            Err(anyhow!("weights update error: {:?}", err)) 
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::MySqlPoolOptions;
    use easyenv;
    use tokio;

    #[tokio::test]
    async fn test_update_weights() -> AnyhowResult<()> {
        let db_connection_string = easyenv::get_env_string_or_default(
            "MYSQL_URL",
            DEFAULT_MYSQL_CONNECTION_STRING
        );

        let pool = MySqlPoolOptions::new()
            .max_connections(easyenv::get_env_num("MYSQL_MAX_CONNECTIONS", 3)?)
            .connect(&db_connection_string)
            .await?;

        let args = UpdateWeightArgs {
            weight_token: &ModelWeightToken::new("test_token"),
            title: Some("Test Title"),
            description_markdown: "Test Description Markdown",
            description_rendered_html: "Test Description HTML",
            creator_set_visibility: &Visibility::Public,
            mysql_pool: &pool,
        };

        let result = update_weights(args).await;

        assert!(result.is_ok());

        Ok(())
    }
}