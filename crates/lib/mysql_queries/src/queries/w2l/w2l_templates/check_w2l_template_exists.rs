use anyhow::anyhow;
use sqlx::MySqlPool;

use errors::AnyhowResult;

/// Just to query for existence
pub (crate) struct W2lTemplateExistenceRecord {
  pub template_token: String,
}

pub async fn check_w2l_template_exists(template_token: &str, mysql_pool: &MySqlPool) -> AnyhowResult<bool>
{
  let maybe_template = sqlx::query_as!(
      W2lTemplateExistenceRecord,
        r#"
SELECT
    token as template_token
FROM w2l_templates
WHERE
    token = ?
    AND user_deleted_at IS NULL
    AND mod_deleted_at IS NULL
        "#,
      &template_token
    )
      .fetch_one(mysql_pool)
      .await;

  let record_exists = match maybe_template {
    Ok(_record) => {
      true
    },
    Err(err) => {
      match err {
        sqlx::Error::RowNotFound => {
          false
        },
        _ => {
          return Err(anyhow!("query w2l template existence query error: {:?}", err));
        }
      }
    }
  };

  Ok(record_exists)
}
