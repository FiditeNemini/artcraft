#![forbid(unused_mut)]

use std::fmt::Debug;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Json;
use log::warn;
use serde::Deserialize;
use serde::Serialize;
use utoipa::ToSchema;

use enums::by_table::generic_inference_jobs::inference_category::InferenceCategory;
use enums::by_table::generic_inference_jobs::inference_job_type::InferenceJobType;
use enums::by_table::generic_inference_jobs::inference_model_type::InferenceModelType;
use enums::common::visibility::Visibility;
use http_server_common::request::get_request_header_optional::get_request_header_optional;
use http_server_common::request::get_request_ip::get_request_ip;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::{
  GenericInferenceArgs,
  InferenceCategoryAbbreviated,
};
use mysql_queries::queries::generic_inference::web::insert_generic_inference_job::{
  insert_generic_inference_job,
  InsertGenericInferenceArgs,
};
use tokens::tokens::generic_inference_jobs::InferenceJobToken;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::users::UserToken;

use crate::configs::plans::get_correct_plan_for_session::get_correct_plan_for_session;
use crate::http_server::endpoints::conversion::enqueue_fbx_to_gltf_handler::EnqueueFbxToGltfRequestError;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;
use crate::util::allowed_studio_access::allowed_studio_access;

/// Debug requests can get routed to special "debug-only" workers, which can
/// be used to trial new code, run debugging, etc.
const DEBUG_HEADER_NAME: &str = "enable-debug-mode";

/// The routing tag header can send workloads to particular k8s hosts.
/// This is useful for catching the live logs or intercepting the job.
const ROUTING_TAG_HEADER_NAME: &str = "routing-tag";

#[derive(Deserialize, ToSchema)]
pub struct EnqueueBvhToWorkflowRequest {
  // Entropy for idempotency
  uuid_idempotency_token: String,
  // The existing FBX media file token
  media_file_token: MediaFileToken,
}

#[derive(Serialize, ToSchema)]
pub struct EnqueueBvhToWorkflowRequestSuccessResponse {
  pub success: bool,
  pub inference_job_token: InferenceJobToken,
}

#[derive(Debug, ToSchema)]
pub enum EnqueueBvhToWorkflowRequestError {
  BadInput(String),
  NotAuthorized,
  ServerError,
  RateLimited,
}

impl ResponseError for EnqueueBvhToWorkflowRequestError {
  fn status_code(&self) -> StatusCode {
    match *self {
      EnqueueBvhToWorkflowRequestError::BadInput(_) => StatusCode::BAD_REQUEST,
      EnqueueBvhToWorkflowRequestError::NotAuthorized => StatusCode::UNAUTHORIZED,
      EnqueueBvhToWorkflowRequestError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      EnqueueBvhToWorkflowRequestError::RateLimited => StatusCode::TOO_MANY_REQUESTS,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      EnqueueBvhToWorkflowRequestError::BadInput(reason) => reason.to_string(),
      EnqueueBvhToWorkflowRequestError::NotAuthorized => "unauthorized".to_string(),
      EnqueueBvhToWorkflowRequestError::ServerError => "server error".to_string(),
      EnqueueBvhToWorkflowRequestError::RateLimited => "rate limited".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

impl std::fmt::Display for EnqueueBvhToWorkflowRequestError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

#[utoipa::path(
  post,
  path = "/v1/conversion/enqueue_fbx_to_gltf",
  responses(
    (
      status = 200,
      description = "Enqueue BVH To Workflow",
      body = EnqueueBvhToWorkflowRequestSuccessResponse,
    ),
    (status = 400, description = "Bad input", body = EnqueueBvhToWorkflowRequestError),
    (status = 401, description = "Not authorized", body = EnqueueBvhToWorkflowRequestError),
    (status = 429, description = "Rate limited", body = EnqueueBvhToWorkflowRequestError),
    (status = 500, description = "Server error", body = EnqueueBvhToWorkflowRequestError)
  ),
  params(("request" = EnqueueBvhToWorkflowRequest, description = "Payload for BVH to Workflow Request"))
)]
pub async fn enqueue_bvh_to_workflow_handler(
    http_request: HttpRequest,
    request: web::Json<EnqueueBvhToWorkflowRequest>,
    server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, EnqueueBvhToWorkflowRequestError> {

    validate_request(&request)?;

    let mut maybe_user_token: Option<UserToken> = None;

    let mut mysql_connection = server_state.mysql_pool.acquire().await.map_err(|err| {
        warn!("MySql pool error: {:?}", err);
        EnqueueBvhToWorkflowRequestError::ServerError
    })?;

    // ==================== USER SESSION ==================== //

    let maybe_user_session = server_state.session_checker
        .maybe_get_user_session_extended_from_connection(&http_request, &mut mysql_connection).await
        .map_err(|e| {
            warn!("Session checker error: {:?}", e);
            EnqueueBvhToWorkflowRequestError::ServerError
        })?;

    if let Some(user_session) = maybe_user_session.as_ref() {
        maybe_user_token = Some(UserToken::new_from_str(&user_session.user_token));
    }

    // ==================== FEATURE FLAG CHECK ==================== //

    if !allowed_studio_access(maybe_user_session.as_ref(), &server_state.flags) {
      warn!("Storyteller Studio access is not permitted for user");
      return Err(EnqueueBvhToWorkflowRequestError::NotAuthorized);
    }

    // ==================== PAID PLAN + PRIORITY ==================== //

    // Plan should handle "first anonymous use" and "investor" cases.
    let plan = get_correct_plan_for_session(
        server_state.server_environment,
        maybe_user_session.as_ref()
    );

    // Separate priority for animation.
    let priority_level = plan.web_vc_base_priority_level();

    // ==================== DEBUG MODE + ROUTING TAG ==================== //

    let is_debug_request = get_request_header_optional(&http_request, DEBUG_HEADER_NAME).is_some();

    let maybe_routing_tag = get_request_header_optional(&http_request, ROUTING_TAG_HEADER_NAME).map(
        |routing_tag| routing_tag.trim().to_string()
    );

    // ==================== BANNED USERS ==================== //

    if let Some(ref user) = maybe_user_session {
        if user.role.is_banned {
            return Err(EnqueueBvhToWorkflowRequestError::NotAuthorized);
        }
    }

    // ==================== RATE LIMIT ==================== //

    let rate_limiter = match maybe_user_session {
        None => &server_state.redis_rate_limiters.logged_out,
        Some(ref _user) => &server_state.redis_rate_limiters.logged_in,
    };

    if let Err(_err) = rate_limiter.rate_limit_request(&http_request) {
        return Err(EnqueueBvhToWorkflowRequestError::RateLimited);
    }

    let ip_address = get_request_ip(&http_request);

    let maybe_avt_token = server_state.avt_cookie_manager
        .get_avt_token_from_request(&http_request);

    if request.media_file_token.as_str().is_empty() {
        return Err(EnqueueBvhToWorkflowRequestError::BadInput("media_file_token is empty".to_string()));
    }

    let query_result = insert_generic_inference_job(InsertGenericInferenceArgs {
        uuid_idempotency_token: &request.uuid_idempotency_token,
        inference_category: InferenceCategory::ConvertBvhToWorkflow,
        maybe_model_type: Some(InferenceModelType::BvhToWorkflow),
        maybe_model_token: None,
        job_type: InferenceJobType::BevyToWorkflow,
        maybe_input_source_token: Some(&request.media_file_token.as_str()),
        maybe_input_source_token_type: None,
        maybe_download_url: None,
        maybe_raw_inference_text: None,
        maybe_max_duration_seconds: None,
        maybe_inference_args: Some(GenericInferenceArgs {
            inference_category: Some(InferenceCategoryAbbreviated::ConvertBvhToWorkflow),
            args: None
        }),
        maybe_creator_user_token: maybe_user_token.as_ref(),
        maybe_avt_token: maybe_avt_token.as_ref(),
        creator_ip_address: &ip_address,
        creator_set_visibility: Visibility::Public,
        priority_level,
        requires_keepalive: true,
        is_debug_request,
        maybe_routing_tag: maybe_routing_tag.as_deref(),
        mysql_pool: &server_state.mysql_pool,
    }).await;

    let job_token = match query_result {
        Ok((job_token, _id)) => job_token,
        Err(err) => {
            warn!("New generic inference job creation DB error: {:?}", err);
            return Err(EnqueueBvhToWorkflowRequestError::ServerError);
        }
    };

    let response: EnqueueBvhToWorkflowRequestSuccessResponse = EnqueueBvhToWorkflowRequestSuccessResponse {
        success: true,
        inference_job_token: job_token,
    };

    let body = serde_json::to_string(&response)
        .map_err(|_e| EnqueueBvhToWorkflowRequestError::ServerError)?;

    Ok(HttpResponse::Ok().content_type("application/json").body(body))
}

fn validate_request(request: &Json<EnqueueBvhToWorkflowRequest>) -> Result<(), EnqueueBvhToWorkflowRequestError> {
  if request.media_file_token.0.trim().is_empty() {
    return Err(EnqueueBvhToWorkflowRequestError::BadInput("token is empty".to_string()));
  }

  if request.uuid_idempotency_token.trim().is_empty() {
    return Err(EnqueueBvhToWorkflowRequestError::BadInput("idempotency token is empty".to_string()));
  }

  Ok(())
}
