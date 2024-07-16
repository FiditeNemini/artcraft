// NB: Incrementally getting rid of build warnings...
//#![forbid(unused_imports)]
//#![forbid(unused_mut)]
//#![forbid(unused_variables)]

use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Json;
use log::{error, info, warn};
use utoipa::ToSchema;

use enums::by_table::generic_inference_jobs::inference_category::InferenceCategory;
use enums::by_table::generic_inference_jobs::inference_job_type::InferenceJobType;
use enums::by_table::generic_inference_jobs::inference_model_type::InferenceModelType;
use enums::common::visibility::Visibility;
use enums::no_table::style_transfer::style_transfer_name::StyleTransferName;
use http_server_common::request::get_request_header_optional::get_request_header_optional;
use http_server_common::request::get_request_ip::get_request_ip;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::{GenericInferenceArgs, InferenceCategoryAbbreviated};
use mysql_queries::queries::generic_inference::web::insert_generic_inference_job::{insert_generic_inference_job, InsertGenericInferenceArgs};
use mysql_queries::queries::idepotency_tokens::insert_idempotency_token::insert_idempotency_token;
use primitives::traits::trim_or_emptyable::TrimOrEmptyable;
use primitives::try_str_to_num::try_str_to_num;
use tokens::tokens::generic_inference_jobs::InferenceJobToken;
use tokens::tokens::media_files::MediaFileToken;

use crate::configs::plans::get_correct_plan_for_session::get_correct_plan_for_session;
use crate::configs::plans::plan_category::PlanCategory;
use crate::http_server::headers::get_routing_tag_header::get_routing_tag_header;
use crate::http_server::headers::has_debug_header::has_debug_header;
use crate::http_server::validations::validate_idempotency_token_format::validate_idempotency_token_format;
use crate::http_server::web_utils::require_user_session::RequireUserSessionError;
use crate::http_server::web_utils::require_user_session_using_connection::require_user_session_using_connection;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::state::server_state::ServerState;

#[derive(Deserialize, ToSchema)]
pub struct EnqueueLivePortraitWorkflowRequest {
  /// Entropy for request de-duplication (required)
  uuid_idempotency_token: String,

  /// Source media token
  /// This can be an image or a video media file token
  portrait_media_file: MediaFileToken,

  /// Driving media token
  /// This must be a video media file token.
  driver_media_file: MediaFileToken,

  /// Remove watermark from the output
  /// Only for premium accounts
  remove_watermark: Option<bool>,

  /// Optional visibility setting override.
  creator_set_visibility: Option<Visibility>,
}

#[derive(Serialize, ToSchema)]
pub struct EnqueueLivePortraitWorkflowSuccessResponse {
  pub success: bool,
  pub inference_job_token: InferenceJobToken,
}

#[derive(Debug, ToSchema)]
pub enum EnqueueLivePortraitWorkflowError {
  BadInput(String),
  NotAuthorized,
  ServerError,
  RateLimited,
}

impl ResponseError for EnqueueLivePortraitWorkflowError {
  fn status_code(&self) -> StatusCode {
    match *self {
      EnqueueLivePortraitWorkflowError::BadInput(_) => StatusCode::BAD_REQUEST,
      EnqueueLivePortraitWorkflowError::NotAuthorized => StatusCode::UNAUTHORIZED,
      EnqueueLivePortraitWorkflowError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      EnqueueLivePortraitWorkflowError::RateLimited => StatusCode::TOO_MANY_REQUESTS,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      EnqueueLivePortraitWorkflowError::BadInput(reason) => reason.to_string(),
      EnqueueLivePortraitWorkflowError::NotAuthorized => "unauthorized".to_string(),
      EnqueueLivePortraitWorkflowError::ServerError => "server error".to_string(),
      EnqueueLivePortraitWorkflowError::RateLimited => "rate limited".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl std::fmt::Display for EnqueueLivePortraitWorkflowError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

/// Enqueue live portrait video workflows.
#[utoipa::path(
  post,
  tag = "Workflows",
  path = "/v1/workflows/enqueue_live_portrait",
  responses(
    (status = 200, description = "Success", body = EnqueueLivePortraitWorkflowSuccessResponse),
    (status = 400, description = "Bad input", body = EnqueueLivePortraitWorkflowError),
    (status = 401, description = "Not authorized", body = EnqueueLivePortraitWorkflowError),
    (status = 429, description = "Rate limited", body = EnqueueLivePortraitWorkflowError),
    (status = 500, description = "Server error", body = EnqueueLivePortraitWorkflowError)
  ),
  params(("request" = EnqueueLivePortraitWorkflowRequest, description = "Payload for request"))
)]
pub async fn enqueue_live_portrait_workflow_handler(
  http_request: HttpRequest,
  request: Json<EnqueueLivePortraitWorkflowRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<Json<EnqueueLivePortraitWorkflowSuccessResponse>, EnqueueLivePortraitWorkflowError>
{
  // ==================== DB ==================== //

  let mut mysql_connection = server_state.mysql_pool
      .acquire()
      .await
      .map_err(|err| {
        warn!("MySql pool error: {:?}", err);
        EnqueueLivePortraitWorkflowError::ServerError
      })?;

  // ==================== USER SESSION ==================== //

  let maybe_avt_token = server_state.avt_cookie_manager
      .get_avt_token_from_request(&http_request);

  let user_session = require_user_session_using_connection(
    &http_request,
    &server_state.session_checker,
    &mut mysql_connection)
      .await
      .map_err(|err| match err {
        RequireUserSessionError::ServerError => EnqueueLivePortraitWorkflowError::ServerError,
        RequireUserSessionError::NotAuthorized => EnqueueLivePortraitWorkflowError::NotAuthorized,
      })?;

  // ==================== PAID PLAN + PRIORITY ==================== //

  // TODO: Plan should handle "first anonymous use" and "investor" cases.
  let plan = get_correct_plan_for_session(server_state.server_environment, Some(&user_session));

  // TODO: Separate priority for animation.
  let priority_level = plan.web_vc_base_priority_level();

  let is_staff = user_session.role.can_ban_users;

  // ==================== DEBUG MODE + ROUTING TAG ==================== //

  let is_debug_request = has_debug_header(&http_request);

  let maybe_routing_tag= get_routing_tag_header(&http_request);

  // ==================== RATE LIMIT ==================== //

  if let Err(_err) = server_state.redis_rate_limiters.logged_in.rate_limit_request(&http_request) {
    return Err(EnqueueLivePortraitWorkflowError::RateLimited);
  }

  // ==================== HANDLE IDEMPOTENCY ==================== //

  if let Err(reason) = validate_idempotency_token_format(&request.uuid_idempotency_token) {
    return Err(EnqueueLivePortraitWorkflowError::BadInput(reason));
  }

  insert_idempotency_token(&request.uuid_idempotency_token, &mut *mysql_connection)
      .await
      .map_err(|err| {
        error!("Error inserting idempotency token: {:?}", err);
        EnqueueLivePortraitWorkflowError::BadInput("invalid idempotency token".to_string())
      })?;

  // ==================== LOOK UP MODEL INFO ==================== //

  // TODO(bt): CHECK DATABASE FOR TOKENS!

  let ip_address = get_request_ip(&http_request);

  let set_visibility = request.creator_set_visibility
      .unwrap_or(user_session.preferences.preferred_tts_result_visibility);

  let has_paid_plan = plan.plan_slug() == "fakeyou_contributor" || plan.plan_category() == PlanCategory::Paid;

  let _is_allowed_expensive_generation = is_staff || has_paid_plan;

//  let inference_args = WorkflowArgs {
//    // Main text prompts
//    positive_prompt: coordinated_args.prompt.new_string_trim_or_empty(),
//    negative_prompt: request.negative_prompt.new_string_trim_or_empty(),
//    travel_prompt: coordinated_args.travel_prompt.new_string_trim_or_empty(),
//
//    // Input files
//    maybe_input_file: Some(request.input_file.clone()),
//    maybe_input_depth_file: empty_token_to_null(request.input_depth_file.as_ref()),
//    maybe_input_normal_file: empty_token_to_null(request.input_normal_file.as_ref()),
//    maybe_input_outline_file: empty_token_to_null(request.input_outline_file.as_ref()),
//    global_ip_adapter_token: empty_token_to_null(request.global_ipa_media_token.as_ref()),
//
//    // Other inputs
//    style_name: Some(request.style),
//    creator_visibility: Some(set_visibility),
//    trim_start_milliseconds: Some(trim_start_millis),
//    trim_end_milliseconds: Some(trim_end_millis),
//    strength: maybe_strength,
//    frame_skip: request.frame_skip,
//
//    // Flags
//    disable_lcm: coordinated_args.disable_lcm,
//    use_cinematic: coordinated_args.use_cinematic,
//    use_face_detailer: coordinated_args.use_face_detailer,
//    use_upscaler: coordinated_args.use_upscaler,
//    remove_watermark: coordinated_args.remove_watermark,
//    lipsync_enabled: coordinated_args.use_lipsync,
//    enable_lipsync: coordinated_args.use_lipsync, // TODO(bt): We can stop writing this flag after we re-deploy the job.
//
//    // TODO: Get rid of the temporary flags.
//    rollout_python_workflow_args: None,
//    skip_process_video: get_request_header_optional(&http_request, "SKIP-PROCESS-VIDEO")
//        .map(|value| str_to_bool(&value)),
//    sleep_millis: get_request_header_optional(&http_request, "SLEEP-MILLIS")
//        .and_then(|value| try_str_to_num(&value).ok()),
//
//    // The new, simplified enqueuing doesn't care about the following parameters:
//    maybe_lora_model: None,
//    maybe_json_modifications: None,
//    maybe_workflow_config: None,
//    maybe_output_path: None,
//    maybe_google_drive_link: None,
//    maybe_title: None,
//    maybe_commit_hash:None,
//    maybe_description:None,
//    trim_start_seconds: None,
//    trim_end_seconds: None,
//    target_fps: None,
//  };

  info!("Creating ComfyUI job record...");

  let query_result = insert_generic_inference_job(InsertGenericInferenceArgs {
    uuid_idempotency_token: &request.uuid_idempotency_token,
    job_type: InferenceJobType::LivePortrait,
    inference_category: InferenceCategory::Workflow,
    maybe_model_type: None,
    maybe_model_token: None,
    maybe_input_source_token: None,
    maybe_input_source_token_type: None,
    maybe_download_url: None,
    maybe_cover_image_media_file_token: None,
    maybe_raw_inference_text: None,
    maybe_max_duration_seconds: None,
    maybe_inference_args: Some(GenericInferenceArgs {
      inference_category: Some(InferenceCategoryAbbreviated::Workflow),
      //args: Some(PolymorphicInferenceArgs::Cu(inference_args)), // TODO
      args: None,
    }),
    maybe_creator_user_token: Some(&user_session.user_token_typed),
    maybe_avt_token: maybe_avt_token.as_ref(),
    creator_ip_address: &ip_address,
    creator_set_visibility:  set_visibility,
    priority_level,
    requires_keepalive: plan.workflow_requires_frontend_keepalive(),
    is_debug_request,
    maybe_routing_tag: maybe_routing_tag.as_deref(),
    mysql_pool: &server_state.mysql_pool,
  }).await;

  let job_token = match query_result {
    Ok((job_token, _id)) => job_token,
    Err(err) => {
      warn!("New generic inference job creation DB error: {:?}", err);
      return Err(EnqueueLivePortraitWorkflowError::ServerError);
    }
  };

  Ok(Json(EnqueueLivePortraitWorkflowSuccessResponse {
    success: true,
    inference_job_token: job_token,
  }))
}
