use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use anyhow::anyhow;
use chrono::{DateTime, Utc};
use crate::AnyhowResult;
use crate::database::enums::record_visibility::RecordVisibility;
use crate::database::helpers::boolean_converters::i8_to_bool;
use crate::database::queries::list_user_badges::UserBadgeForList;
use crate::database::queries::list_user_badges::list_user_badges;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use derive_more::{Display, Error};
use log::{info, warn, log};
use md5::{Md5, Digest};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;

// TODO: This is duplicated in query_user_profile


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
  pub is_banned: bool,
  pub disable_gravatar: bool,
  pub preferred_tts_result_visibility: RecordVisibility,
  pub preferred_w2l_result_visibility: RecordVisibility,
  pub discord_username: Option<String>,
  pub twitch_username: Option<String>,
  pub twitter_username: Option<String>,
  pub patreon_username: Option<String>,
  pub github_username: Option<String>,
  pub cashapp_username: Option<String>,
  pub website_url: Option<String>,
  pub badges: Vec<UserBadgeForList>,
  pub created_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ProfileSuccessResponse {
  pub success: bool,
  pub user: Option<UserProfileRecordForResponse>,
}

#[derive(Serialize)]
pub struct RawUserProfileRecord {
  pub user_token: String,
  pub username: String,
  pub email_gravatar_hash: String,
  pub display_name: String,
  pub profile_markdown: String,
  pub profile_rendered_html: String,
  pub user_role_slug: String,
  pub is_banned: i8,
  pub disable_gravatar: i8,
  pub preferred_tts_result_visibility: RecordVisibility,
  pub preferred_w2l_result_visibility: RecordVisibility,
  pub discord_username: Option<String>,
  pub twitch_username: Option<String>,
  pub twitter_username: Option<String>,
  pub patreon_username: Option<String>,
  pub github_username: Option<String>,
  pub cashapp_username: Option<String>,
  pub website_url: Option<String>,
  pub created_at: DateTime<Utc>,
}

#[derive(Debug, Display)]
pub enum ProfileError {
  ServerError,
  NotFound,
}

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct GetProfilePathInfo {
  username: String,
}

impl ResponseError for ProfileError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ProfileError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
      ProfileError::NotFound => StatusCode::NOT_FOUND,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      ProfileError::ServerError => "server error".to_string(),
      ProfileError::NotFound => "not found error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn get_profile_handler(
  http_request: HttpRequest,
  path: Path<GetProfilePathInfo>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, ProfileError>
{
  // NB: Lookup failure is Err(RowNotFound).
  // NB: Since this is publicly exposed, we don't query sensitive data.
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
    preferred_tts_result_visibility as `preferred_tts_result_visibility: crate::database::enums::record_visibility::RecordVisibility`,
    preferred_w2l_result_visibility as `preferred_w2l_result_visibility: crate::database::enums::record_visibility::RecordVisibility`,
    discord_username,
    twitch_username,
    twitter_username,
    patreon_username,
    github_username,
    cashapp_username,
    website_url,
    created_at
FROM users
WHERE
    users.username = ?
    AND users.user_deleted_at IS NULL
    AND users.mod_deleted_at IS NULL
        "#,
        &path.username,
    )
    .fetch_one(&server_state.mysql_pool)
    .await; // TODO: This will return error if it doesn't exist

  let profile_record : RawUserProfileRecord = match maybe_profile_record {
    Ok(profile_record) => profile_record,
    Err(err) => {
      match err {
        RowNotFound => {
          warn!("Invalid user");
          return Err(ProfileError::NotFound);
        },
        _ => {
          warn!("User profile query error: {:?}", err);
          return Err(ProfileError::ServerError);
        }
      }
    }
  };

  let badges = list_user_badges(&server_state.mysql_pool, &profile_record.user_token)
      .await
      .unwrap_or_else(|err| {
        warn!("Error querying badges: {:?}", err);
        return Vec::new(); // NB: Fine if this fails. Not sure why it would.
      });

  let profile_for_response = UserProfileRecordForResponse {
    user_token: profile_record.user_token.clone(),
    username: profile_record.username.clone(),
    display_name: profile_record.display_name.clone(),
    email_gravatar_hash: profile_record.email_gravatar_hash.clone(),
    profile_markdown: profile_record.profile_markdown.clone(),
    profile_rendered_html: profile_record.profile_rendered_html.clone(),
    user_role_slug: profile_record.user_role_slug.clone(),
    is_banned: i8_to_bool(profile_record.is_banned),
    disable_gravatar: i8_to_bool(profile_record.disable_gravatar),
    preferred_tts_result_visibility: profile_record.preferred_tts_result_visibility,
    preferred_w2l_result_visibility: profile_record.preferred_w2l_result_visibility,
    discord_username: profile_record.discord_username.clone(),
    twitch_username: profile_record.twitch_username.clone(),
    twitter_username: profile_record.twitter_username.clone(),
    patreon_username: profile_record.patreon_username.clone(),
    github_username: profile_record.github_username.clone(),
    cashapp_username: profile_record.cashapp_username.clone(),
    website_url: profile_record.website_url.clone(),
    created_at: profile_record.created_at.clone(),
    badges,
  };

  let response = ProfileSuccessResponse {
    success: true,
    user: Some(profile_for_response),
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| ProfileError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
