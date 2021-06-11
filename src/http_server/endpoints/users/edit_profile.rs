use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::common_queries::sessions::create_session_for_user;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::server_state::ServerState;
use crate::util::email_to_gravatar::email_to_gravatar;
use crate::util::markdown_to_html::markdown_to_html;
use crate::util::random_crockford_token::random_crockford_token;
use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;
use crate::validations::cashapp_username::validate_cashapp_username;
use crate::validations::check_for_slurs::contains_slurs;
use crate::validations::discord_username::validate_discord_username;
use crate::validations::github_username::validate_github_username;
use crate::validations::passwords::validate_passwords;
use crate::validations::twitch_username::validate_twitch_username;
use crate::validations::twitter_username::validate_twitter_username;
use crate::validations::username::validate_username;
use crate::validations::username_reservations::is_reserved_username;
use crate::validations::website_url::validate_website_url;
use derive_more::{Display, Error};
use log::{info, warn, log};
use regex::Regex;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;
use crate::common_queries::query_user_profile::select_user_profile_by_username;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;

/// For the URL PathInfo
#[derive(Deserialize)]
pub struct EditProfilePathInfo {
  username: String,
}

#[derive(Deserialize)]
pub struct EditProfileRequest {
  pub display_name: Option<String>,

  pub profile_markdown: Option<String>,

  pub discord_username: Option<String>,
  pub twitter_username: Option<String>,
  pub twitch_username: Option<String>,
  pub patreon_username: Option<String>,
  pub github_username: Option<String>,
  pub cashapp_username: Option<String>,
  pub website_url: Option<String>,
}

#[derive(Serialize)]
pub struct EditProfileSuccessResponse {
  pub success: bool,
}

#[derive(Debug, Display)]
pub enum EditProfileError {
  BadInput(String),
  NotAuthorized,
  UserNotFound,
  ServerError,
}

impl ResponseError for EditProfileError {
  fn status_code(&self) -> StatusCode {
    match *self {
      EditProfileError::BadInput(_) => StatusCode::BAD_REQUEST,
      EditProfileError::NotAuthorized => StatusCode::UNAUTHORIZED,
      EditProfileError::UserNotFound => StatusCode::NOT_FOUND,
      EditProfileError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      EditProfileError::BadInput(reason) => reason.to_string(),
      EditProfileError::NotAuthorized=> "unauthorized".to_string(),
      EditProfileError::UserNotFound => "user not found".to_string(),
      EditProfileError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

pub async fn edit_profile_handler(
  http_request: HttpRequest,
  path: Path<EditProfilePathInfo>,
  request: web::Json<EditProfileRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, EditProfileError>
{
  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        EditProfileError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(EditProfileError::NotAuthorized);
    }
  };

  let user_lookup_result =
      select_user_profile_by_username(&path.username, &server_state.mysql_pool)
      .await;

  let user_record = match user_lookup_result {
    Ok(result) => {
      info!("Found user: {}", result.username);
      result
    }
    Err(err) => {
      warn!("could not find user");
      return Err(EditProfileError::UserNotFound);
    }
  };

  let mut editor_is_original_user = false;
  let mut editor_is_moderator = false;

  if path.username == user_session.username {
    editor_is_original_user = true;
  }

  if user_session.can_edit_other_users_profiles {
    editor_is_moderator = true;
  }

  // Fields to set
  let mut twitter_username = None;
  let mut twitch_username = None;
  let mut discord_username = None;
  let mut cashapp_username = None;
  let mut github_username = None;
  let mut website_url = None;
  let mut profile_markdown = None;
  let mut profile_html = None;

  if !editor_is_original_user && !editor_is_moderator {
    return Err(EditProfileError::NotAuthorized);
  }

  if let Some(twitter) = request.twitter_username.as_deref() {
    let trimmed = twitter.trim();
    if trimmed.is_empty() {
      twitter_username = None;
    } else {
      if let Err(reason) = validate_twitter_username(trimmed) {
        return Err(EditProfileError::BadInput(reason));
      }
      twitter_username = Some(trimmed);
    }
  }

  if let Some(twitch) = request.twitch_username.as_deref() {
    let trimmed = twitch.trim();
    if trimmed.is_empty() {
      twitch_username = None;
    } else {
      if let Err(reason) = validate_twitch_username(trimmed) {
        return Err(EditProfileError::BadInput(reason));
      }
      twitch_username = Some(trimmed);
    }
  }

  if let Some(discord) = request.discord_username.as_deref() {
    let trimmed = discord.trim();
    if trimmed.is_empty() {
      discord_username = None;
    } else {
      if let Err(reason) = validate_discord_username(trimmed) {
        return Err(EditProfileError::BadInput(reason));
      }
      discord_username = Some(trimmed);
    }
  }

  if let Some(github) = request.github_username.as_deref() {
    let trimmed = github.trim();
    if trimmed.is_empty() {
      github_username = None;
    } else {
      if let Err(reason) = validate_github_username(trimmed) {
        return Err(EditProfileError::BadInput(reason));
      }
      github_username = Some(trimmed);
    }
  }

  if let Some(cashapp) = request.cashapp_username.as_deref() {
    let trimmed = cashapp.trim();
    if trimmed.is_empty() {
      cashapp_username = None;
    } else {
      if let Err(reason) = validate_cashapp_username(trimmed) {
        return Err(EditProfileError::BadInput(reason));
      }
      cashapp_username = Some(trimmed);
    }
  }

  if let Some(website) = request.website_url.as_deref() {
    let trimmed = website.trim();
    if trimmed.is_empty() {
      website_url = None;
    } else {
      if let Err(reason) = validate_website_url(trimmed) {
        return Err(EditProfileError::BadInput(reason));
      }
      website_url = Some(trimmed);
    }
  }

  if let Some(markdown) = request.profile_markdown.as_deref() {
    if contains_slurs(markdown) {
      return Err(EditProfileError::BadInput("profile contains slurs".to_string()));
    }

    let markdown = markdown.trim().to_string();
    let html = markdown_to_html(&markdown);

    profile_markdown = Some(markdown);
    profile_html = Some(html);
  }

  let ip_address = get_request_ip(&http_request);

  let query_result = if editor_is_original_user {
    // We need to store the IP address details.
    sqlx::query!(
        r#"
UPDATE users
SET
    profile_markdown = ?,
    profile_rendered_html = ?,
    discord_username = ?,
    twitter_username = ?,
    twitch_username = ?,
    github_username = ?,
    cashapp_username = ?,
    website_url = ?,
    ip_address_last_update = ?,
    version = version + 1

WHERE users.token = ?
LIMIT 1
        "#,
      profile_markdown,
      profile_html,
      discord_username,
      twitter_username,
      twitch_username,
      github_username,
      cashapp_username,
      website_url,
      ip_address.clone(),
      user_record.user_token.clone(),
    )
    .execute(&server_state.mysql_pool)
    .await
  } else {
    // We need to store the moderator details.
    sqlx::query!(
        r#"
UPDATE users
SET
    profile_markdown = ?,
    profile_rendered_html = ?,
    discord_username = ?,
    twitter_username = ?,
    twitch_username = ?,
    github_username = ?,
    cashapp_username = ?,
    website_url = ?,
    version = version + 1

WHERE users.token = ?
LIMIT 1
        "#,
      profile_markdown,
      profile_html,
      discord_username,
      twitter_username,
      twitch_username,
      github_username,
      cashapp_username,
      website_url,
      user_record.user_token.clone(),
    )
    .execute(&server_state.mysql_pool)
    .await
  };

  match query_result {
    Ok(_) => {},
    Err(err) => {
      warn!("Profile edit DB error: {:?}", err);
      return Err(EditProfileError::ServerError);
    }
  };

  let response = EditProfileSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| EditProfileError::BadInput("".to_string()))?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
