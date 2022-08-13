use actix_http::Error;
use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use anyhow::anyhow;
use chrono::{DateTime, Utc};
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use database_queries::column_types::record_visibility::RecordVisibility;
use database_queries::helpers::boolean_converters::i8_to_bool;
use database_queries::queries::users::user_badges::list_user_badges::UserBadgeForList;
use database_queries::queries::users::user_badges::list_user_badges::list_user_badges;
use log::{info, warn, log};
use md5::{Md5, Digest};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::fmt;
use std::sync::Arc;
use time::Instant;
use http_server_common::util::timer::time_section;

// TODO: This is duplicated in query_user_profile
// TODO: This handler has embedded queries.

#[derive(Serialize)]
pub struct UserProfileRecordForResponse {
  pub user_token: String,
  pub username: String,
  pub display_name: String,
  pub email_gravatar_hash: String,
  pub profile_markdown: String,
  pub profile_rendered_html: String,
  pub user_role_slug: String,
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
  pub maybe_moderator_fields: Option<UserProfileModeratorFields>,
}

#[derive(Serialize)]
pub struct UserProfileModeratorFields {
  pub is_banned: bool,
  pub maybe_mod_comments: Option<String>,
  pub maybe_mod_user_token: Option<String>,
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
  pub is_banned: i8,
  pub maybe_mod_comments: Option<String>,
  pub maybe_mod_user_token: Option<String>,
  pub created_at: DateTime<Utc>,
}

#[derive(Debug)]
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

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for ProfileError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}


struct Timing {

}

pub async fn get_profile_handler(
  http_request: HttpRequest,
  path: Path<GetProfilePathInfo>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, ProfileError>
{
  let time_at_request_start = Instant::now();

  let maybe_user_session = time_section(|| async {
    server_state
        .session_checker
        .maybe_get_user_session(&http_request, &server_state.mysql_pool)
        .await
        .map_err(|e| {
          warn!("Session checker error: {:?}", e);
          ProfileError::ServerError
        })
    }
  ).await?;

  let time_after_session_check = Instant::now();

  let mut is_mod = false;

  if let Some(user_session) = &maybe_user_session {
    is_mod = user_session.can_ban_users;
  }

  let time_before_profile_query = Instant::now();

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
    disable_gravatar,
    preferred_tts_result_visibility as `preferred_tts_result_visibility: database_queries::column_types::record_visibility::RecordVisibility`,
    preferred_w2l_result_visibility as `preferred_w2l_result_visibility: database_queries::column_types::record_visibility::RecordVisibility`,
    discord_username,
    twitch_username,
    twitter_username,
    patreon_username,
    github_username,
    cashapp_username,
    website_url,
    is_banned,
    maybe_mod_comments,
    maybe_mod_user_token,
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

  let time_after_profile_query = Instant::now();

  let profile_record : RawUserProfileRecord = match maybe_profile_record {
    Ok(profile_record) => profile_record,
    Err(err) => {
      match err {
        sqlx::Error::RowNotFound => {
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

  let is_banned = i8_to_bool(profile_record.is_banned);

  if is_banned && !is_mod {
    // Can't see banned users.
    return Err(ProfileError::NotFound);
  }

  let time_before_badges_list = Instant::now();

  let badges = list_user_badges(&server_state.mysql_pool, &profile_record.user_token)
      .await
      .unwrap_or_else(|err| {
        warn!("Error querying badges: {:?}", err);
        return Vec::new(); // NB: Fine if this fails. Not sure why it would.
      });

  let time_after_badges_list = Instant::now();

  let maybe_mod_fields = if is_mod {
    Some(UserProfileModeratorFields {
      is_banned,
      maybe_mod_comments: profile_record.maybe_mod_comments.clone(),
      maybe_mod_user_token: profile_record.maybe_mod_user_token.clone(),
    })
  } else {
    None
  };

  let profile_for_response = UserProfileRecordForResponse {
    user_token: profile_record.user_token,
    username: profile_record.username,
    display_name: profile_record.display_name,
    email_gravatar_hash: profile_record.email_gravatar_hash,
    profile_markdown: profile_record.profile_markdown,
    profile_rendered_html: profile_record.profile_rendered_html,
    user_role_slug: profile_record.user_role_slug,
    disable_gravatar: i8_to_bool(profile_record.disable_gravatar),
    preferred_tts_result_visibility: profile_record.preferred_tts_result_visibility,
    preferred_w2l_result_visibility: profile_record.preferred_w2l_result_visibility,
    discord_username: profile_record.discord_username,
    twitch_username: profile_record.twitch_username,
    twitter_username: profile_record.twitter_username,
    patreon_username: profile_record.patreon_username,
    github_username: profile_record.github_username,
    cashapp_username: profile_record.cashapp_username,
    website_url: profile_record.website_url,
    created_at: profile_record.created_at,
    maybe_moderator_fields: maybe_mod_fields,
    badges,
  };

  let response = ProfileSuccessResponse {
    success: true,
    user: Some(profile_for_response),
  };

  let time_at_request_end = Instant::now();

  let body = serde_json::to_string(&response)
    .map_err(|e| ProfileError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
