use actix_http::StatusCode;
use actix_web::web::Query;
use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use crate::shared_state::app_control_state::AppControlState;
use crate::web_server::handlers::misc::get_next_audio_file_handler::GetNextAudioFileError;
use crate::web_server::server_state::ServerState;
use files::file_exists::file_exists;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::{error, info, warn};
use rand::seq::SliceRandom;
use sqlite_queries::queries::by_table::news_stories::get_news_story_by_token::get_news_story_by_token;
use sqlite_queries::queries::by_table::tts_render_tasks::list::list_tts_render_tasks_for_story_token::list_tts_render_tasks_for_story_token;
use sqlite_queries::queries::by_table::tts_render_tasks::list::tts_render_task::TtsRenderTask;
use std::path::PathBuf;
use std::sync::Arc;
use tokens::tokens::news_stories::NewsStoryToken;

#[derive(Deserialize, Debug)]
pub struct GetNextNewsStoryAudioFileQuery {
  /// News Story Token. REQUIRED.
  pub news_story_token: Option<NewsStoryToken>,

  /// Audio cursor, 0-indexed.
  pub audio_cursor: Option<u64>,
}

#[derive(Serialize, Debug)]
pub struct GetNextNewsStoryAudioFileResponse {
  pub success: bool,
  pub news_story_token: NewsStoryToken,

  //pub original_news_canonical_url: String,
  //pub original_news_title: String,

  /// The number of audio files in the current sequence.
  pub sequence_audio_file_count: u64,

  /// Current audio cursor (1-indexed). This is the one to play.
  pub current_audio_index: u64,

  /// The local filesystem path of the audio file.
  pub audio_file_path: PathBuf,

  /// Whether there's a next cursor in the current sequence.
  pub has_next_in_sequence: bool,

  /// If there's a next cursor in the current sequence, this is it.
  pub maybe_next_cursor: Option<u64>,

  //pub audio_total_duration_seconds: u64,
}

#[derive(Debug, Serialize)]
pub enum GetNextNewsStoryAudioFileError {
  ServerError,
  BadRequest,
  NotFound,
}

impl ResponseError for GetNextNewsStoryAudioFileError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetNextNewsStoryAudioFileError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      GetNextNewsStoryAudioFileError::BadRequest => StatusCode::BAD_REQUEST,
      GetNextNewsStoryAudioFileError::NotFound => StatusCode::NOT_FOUND,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl std::fmt::Display for GetNextNewsStoryAudioFileError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn get_next_news_story_audio_file_handler(
  _http_request: HttpRequest,
  control_state: web::Data<Arc<AppControlState>>,
  server_state: web::Data<Arc<ServerState>>,
  query: Query<GetNextNewsStoryAudioFileQuery>,
) -> Result<HttpResponse, GetNextNewsStoryAudioFileError> {

  warn!("get_next_news_story_audio_file_handler() : {:?}", &query);

  let news_story_token = query.news_story_token
      .clone()
      .ok_or(GetNextNewsStoryAudioFileError::BadRequest)?;

  let query_result = get_news_story_by_token(
    &server_state.sqlite_pool,
    &news_story_token
  ).await;

  let news_story = match query_result {
    Ok(Some(news_story)) => news_story,
    Ok(None) => return Err(GetNextNewsStoryAudioFileError::NotFound),
    Err(err) => {
      error!("Database error: {:?}", err);
      return Err(GetNextNewsStoryAudioFileError::NotFound)
    },
  };

  let story_type = "news_story"; // TODO: Enumlike.
  let story_token = news_story_token.as_str();

  let tts_render_tasks = list_tts_render_tasks_for_story_token(
    story_type,
    story_token,
    &server_state.sqlite_pool)
      .await
      .map_err(|err| {
        error!("Database error: {:?}", err);
        GetNextNewsStoryAudioFileError::ServerError
      })?;

  let audio_cursor = query.audio_cursor.unwrap_or(0) as usize;

  let tts_render_task : &TtsRenderTask = match tts_render_tasks.get(audio_cursor) {
    Some(task) => task,
    None => {
      warn!("TTS task not found for NewsStoryToken {:?} cursor {}", news_story_token, audio_cursor);
      return Err(GetNextNewsStoryAudioFileError::NotFound);
    }
  };

  let audio_filename = server_state.save_directory
      .audio_wav_file_for_news_story(&news_story_token, tts_render_task.sequence_order)
      .map_err(|err| {
        error!("Path error: {:?}", err);
        GetNextNewsStoryAudioFileError::ServerError
      })?;

  let next_audio_cursor = audio_cursor + 1;

  let mut has_next_in_sequence = false;
  let mut maybe_next_cursor = None;

  if tts_render_tasks.get(next_audio_cursor).is_some() {
    has_next_in_sequence = true;
    maybe_next_cursor = Some(next_audio_cursor as u64);
  };

  let response = GetNextNewsStoryAudioFileResponse {
    success: true,
    news_story_token: news_story_token.clone(),
    sequence_audio_file_count: news_story.audio_file_count as u64,
    current_audio_index: audio_cursor as u64,
    audio_file_path: audio_filename,
    has_next_in_sequence,
    maybe_next_cursor,
  };

  warn!("Response: {:?}", &response);

  let body = serde_json::to_string(&response)
      .map_err(|e| GetNextNewsStoryAudioFileError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
