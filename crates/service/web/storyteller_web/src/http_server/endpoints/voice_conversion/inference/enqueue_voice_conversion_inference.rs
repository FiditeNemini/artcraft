// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{web, HttpResponse, HttpRequest};
use crate::configs::plans::get_correct_plan_for_session::get_correct_plan_for_session;
use crate::http_server::endpoints::investor_demo::demo_cookie::request_has_demo_cookie;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use database_queries::queries::generic_inference::web::insert_generic_inference_job::{Args, insert_generic_inference_job};
use enums::common::visibility::Visibility;
use enums::workers::generic_inference_type::GenericInferenceType;
use http_server_common::request::get_request_header_optional::get_request_header_optional;
use http_server_common::request::get_request_ip::get_request_ip;
use log::{info, warn};
use r2d2_redis::redis::Commands;
use redis_common::redis_keys::RedisKeys;
use std::fmt;
use std::sync::Arc;
use database_queries::payloads::generic_inference_args::{GenericInferenceArgs, PolymorphicInferenceArgs};
use tokens::files::media_upload::MediaUploadToken;
use tokens::jobs::inference::InferenceJobToken;
use tokens::users::user::UserToken;
use tokens::voice_conversion::model::VoiceConversionModelToken;
use tts_common::priority::FAKEYOU_INVESTOR_PRIORITY_LEVEL;

/// Debug requests can get routed to special "debug-only" workers, which can
/// be used to trial new code, run debugging, etc.
const DEBUG_HEADER_NAME : &'static str = "enable_debug_mode";

#[derive(Deserialize)]
pub struct EnqueueVoiceConversionInferenceRequest {
  uuid_idempotency_token: String,
  voice_conversion_model_token: String,
  source_media_token: String,
  creator_set_visibility: Option<Visibility>,
  is_storyteller_demo: Option<bool>,
}

#[derive(Serialize)]
pub struct EnqueueVoiceConversionInferenceSuccessResponse {
  pub success: bool,
  pub inference_job_token: InferenceJobToken,
}

#[derive(Debug)]
pub enum EnqueueVoiceConversionInferenceError {
  BadInput(String),
  NotAuthorized,
  ServerError,
  RateLimited,
}

impl ResponseError for EnqueueVoiceConversionInferenceError {
  fn status_code(&self) -> StatusCode {
    match *self {
      EnqueueVoiceConversionInferenceError::BadInput(_) => StatusCode::BAD_REQUEST,
      EnqueueVoiceConversionInferenceError::NotAuthorized => StatusCode::UNAUTHORIZED,
      EnqueueVoiceConversionInferenceError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      EnqueueVoiceConversionInferenceError::RateLimited => StatusCode::TOO_MANY_REQUESTS,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      EnqueueVoiceConversionInferenceError::BadInput(reason) => reason.to_string(),
      EnqueueVoiceConversionInferenceError::NotAuthorized => "unauthorized".to_string(),
      EnqueueVoiceConversionInferenceError::ServerError => "server error".to_string(),
      EnqueueVoiceConversionInferenceError::RateLimited => "rate limited".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for EnqueueVoiceConversionInferenceError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn enqueue_voice_conversion_inference_handler(
  http_request: HttpRequest,
  request: web::Json<EnqueueVoiceConversionInferenceRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, EnqueueVoiceConversionInferenceError>
{
  let mut maybe_user_token : Option<UserToken> = None;
  let mut priority_level ;
  let disable_rate_limiter = false; // NB: Careful!

  let mut mysql_connection = server_state.mysql_pool
      .acquire()
      .await
      .map_err(|err| {
        warn!("MySql pool error: {:?}", err);
        EnqueueVoiceConversionInferenceError::ServerError
      })?;

  // ==================== USER SESSION ==================== //

  let maybe_user_session = server_state
    .session_checker
    .maybe_get_user_session_extended_from_connection(&http_request, &mut mysql_connection)
    .await
    .map_err(|e| {
      warn!("Session checker error: {:?}", e);
      EnqueueVoiceConversionInferenceError::ServerError
    })?;

  if let Some(user_session) = maybe_user_session.as_ref() {
    maybe_user_token = Some(UserToken::new_from_str(&user_session.user_token));
  }

  // TODO: Plan should handle "first anonymous use" and "investor" cases.
  let plan = get_correct_plan_for_session(
    server_state.server_environment,
    maybe_user_session.as_ref());

  priority_level = plan.web_vc_base_priority_level();

  // ==================== INVESTOR PRIORITY ==================== //

  // TODO/TEMP: Give investors even more priority
  let mut is_investor = false;

  {
    // TODO/TEMP: The storyteller.io website's AJAX calls will set this.
    //  This is just for the YCombinator demo.
    match request.is_storyteller_demo {
      Some(true) => {
        is_investor = true;
      },
      _ => {},
    };

    // TODO/TEMP: The storyteller.io website will redirect and establish this cookie.
    //  This is just for the YCombinator demo.
    if request_has_demo_cookie(&http_request) {
      is_investor = true;
    }

    if is_investor {
      priority_level = FAKEYOU_INVESTOR_PRIORITY_LEVEL;
    }
  }

  // ==================== DEBUG MODE ==================== //

  let is_debug_request = get_request_header_optional(&http_request, DEBUG_HEADER_NAME)
      .is_some();

  // ==================== RATE LIMIT ==================== //

  if !disable_rate_limiter {
    let mut rate_limiter = match maybe_user_session {
      None => &server_state.redis_rate_limiters.logged_out,
      Some(ref user) => {
        if user.role.is_banned {
          return Err(EnqueueVoiceConversionInferenceError::NotAuthorized);
        }
        &server_state.redis_rate_limiters.logged_in
      },
    };

    // TODO/TEMP
    if is_investor {
      rate_limiter = &server_state.redis_rate_limiters.logged_in;
    }

    if let Err(_err) = rate_limiter.rate_limit_request(&http_request) {
      return Err(EnqueueVoiceConversionInferenceError::RateLimited);
    }
  }

  // ==================== CHECK AND ENQUEUE VOICE CONVERSION ==================== //

  // TODO(bt): CHECK DATABASE!
  let model_token = request.voice_conversion_model_token.to_string();
  let media_token = request.source_media_token.to_string();

  let mut redis = server_state.redis_pool
      .get()
      .map_err(|e| {
        warn!("redis error: {:?}", e);
        EnqueueVoiceConversionInferenceError::ServerError
      })?;

  let redis_count_key = RedisKeys::web_vc_model_usage_count(&model_token);

  redis.incr(&redis_count_key, 1)
      .map_err(|e| {
        warn!("redis error: {:?}", e);
        EnqueueVoiceConversionInferenceError::ServerError
      })?;

  let ip_address = get_request_ip(&http_request);

  let maybe_user_preferred_visibility : Option<Visibility> = maybe_user_session
      .as_ref()
      .map(|user_session| user_session.preferences.preferred_tts_result_visibility); // TODO: New setting for web-vc

  let set_visibility = request.creator_set_visibility
      .or(maybe_user_preferred_visibility)
      .unwrap_or(Visibility::Public);

  let job_token = InferenceJobToken::generate();

  info!("Creating voice conversion inference job record...");


  // TODO TODO TODO TODO --- InferenceArgs. ! This is where the media token will live.
  //  - Also maybe move reusable_types stuff to `_types` as a manner of cleanup
  //  - Also figure out which serializable types are giving the DB trouble. Wasn't this solved?
  //     I don't want to call to_str, as_str, etc. everywhere.
  //  - INFERENCE JOB(1) -> Voice Conversion (w/ Docker sidecar)
  //  - INFERENCE JOB(2) -> Get it working with TTS too, and update the frontend

  let query_result = insert_generic_inference_job(Args {
    job_token: &job_token,
    uuid_idempotency_token: &request.uuid_idempotency_token,
    inference_type: GenericInferenceType::VoiceConversion,
    maybe_inference_args: Some(GenericInferenceArgs {
      inference_type: Some(GenericInferenceType::VoiceConversion),
      args: Some(PolymorphicInferenceArgs::VoiceConversionInferenceArgs {
        model_token: Some(VoiceConversionModelToken::new_from_str(&model_token)),
        maybe_media_token: Some(MediaUploadToken::new_from_str(&media_token)),
      }),
    }),
    maybe_raw_inference_text: None,
    maybe_model_token: Some(model_token),
    maybe_creator_user_token: maybe_user_token.as_ref(),
    creator_ip_address: &ip_address,
    creator_set_visibility: set_visibility,
    priority_level,
    is_debug_request,
    mysql_pool: &server_state.mysql_pool,
  }).await;

  match query_result {
    Ok(_) => {},
    Err(err) => {
      warn!("New generic inference job creation DB error: {:?}", err);
      return Err(EnqueueVoiceConversionInferenceError::ServerError);
    }
  }

  server_state.firehose_publisher.enqueue_vc_inference(
    maybe_user_token.as_ref(),
    &job_token)
      .await
      .map_err(|e| {
        warn!("error publishing event: {:?}", e);
        EnqueueVoiceConversionInferenceError::ServerError
      })?;

  let response = EnqueueVoiceConversionInferenceSuccessResponse {
    success: true,
    inference_job_token: job_token,
  };

  let body = serde_json::to_string(&response)
    .map_err(|_e| EnqueueVoiceConversionInferenceError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
