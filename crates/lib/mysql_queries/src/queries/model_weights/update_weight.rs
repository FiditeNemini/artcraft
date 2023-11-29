use anyhow::anyhow;
use sqlx::MySqlPool;

use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use tokens::tokens::model_weights::ModelWeightToken;

pub struct UpdateWeightArgs<'a> {
    pub weight_token: &'a ModelWeightToken,
    pub title: Option<&'a str>,
    pub maybe_thumbnail_token: Option<&'a str>,
    pub description_markdown: Option<&'a str>,
    pub description_rendered_html: Option<&'a str>,
    pub creator_set_visibility: Option<&'a Visibility>,
    pub mysql_pool: &'a MySqlPool,
}

pub async fn update_weights(args: UpdateWeightArgs<'_>) -> AnyhowResult<()> {
    let mut transaction = args.mysql_pool.begin().await?;

    let query_result = sqlx::query!(
        r#"
    UPDATE model_weights
    SET
        title = COALESCE(?, title),
        description_markdown = COALESCE(?, description_markdown),
        maybe_thumbnail_token = COALESCE(?, maybe_thumbnail_token),
        description_rendered_html = COALESCE(?, description_rendered_html),
        creator_set_visibility = COALESCE(?, creator_set_visibility),
        version = version + 1
    WHERE token = ?
    LIMIT 1
    "#,
        args.title.as_deref().unwrap_or(Some("")),
        args.description_markdown.as_deref().unwrap_or(Some("")),
        args.maybe_thumbnail_token.as_deref().unwrap_or(Some("")),
        args.description_rendered_html.as_deref().unwrap_or(Some("")),
        args.creator_set_visibility.as_deref().unwrap_or(Some("")),
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

}