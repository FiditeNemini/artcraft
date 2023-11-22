use anyhow::anyhow;
use sqlx::MySqlPool;

use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use tokens::tokens::model_weights::ModelWeightToken;

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
