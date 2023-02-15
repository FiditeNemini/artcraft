use actix_http::StatusCode;
use actix_web::web::Query;
use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use crate::shared_state::app_control_state::AppControlState;
use crate::web_server::server_state::ServerState;
use files::file_exists::file_exists;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::{error, info};
use rand::seq::SliceRandom;
use sqlite_queries::queries::by_table::news_stories::list_news_stories_replayable::list_news_stories_replayable;
use std::sync::Arc;
use tokens::tokens::news_stories::NewsStoryToken;

#[derive(Deserialize)]
pub struct GetNextNewsStoryQuery {
  pub news_story_token: Option<String>,
}

#[derive(Serialize)]
pub struct GetNextNewsStoryFileResponse {
  pub success: bool,
  pub news_story_token: NewsStoryToken,
  pub original_news_canonical_url: String,
  pub original_news_title: String,
  pub audio_file_count: u64,
  pub audio_total_duration_seconds: u64,
}

#[derive(Debug, Serialize)]
pub enum GetNextNewsStoryFileError {
  ServerError,
}

impl ResponseError for GetNextNewsStoryFileError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetNextNewsStoryFileError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl std::fmt::Display for GetNextNewsStoryFileError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn get_next_news_story_handler(
  _http_request: HttpRequest,
  control_state: web::Data<Arc<AppControlState>>,
  server_state: web::Data<Arc<ServerState>>,
  query: Query<GetNextNewsStoryQuery>,
) -> Result<HttpResponse, GetNextNewsStoryFileError> {

  let stories = list_news_stories_replayable(&server_state.sqlite_pool)
      .await
      .map_err(|err| {
        error!("Error querying: {:?}", err);
        GetNextNewsStoryFileError::ServerError
      })?;

  // TODO: Use history information to skip recently played.

  let story = stories.choose(&mut rand::thread_rng())
      .ok_or(GetNextNewsStoryFileError::ServerError)?;



//  info!("Requested cursor: {}", request.cursor);
//
//  let is_paused = control_state.is_paused()
//      .map_err(|err| {
//        error!("Error: {:?}", err);
//        GetNextNewsStoryFileError::ServerError
//      })?;
//
//
//  let audio_file_dir = server_state.save_directory.get_audio_files_dir_v1();
//
//  let maybe_audio_filename = format!("{}.wav", request.cursor);
//  let maybe_audio_filename = audio_file_dir.join(maybe_audio_filename);
//
//  info!("Hypothetical audio file: {:?}", maybe_audio_filename);
//
//  let mut next_cursor;
//  let mut audio_filename : Option<String> = None;
//  let mut audio_filename_unixy : Option<String> = None;
//
//  if file_exists(&maybe_audio_filename) {
//    next_cursor = request.cursor + 1;
//    audio_filename = maybe_audio_filename.to_str()
//        .map(|s| s.to_string());
//    audio_filename_unixy = audio_filename.as_deref()
//        .map(|s| s.to_string())
//        .map(|s| s.replace("\\", "/"));
//  } else {
//    next_cursor = 0;
//    audio_filename = None;
//  };
//
//  let maybe_next_audio_filename = format!("{}.wav", next_cursor);
//  let maybe_next_audio_filename = audio_file_dir.join(maybe_next_audio_filename);
//
//  if !file_exists(&maybe_next_audio_filename) {
//    next_cursor = 0;
//  }

  let response = GetNextNewsStoryFileResponse {
    success: true,
    news_story_token: story.news_story_token.clone(),
    original_news_canonical_url: story.original_news_canonical_url.clone(),
    original_news_title: story.original_news_title.clone(),
    audio_file_count: story.audio_file_count as u64,
    audio_total_duration_seconds: story.audio_total_duration_seconds as u64,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| GetNextNewsStoryFileError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
