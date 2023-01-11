// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use sqlx::MySqlPool;
use sqlx;
use sqlx::mysql::MySqlQueryResult;

pub async fn edit_tts_model_moderator_details(
  mysql_pool: &MySqlPool,
  tts_model_token: &str,
  is_public_listing_approved: bool,
  is_locked_from_user_modification: bool,
  is_locked_from_use: bool,
  maybe_suggested_unique_bot_command: Option<&str>,
  is_front_page_featured: bool,
  is_twitch_featured: bool,
  moderator_user_token: &str,
  maybe_mod_comments: Option<&str>,
) -> Result<MySqlQueryResult, sqlx::Error> {
  sqlx::query!(
        r#"
UPDATE tts_models
SET
    is_public_listing_approved = ?,
    is_locked_from_user_modification = ?,
    is_locked_from_use = ?,
    maybe_mod_comments = ?,
    maybe_mod_user_token = ?,
    is_front_page_featured = ?,
    is_twitch_featured = ?,
    maybe_suggested_unique_bot_command = ?,
    version = version + 1
WHERE token = ?
LIMIT 1
        "#,
      is_public_listing_approved,
      is_locked_from_user_modification,
      is_locked_from_use,
      maybe_mod_comments,
      moderator_user_token,
      is_front_page_featured,
      is_twitch_featured,
      maybe_suggested_unique_bot_command,
      tts_model_token
    )
      .execute(mysql_pool)
      .await
}
