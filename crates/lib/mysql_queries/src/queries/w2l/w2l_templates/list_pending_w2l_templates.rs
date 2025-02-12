use anyhow::anyhow;
use chrono::{DateTime, Utc};
use sqlx::MySqlPool;

use errors::AnyhowResult;

pub struct PendingW2lTemplateRow {
  pub template_token: String,
  pub title: String,
  pub template_type: String,
  pub duration_millis: i32,
  pub frame_width: i32,
  pub frame_height: i32,
  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub creator_gravatar_hash: String,
  pub created_at: DateTime<Utc>,
}

pub async fn list_pending_w2l_templates(
  mysql_pool: &MySqlPool
) -> AnyhowResult<Vec<PendingW2lTemplateRow>> {

  // NB: Lookup failure is Err(RowNotFound).
  let maybe_results = sqlx::query_as!(
      PendingW2lTemplatesRaw,
        r#"
SELECT
  w2l_templates.token as template_token,
  w2l_templates.title,
  w2l_templates.template_type,
  w2l_templates.duration_millis,
  w2l_templates.frame_width,
  w2l_templates.frame_height,
  w2l_templates.creator_user_token,
  users.username AS creator_username,
  users.display_name AS creator_display_name,
  users.email_gravatar_hash AS creator_gravatar_hash,
  w2l_templates.created_at
FROM
  w2l_templates
JOIN
  users
ON
  users.token = w2l_templates.creator_user_token
WHERE
  w2l_templates.is_public_listing_approved IS NULL
  AND w2l_templates.user_deleted_at IS NULL
  AND w2l_templates.mod_deleted_at IS NULL
  AND w2l_templates.is_locked_from_use IS FALSE
        "#,
    )
      .fetch_all(mysql_pool)
      .await;

  let results : Vec<PendingW2lTemplatesRaw> = match maybe_results {
    Ok(results) => results,
    Err(err) => {
      match err {
        sqlx::Error::RowNotFound => {
          Vec::new()
        },
        _ => {
          return Err(anyhow!("database err listing pending w2l templates: {:?}", err));
        }
      }
    }
  };

  let results = results.into_iter().map(|r| {
    PendingW2lTemplateRow {
      template_token: r.template_token,
      title: r.title,
      template_type: r.template_type,
      duration_millis: r.duration_millis,
      frame_width: r.frame_width,
      frame_height: r.frame_height,
      creator_user_token: r.creator_user_token,
      creator_username: r.creator_username,
      creator_display_name: r.creator_display_name,
      creator_gravatar_hash: r.creator_gravatar_hash,
      created_at: r.created_at,
    }
  }).collect::<Vec<PendingW2lTemplateRow>>();

  Ok(results)
}

#[derive(Serialize)]
pub (crate) struct PendingW2lTemplatesRaw {
  pub template_token: String,
  pub title: String,
  pub template_type: String,
  pub duration_millis: i32,
  pub frame_width: i32,
  pub frame_height: i32,
  pub creator_user_token: String,
  pub creator_username: String,
  pub creator_display_name: String,
  pub creator_gravatar_hash: String,
  pub created_at: DateTime<Utc>,
}
