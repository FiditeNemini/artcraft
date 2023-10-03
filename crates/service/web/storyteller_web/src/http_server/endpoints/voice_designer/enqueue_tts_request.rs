#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use std::sync::Arc;
use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use log::{info, warn};
use enums::by_table::generic_inference_jobs::inference_category::InferenceCategory;
use enums::by_table::generic_inference_jobs::inference_model_type::InferenceModelType;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use tokens::jobs::inference::InferenceJobToken;
use crate::server_state::ServerState;



// TODO MOVE into own file.
use std::fmt::Debug;
use serde::Deserialize;
use serde::Serialize;
use crate::prefixes::EntityType;
/// The primary key for embeddings for voice cloning inference jobs.
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct EmbeddingToken(String);


#[derive(Deserialize)]
pub struct EnqueueTTSRequest {
  uuid_idempotency_token: String,
  text: String,
  embedding_token: EmbeddingToken
}

#[derive(Serialize)]
pub struct EnqueueTTSRequestSuccessResponse {
  pub success: bool,
  pub inference_job_token: InferenceJobToken
}


#[derive(Debug)]
pub enum EnqueueTTSRequestError {
  BadInput(String),
  NotAuthorized,
  ServerError,
  RateLimited,
}

impl ResponseError for EnqueueTTSRequestError {
  fn status_code(&self) -> StatusCode {
    match *self {
      EnqueueTTSRequestError::BadInput(_) => StatusCode::BAD_REQUEST,
      EnqueueTTSRequestError::NotAuthorized => StatusCode::UNAUTHORIZED,
      EnqueueTTSRequestError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      EnqueueTTSRequestError::RateLimited => StatusCode::TOO_MANY_REQUESTS,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      EnqueueTTSRequestError::BadInput(reason) => reason.to_string(),
      EnqueueTTSRequestError::NotAuthorized => "unauthorized".to_string(),
      EnqueueTTSRequestError::ServerError => "server error".to_string(),
      EnqueueTTSRequestError::RateLimited => "rate limited".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

impl std::fmt::Display for EnqueueTTSRequestError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}


// Implementation for enqueuing a TTS request
// Reference enqueue_infer_tts_handler.rs for checks: rate limiting / user sessions
// insert generic inference job.rs
// Need to convert it to generic inference job.
pub async fn enqueue_tts_request(
  http_request: HttpRequest,
  request: web::Json<EnqueueTTSRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse,EnqueueTTSRequestError> {

  // do something with user session check if the user should even be able to access the end point

  // GET MY SQL
  let mut mysql_connection = server_state.mysql_pool
  .acquire()
  .await
  .map_err(|err| {
    warn!("MySql pool error: {:?}", err);
    EnqueueTTSRequestError::ServerError
  })?;


// TODO: check for session 

// TODO: Give investors priority

// TODO: Add Rate Limiter

// TODO: Look up model info?

// TODO(bt): CHECK DATABASE FOR TOKENS? I am guessing we need to ensure those tokens exist because the files may not uploaded or are availible?
// get input from the container spec and create a object that similar to llipsync_payload.rs

// PACKAGE JSON into RUST Struct, any smaller components
// remap from the request
// pass tokens from the request and create a payload that will have the information.
// check malformed json

// Get up IP address

// package as larger component args

// create the inference args here

// enqueue a zero shot tts request here...

// create the job record here! explore the table

// Error handling 101 rust result type returned like so.
  //Ok(HttpResponse::Ok().json("TTS request enqueued successfully"))
  Err(EnqueueTTSRequestError::ServerError)
}