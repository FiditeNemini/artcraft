use anyhow::anyhow;
use chrono::{DateTime, Utc};
use crate::AnyhowResult;
use crate::database::helpers::boolean_converters::i8_to_bool;
use derive_more::{Display, Error};
use log::{info, warn, log};
use md5::{Md5, Digest};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;

// TODO: This duplicates the get_profile_handler.

#[derive(Serialize)]
pub struct UserProfileResult {
  pub user_token: String,
  pub username: String,
  pub display_name: String,
  pub email_gravatar_hash: String,
  pub profile_markdown: String,
  pub profile_rendered_html: String,
  pub user_role_slug: String,
  pub is_banned: bool,
  pub disable_gravatar: bool,
  pub discord_username: Option<String>,
  pub twitch_username: Option<String>,
  pub twitter_username: Option<String>,
  pub patreon_username: Option<String>,
  pub github_username: Option<String>,
  pub created_at: DateTime<Utc>,
}

#[derive(Serialize)]
struct RawUserProfileRecord {
  pub user_token: String,
  pub username: String,
  pub email_gravatar_hash: String,
  pub display_name: String,
  pub profile_markdown: String,
  pub profile_rendered_html: String,
  pub user_role_slug: String,
  pub is_banned: i8,
  pub disable_gravatar: i8,
  pub discord_username: Option<String>,
  pub twitch_username: Option<String>,
  pub twitter_username: Option<String>,
  pub patreon_username: Option<String>,
  pub github_username: Option<String>,
  pub created_at: DateTime<Utc>,
}

pub async fn get_user_profile_by_username(
  username: &str,
  mysql_pool: &MySqlPool
) -> AnyhowResult<Option<UserProfileResult>> {
  let maybe_profile_record = sqlx::query_as!(
      RawUserProfileRecord,
        r#"
SELECT
    users.token as user_token,
    username,
    display_name,
    email_gravatar_hash,
    profile_markdown,
    profile_rendered_html,
    user_role_slug,
    is_banned,
    disable_gravatar,
    discord_username,
    twitch_username,
    twitter_username,
    patreon_username,
    github_username,
    created_at
FROM users
WHERE
    users.username = ?
    AND users.user_deleted_at IS NULL
    AND users.mod_deleted_at IS NULL
        "#,
        username,
    )
      .fetch_one(mysql_pool)
      .await;

  let profile_record : RawUserProfileRecord = match maybe_profile_record {
    Ok(profile_record) => profile_record,
    Err(err) => {
      return match err {
        RowNotFound => {
          Ok(None)
        },
        _ => {
          warn!("User profile query error: {:?}", err);
          Err(anyhow!("query error"))
        }
      }
    }
  };

  let profile_for_response = UserProfileResult {
    user_token: profile_record.user_token.clone(),
    username: profile_record.username.clone(),
    display_name: profile_record.display_name.clone(),
    email_gravatar_hash: profile_record.email_gravatar_hash.clone(),
    profile_markdown: profile_record.profile_markdown.clone(),
    profile_rendered_html: profile_record.profile_rendered_html.clone(),
    user_role_slug: profile_record.user_role_slug.clone(),
    is_banned: i8_to_bool(profile_record.is_banned),
    disable_gravatar: i8_to_bool(profile_record.disable_gravatar),
    discord_username: profile_record.discord_username.clone(),
    twitch_username: profile_record.twitch_username.clone(),
    twitter_username: profile_record.twitter_username.clone(),
    patreon_username: profile_record.patreon_username.clone(),
    github_username: profile_record.github_username.clone(),
    created_at: profile_record.created_at.clone(),
  };

  Ok(Some(profile_for_response))
}
