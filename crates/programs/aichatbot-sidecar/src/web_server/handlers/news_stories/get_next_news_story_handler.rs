use actix_http::StatusCode;
use actix_web::web::Query;
use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use crate::shared_state::app_control_state::AppControlState;
use crate::web_server::server_state::ServerState;
use files::file_exists::file_exists;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::{error, info, warn};
use rand::seq::SliceRandom;
use sqlite_queries::queries::by_table::news_stories::list::list_news_stories_all::list_news_stories_all;
use sqlite_queries::queries::by_table::news_stories::list::list_news_stories_replayable::list_news_stories_replayable;
use std::sync::Arc;
use tokens::tokens::news_stories::NewsStoryToken;

#[derive(Deserialize, Debug)]
pub struct GetNextNewsStoryQuery {
  pub news_story_token: Option<NewsStoryToken>,
}

#[derive(Serialize, Debug)]
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

  warn!("get_next_news_story_handler() : {:?}", &query);

  let mut stories = list_news_stories_replayable(&server_state.sqlite_pool)
      .await
      .map_err(|err| {
        error!("Error querying: {:?}", err);
        GetNextNewsStoryFileError::ServerError
      })?;

  // TODO: Probably shouldn't fall back on old stories! Maybe flag this.
  if stories.is_empty() {
    stories = list_news_stories_all(&server_state.sqlite_pool)
        .await
        .map_err(|err| {
          error!("Error querying: {:?}", err);
          GetNextNewsStoryFileError::ServerError
        })?;
  }

  // TODO: Use history information to skip recently played.

  let story = stories.choose(&mut rand::thread_rng())
      .ok_or(GetNextNewsStoryFileError::ServerError)?;

  let response = GetNextNewsStoryFileResponse {
    success: true,
    news_story_token: story.news_story_token.clone(),
    original_news_canonical_url: story.original_news_canonical_url.clone(),
    original_news_title: story.original_news_title.clone(),
    audio_file_count: story.audio_file_count as u64,
    audio_total_duration_seconds: story.audio_total_duration_seconds as u64,
  };

  warn!("Response: {:?}", &response);

  let body = serde_json::to_string(&response)
      .map_err(|e| GetNextNewsStoryFileError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
