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
use database_queries::queries::users::get_user_profile_by_username::{get_user_profile_by_username, UserProfileResult};
use database_queries::queries::users::user_badges::list_user_badges::UserBadgeForList;
use database_queries::queries::users::user_badges::list_user_badges::list_user_badges;
use http_server_common::util::timer::MultiBenchmarkingTimer;
use log::{info, warn, log};
use md5::{Md5, Digest};
use regex::Regex;
use reusable_types::entity_visibility::EntityVisibility;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::fmt;
use std::sync::Arc;
use time::Instant;

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
  pub preferred_tts_result_visibility: EntityVisibility,
  pub preferred_w2l_result_visibility: EntityVisibility,
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
  let mut benchmark = MultiBenchmarkingTimer::new();

  let maybe_user_session =
      benchmark.time_async_section("session checker", || async {
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

  let mut is_mod = false;

  if let Some(user_session) = &maybe_user_session {
    is_mod = user_session.can_ban_users;
  }

  let maybe_user_profile =
      get_user_profile_by_username(&path.username, &server_state.mysql_pool).await;

  let mut user_profile = match maybe_user_profile {
    Ok(Some(user_profile)) => user_profile,
    Ok(None) => {
      warn!("Invalid user");
      return Err(ProfileError::NotFound);
    },
    Err(err) => {
      warn!("User profile query error: {:?}", err);
      return Err(ProfileError::ServerError);
    }
  };

  let is_banned = user_profile.maybe_moderator_fields
      .as_ref()
      .map(|mod_fields| mod_fields.is_banned)
      .unwrap_or(false);

  if is_banned && !is_mod {
    // Can't see banned users.
    return Err(ProfileError::NotFound);
  }

  let time_before_badges_list = Instant::now();

  let badges = list_user_badges(&server_state.mysql_pool, &user_profile.user_token)
      .await
      .unwrap_or_else(|err| {
        warn!("Error querying badges: {:?}", err);
        return Vec::new(); // NB: Fine if this fails. Not sure why it would.
      });

  let time_after_badges_list = Instant::now();

  let mut profile_for_response = UserProfileRecordForResponse {
    user_token: user_profile.user_token,
    username: user_profile.username,
    display_name: user_profile.display_name,
    email_gravatar_hash: user_profile.email_gravatar_hash,
    profile_markdown: user_profile.profile_markdown,
    profile_rendered_html: user_profile.profile_rendered_html,
    user_role_slug: user_profile.user_role_slug,
    disable_gravatar: user_profile.disable_gravatar,
    preferred_tts_result_visibility: user_profile.preferred_tts_result_visibility,
    preferred_w2l_result_visibility: user_profile.preferred_w2l_result_visibility,
    discord_username: user_profile.discord_username,
    twitch_username: user_profile.twitch_username,
    twitter_username: user_profile.twitter_username,
    patreon_username: user_profile.patreon_username,
    github_username: user_profile.github_username,
    cashapp_username: user_profile.cashapp_username,
    website_url: user_profile.website_url,
    created_at: user_profile.created_at,
    maybe_moderator_fields: user_profile.maybe_moderator_fields.map(|mod_fields| {
      UserProfileModeratorFields {
        is_banned: mod_fields.is_banned,
        maybe_mod_comments: mod_fields.maybe_mod_comments,
        maybe_mod_user_token: mod_fields.maybe_mod_user_token,
      }
    }),
    badges,
  };

  if !is_mod {
    profile_for_response.maybe_moderator_fields = None;
  }

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
