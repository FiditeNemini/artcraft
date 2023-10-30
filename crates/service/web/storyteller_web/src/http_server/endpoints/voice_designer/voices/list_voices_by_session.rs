use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use chrono::{DateTime, Utc};
use log::warn;

use mysql_queries::queries::voice_designer::voices::list_voices_by_username::list_zs_voices_by_username;
use tokens::tokens::users::UserToken;
use tokens::tokens::zs_voices::ZsVoiceToken;

use crate::server_state::ServerState;

#[derive(Serialize, Clone)]
pub struct Voice {
  voice_token: ZsVoiceToken,
  title: String,
  creator_set_visibility: String,
  ietf_language_tag: String,
  ietf_primary_language_subtag: String,
  creator_user_token: UserToken,
  creator_username: String,

  created_at: DateTime<Utc>,
  updated_at: DateTime<Utc>,
}


#[derive(Serialize)]
pub struct ListVoicesByUserSuccessResponse {
  pub success: bool,
  pub voices: Vec<Voice>,
}

#[derive(Debug)]
pub enum ListVoicesByUserError {
  NotAuthorized,
  ServerError,
}

impl fmt::Display for ListVoicesByUserError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

impl ResponseError for ListVoicesByUserError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListVoicesByUserError::NotAuthorized => StatusCode::UNAUTHORIZED,
      ListVoicesByUserError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }
}

pub async fn list_voices_by_session(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, ListVoicesByUserError> {

  let user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        ListVoicesByUserError::ServerError
      })?
      .ok_or_else(|| {
        warn!("not logged in");
        return ListVoicesByUserError::NotAuthorized;
      })?;

  let creator_user_token = user_session.user_token.clone();
  let is_mod = user_session.can_ban_users;

  let query_results = list_zs_voices_by_username(
    &server_state.mysql_pool,
    &user_session.username,
    is_mod,
  ).await.map_err(|e| {
    warn!("Error querying for voices: {:?}", e);
    ListVoicesByUserError::ServerError
  });
  let voices = match query_results {
    Ok(voices) => voices,
    Err(e) => {
      warn!("Error querying for voices: {:?}", e);
      return Err(ListVoicesByUserError::ServerError);
    }
  };

  let voices = voices.into_iter().map(|voice| {
    Voice {
      voice_token: voice.voice_token,
      title: voice.title,
      creator_set_visibility: voice.creator_set_visibility.to_string() ,
      ietf_language_tag: voice.ietf_language_tag,
      ietf_primary_language_subtag: voice.ietf_primary_language_subtag,
      creator_user_token: voice.creator_user_token,
      creator_username: voice.creator_username,

      created_at: voice.created_at,
      updated_at: voice.updated_at,
    }
  }).collect();

  let response = ListVoicesByUserSuccessResponse {
    success: true,
    voices,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| ListVoicesByUserError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
