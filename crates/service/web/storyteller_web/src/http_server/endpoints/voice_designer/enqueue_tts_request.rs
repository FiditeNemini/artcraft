#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use enums::by_table::generic_inference_jobs::inference_category::InferenceCategory;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::{GenericInferenceArgs, InferenceCategoryAbbreviated, PolymorphicInferenceArgs};

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
use mysql_queries::queries::generic_inference::web::insert_generic_inference_job::{insert_generic_inference_job, InsertGenericInferenceArgs};

// TODO MOVE into own file.
use std::fmt::Debug;
use serde::Deserialize;
use serde::Serialize;

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

// create the job record here! explore the table insert the inference args in here as json! keep it short


let query_result = insert_generic_inference_job(InsertGenericInferenceArgs {
  uuid_idempotency_token: &request.uuid_idempotency_token,
  inference_category: InferenceCategory::TextToSpeech,
  maybe_model_type: Some(InferenceModelType::VallEX), // NB: Model is static during inference
  maybe_model_token: None, // NB: Model is static during inference
  maybe_input_source_token: None, // TODO: Introduce a second foreign key ?
  maybe_input_source_token_type: None, // TODO: Introduce a second foreign key ?
  maybe_raw_inference_text: None, // No text
  maybe_inference_args: Some(GenericInferenceArgs {
    inference_category: Some(InferenceCategoryAbbreviated::TextToSpeech),
    args: Some(PolymorphicInferenceArgs::La(inference_args)),
  }),
  maybe_creator_user_token: maybe_user_token.as_ref(),
  creator_ip_address: &ip_address,
  creator_set_visibility: set_visibility,
  priority_level,
  requires_keepalive: plan.lipsync_requires_frontend_keepalive(),
  is_debug_request,
  maybe_routing_tag: maybe_routing_tag.as_deref(),
  mysql_pool: &server_state.mysql_pool,
}).await;

let job_token = match query_result {
  Ok((job_token, _id)) => job_token,
  Err(err) => {
    warn!("New generic inference job creation DB error: {:?}", err);
    return Err(EnqueueLipsyncAnimationError::ServerError);
  }
};

// Error handling 101 rust result type returned like so.
  //Ok(HttpResponse::Ok().json("TTS request enqueued successfully"))
  Err(EnqueueTTSRequestError::ServerError)
}