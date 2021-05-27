use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{Responder, web, HttpResponse, error, HttpRequest, HttpMessage};
use anyhow::anyhow;
use crate::AnyhowResult;
use crate::common_queries::sessions::create_session_for_user;
use crate::http_server::endpoints::users::create_account::CreateAccountError::{BadInput, ServerError, UsernameTaken, EmailTaken};
use crate::http_server::endpoints::users::login::LoginSuccessResponse;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::session_checker::SessionRecord;
use crate::server_state::ServerState;
use crate::util::random_token::random_token;
use crate::validations::passwords::validate_passwords;
use crate::validations::username::validate_username;
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

#[derive(Serialize)]
pub struct UserProfileRecord {
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

#[derive(Serialize)]
pub struct ProfileSuccessResponse {
  pub success: bool,
  pub user: Option<UserProfileRecordForResponse>,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
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

    let response = ErrorResponse {
      success: false,
      error_reason,
    };

    let body = match serde_json::to_string(&response) {
      Ok(json) => json,
      Err(_) => "{}".to_string(),
    };

    HttpResponseBuilder::new(self.status_code())
      .set_header(header::CONTENT_TYPE, "application/json")
      .body(body)
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
      UserProfileRecord,
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
WHERE users.username = ?
AND users.deleted_at IS NULL
        "#,
        &path.username,
    )
    .fetch_one(&server_state.mysql_pool)
    .await; // TODO: This will return error if it doesn't exist

  let profile_record : UserProfileRecord = match maybe_profile_record {
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
