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
#[derive(Deserialize)]
pub struct EnqueueTTSRequest {
  uuid_idempotency_token: String,
  text: String
}


#[derive(Serialize)]
pub struct EnqueueTTSRequestSuccessResponse {
  pub success: bool,
  pub inference_job_token: InferenceJobToken,
  pub embedding_token: str
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

// TODO Delete later.
// Not gonna go this route, going to leverage enqueue_infer_tts_handler.rs instead.
pub async fn enqueue_tts_request(http_request: HttpRequest,
  request: web::Json<EnqueueTTSRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse,EnqueueTTSRequestError> 
  {
  // Implementation for enqueuing a TTS request

  // do something with user session check if the user should even be able to access the end point


  
  // let mut mysql_connection = server_state.mysql_pool
  // .acquire()
  // .await
  // .map_err(|err| {
  //   warn!("MySql pool error: {:?}", err);
  //   EnqueueTTSRequestError::ServerError
  // })?;

// check for session later 

// grab any data from other sources from GCB

// rate limiter


// remap the json into data for lookup in the DB and for other processes, from the request

// create the inference args here

// enqueue a zero shot tts request here...

// create the job record here! explore the table

  HttpResponse::Ok().json("TTS request enqueued successfully");
}