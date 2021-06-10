use anyhow::anyhow;
use crate::AnyhowResult;
use derive_more::{Display, Error};
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;
use chrono::{DateTime, Utc};
use md5::{Md5, Digest};

// TODO: This duplicates the get_profile_handler.

#[derive(Serialize)]
pub struct RawUserProfileRecord {
  pub user_token: String,
  pub username: String,
  pub email_gravatar_hash: String,
  pub display_name: String,
  pub profile_markdown: String,
  pub profile_rendered_html: String,
  pub user_role_slug: String,
  pub banned: i8,
  pub avatar_public_bucket_hash: Option<String>,
  pub disable_gravatar: i8,
  pub maybe_preferred_tts_model_token: Option<String>,
  pub maybe_preferred_w2l_template_token: Option<String>,
  pub discord_username: Option<String>,
  pub twitch_username: Option<String>,
  pub twitter_username: Option<String>,
  pub patreon_username: Option<String>,
  pub github_username: Option<String>,
  pub created_at: DateTime<Utc>,
}

/// This changes the record:
///  - changes banned to bool
///  - changes hide_results_preference to bool
///  - changes disable_gravatar to bool
#[derive(Serialize)]
pub struct UserProfileRecordForResponse {
  pub user_token: String,
  pub username: String,
  pub display_name: String,
  pub email_gravatar_hash: String,
  pub profile_markdown: String,
  pub profile_rendered_html: String,
  pub user_role_slug: String,
  pub banned: bool,
  pub avatar_public_bucket_hash: Option<String>,
  pub disable_gravatar: bool,
  pub maybe_preferred_tts_model_token: Option<String>,
  pub maybe_preferred_w2l_template_token: Option<String>,
  pub discord_username: Option<String>,
  pub twitch_username: Option<String>,
  pub twitter_username: Option<String>,
  pub patreon_username: Option<String>,
  pub github_username: Option<String>,
  pub created_at: DateTime<Utc>,
}

pub async fn select_user_profile_by_username(
  username: &str,
  mysql_pool: &MySqlPool
) -> AnyhowResult<UserProfileRecordForResponse> {
  // NB: Lookup failure is Err(RowNotFound).
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
    banned,
    avatar_public_bucket_hash,
    disable_gravatar,
    maybe_preferred_tts_model_token,
    maybe_preferred_w2l_template_token,
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
      .await; // TODO: This will return error if it doesn't exist

  let profile_record : RawUserProfileRecord = match maybe_profile_record {
    Ok(profile_record) => profile_record,
    Err(err) => {
      match err {
        RowNotFound => {
          warn!("Invalid user");
          return Err(anyhow!("could not find user"));
        },
        _ => {
          warn!("User profile query error: {:?}", err);
          return Err(anyhow!("query error"));
        }
      }
    }
  };

  let profile_for_response = UserProfileRecordForResponse {
    user_token: profile_record.user_token.clone(),
    username: profile_record.username.clone(),
    display_name: profile_record.display_name.clone(),
    email_gravatar_hash: profile_record.email_gravatar_hash.clone(),
    profile_markdown: profile_record.profile_markdown.clone(),
    profile_rendered_html: profile_record.profile_rendered_html.clone(),
    user_role_slug: profile_record.user_role_slug.clone(),
    banned: if profile_record.banned == 0 { false } else { true },
    avatar_public_bucket_hash: profile_record.avatar_public_bucket_hash.clone(),
    disable_gravatar: if profile_record.disable_gravatar == 0 { false } else { true },
    maybe_preferred_tts_model_token: profile_record.maybe_preferred_tts_model_token.clone(),
    maybe_preferred_w2l_template_token: profile_record.maybe_preferred_w2l_template_token.clone(),
    discord_username: profile_record.discord_username.clone(),
    twitch_username: profile_record.twitch_username.clone(),
    twitter_username: profile_record.twitter_username.clone(),
    patreon_username: profile_record.patreon_username.clone(),
    github_username: profile_record.github_username.clone(),
    created_at: profile_record.created_at.clone(),
  };

  Ok(profile_for_response)
}
