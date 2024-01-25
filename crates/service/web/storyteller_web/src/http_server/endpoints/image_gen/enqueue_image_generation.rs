// #![forbid(unused_imports)]
#![forbid(unused_mut)]
// #![forbid(unused_variables)]
use log::info;
use std::fmt::{ Display, Formatter };
use std::fmt::Debug;
use std::sync::Arc;

use actix_web::{ HttpRequest, HttpResponse, web };
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use log::warn;
use serde::Deserialize;
use serde::Serialize;
use utoipa::ToSchema;

use enums::by_table::generic_inference_jobs::inference_category::InferenceCategory;
use enums::by_table::generic_inference_jobs::inference_model_type::InferenceModelType;
use http_server_common::request::get_request_header_optional::get_request_header_optional;
use http_server_common::request::get_request_ip::get_request_ip;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::{
    GenericInferenceArgs,
    InferenceCategoryAbbreviated,
    PolymorphicInferenceArgs,
};
use mysql_queries::payloads::generic_inference_args::image_generation_payload::StableDiffusionArgs;
use mysql_queries::queries::generic_inference::web::insert_generic_inference_job::{
    insert_generic_inference_job,
    InsertGenericInferenceArgs,
};
use tokens::tokens::generic_inference_jobs::InferenceJobToken;
use tokens::tokens::model_weights::ModelWeightToken;
use tokens::tokens::users::UserToken;

use crate::configs::plans::get_correct_plan_for_session::get_correct_plan_for_session;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;

/// Debug requests can get routed to special "debug-only" workers, which can
/// be used to trial new code, run debugging, etc.
const DEBUG_HEADER_NAME: &str = "enable-debug-mode";

/// The routing tag header can send workloads to particular k8s hosts.
/// This is useful for catching the live logs or intercepting the job.
const ROUTING_TAG_HEADER_NAME: &str = "routing-tag";

#[derive(Debug, Deserialize, Clone, Copy, Eq, PartialEq)]
pub enum TypeOfInference {
    #[serde(rename = "lora")]
    Lora,
    #[serde(rename = "model")]
    Model,
    #[serde(rename = "inference")]
    Inference
}
impl Display for TypeOfInference {
    fn fmt(&self, f: &mut Formatter) -> std::fmt::Result {
        match self {
            TypeOfInference::Lora => write!(f, "lora"),
            TypeOfInference::Model => write!(f, "model"),
            TypeOfInference::Inference => write!(f, "inference"),
        }
    }
}

pub fn is_valid_string(input: &str) -> bool {
    let valid_strings = [
        "DPM++ 2M Karras",
        "DPM++ SDE Karras",
        "DPM++ 2M SDE Exponential",
        "DPM++ 2M SDE Karras",
        "Euler a",
        "Euler",
        "LMS",
        "Heun",
        "DPM2",
        "DPM2 a",
        "DPM++ 2S a",
        "DPM++ 2M",
        "DPM++ SDE",
        "DPM++ 2M SDE",
        "DPM++ 2M SDE Heun",
        "DPM++ 2M SDE Heun Karras",
        "DPM++ 2M SDE Heun Exponential",
        "DPM++ 3M SDE",
        "DPM++ 3M SDE Karras",
        "DPM++ 3M SDE Exponential",
        "DPM fast",
        "DPM adaptive",
        "LMS Karras",
        "DPM2 Karras",
        "DPM2 a Karras",
        "DPM++ 2S a Karras",
    ];
    valid_strings.contains(&input)
}

#[derive(Deserialize, ToSchema)]
pub struct EnqueueImageGenRequest {
    uuid_idempotency_token: String,
    maybe_image_source: Option<String>,
    maybe_sd_model_token: Option<String>,
    maybe_lora_model_token: Option<String>,
    maybe_prompt: Option<String>,
    maybe_n_prompt: Option<String>,
    maybe_seed: Option<i64>,
    maybe_width: Option<u32>,
    maybe_height: Option<u32>,
    maybe_sampler: Option<String>,
    maybe_upload_path: Option<String>,
    maybe_lora_upload_path: Option<String>,
    maybe_cfg_scale: Option<u32>,
    maybe_number_of_samples: Option<u32>,
    maybe_batch_count: Option<u32>,
    maybe_name: Option<String>,
    maybe_description: Option<String>,
    maybe_version: Option<u32>
}

#[derive(Serialize, ToSchema)]
pub struct EnqueueImageGenRequestSuccessResponse {
    pub success: bool,
    pub inference_job_token: InferenceJobToken,
}

#[derive(Debug, ToSchema)]
pub enum EnqueueImageGenRequestError {
    BadInput(String),
    NotAuthorized,
    ServerError,
    RateLimited,
}

impl ResponseError for EnqueueImageGenRequestError {
    fn status_code(&self) -> StatusCode {
        match *self {
            EnqueueImageGenRequestError::BadInput(_) => StatusCode::BAD_REQUEST,
            EnqueueImageGenRequestError::NotAuthorized => StatusCode::UNAUTHORIZED,
            EnqueueImageGenRequestError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
            EnqueueImageGenRequestError::RateLimited => StatusCode::TOO_MANY_REQUESTS,
        }
    }

    fn error_response(&self) -> HttpResponse {
        let error_reason = match self {
            EnqueueImageGenRequestError::BadInput(reason) => reason.to_string(),
            EnqueueImageGenRequestError::NotAuthorized => "unauthorized".to_string(),
            EnqueueImageGenRequestError::ServerError => "server error".to_string(),
            EnqueueImageGenRequestError::RateLimited => "rate limited".to_string(),
        };

        to_simple_json_error(&error_reason, self.status_code())
    }
}

impl std::fmt::Display for EnqueueImageGenRequestError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

// Implementation for enqueuing a TTS request
// Reference enqueue_infer_tts_handler.rs for checks: rate limiting / user sessions
// insert generic inference job.rs
// Need to convert it to generic inference job.
#[utoipa::path(
    post,
    path = "/inference/enqueue_image_gen/",
    responses(
        (
            status = 200,
            description = "Enqueue TTS generically",
            body = EnqueueImageGenRequestSuccessResponse,
        ),
        (status = 400, description = "Bad input", body = EnqueueImageGenRequestError),
        (status = 401, description = "Not authorized", body = EnqueueImageGenRequestError),
        (status = 429, description = "Rate limited", body = EnqueueImageGenRequestError),
        (status = 500, description = "Server error", body = EnqueueImageGenRequestError)
    ),
    params(("request" = EnqueueImageGenRequest, description = "Payload for TTS Request"))
)]
pub async fn enqueue_image_generation_request(
    http_request: HttpRequest,
    request: web::Json<EnqueueImageGenRequest>,
    server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, EnqueueImageGenRequestError> {

    // TODO:I know ill fix this later
    let path = http_request.path();
    let segments: Vec<&str> = path.split('/').collect();
    let last_segment = segments.last().unwrap_or(&"");
    
    println!("Last segment: {}", last_segment);

    // use segment to determine what to do.
    let mode; 
    if last_segment.to_string() == "lora" {
        mode = "lora";
    } else if last_segment.to_string()  == "model" {
        mode = "model";
    } else {
        mode = "inference";
    }

    // check and ensure we also pass description and the name
    if mode == "lora" || mode == "model" {
        match request.maybe_name {
            Some(_) => {},
            None => return Err(EnqueueImageGenRequestError::BadInput("Missing Model / Lora Name".to_string()))
        }

        match request.maybe_description {
            Some(_) => {}
            None => return Err(EnqueueImageGenRequestError::BadInput("Missing Model / Lora Description".to_string()))
        }
    } else {
        match request.maybe_sd_model_token {
            Some(_) => {}
            None => return Err(EnqueueImageGenRequestError::BadInput("Missing Model Token".to_string()))
        }
    }

    if mode == "lora" {
        match request.maybe_lora_upload_path {
            Some(_) => {}
            None => return Err(EnqueueImageGenRequestError::BadInput("Missing Lora Upload Path".to_string()))
        }
    }

    if mode == "model" {
        match request.maybe_sd_model_token {
            Some(_) => {}
            None => return Err(EnqueueImageGenRequestError::BadInput("Missing Model Upload Path".to_string()))
        }
    }

    // TODO: Brandon need to figure out premium vs not premium

    let mut maybe_user_token: Option<UserToken> = None;
    let visbility = enums::common::visibility::Visibility::Public;

    let mut mysql_connection = server_state.mysql_pool.acquire().await.map_err(|err| {
        warn!("MySql pool error: {:?}", err);
        EnqueueImageGenRequestError::ServerError
    })?;

    // ==================== USER SESSION ==================== //

    let maybe_user_session = server_state.session_checker
        .maybe_get_user_session_extended_from_connection(&http_request, &mut mysql_connection).await
        .map_err(|e| {
            warn!("Session checker error: {:?}", e);
            EnqueueImageGenRequestError::ServerError
        })?;
    

    if let Some(user_session) = maybe_user_session.as_ref() {

        maybe_user_token = Some(UserToken::new_from_str(&user_session.user_token));
        match maybe_user_token {
            Some(ref val) => {    
                println!("User Token: {}",val.clone().to_string());
            },
            None => {
                println!("User Token check? Failed to find!");
            }
        }
    } else {
        println!("Session isn't there");
    }

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
            return Err(EnqueueImageGenRequestError::NotAuthorized);
        }
    }

    // DETECT premium user and queue

    // ==================== RATE LIMIT ==================== //

    let rate_limiter = match maybe_user_session {
        None => &server_state.redis_rate_limiters.logged_out,
        Some(ref _user) => &server_state.redis_rate_limiters.logged_in,
    };

    if let Err(_err) = rate_limiter.rate_limit_request(&http_request) {
        return Err(EnqueueImageGenRequestError::RateLimited);
    }

    // Get up IP address
    let ip_address = get_request_ip(&http_request);

    // Check the inference args to make sure everything is all there for upload loRA / model or standard inference

    // ==================== INFERENCE ARGS ==================== //

    let width = request.maybe_width.unwrap_or(512);
    let height = request.maybe_height.unwrap_or(512);

    let width = match width {
        0..=512 => 512,
        513..=768 => 768,
        769..=1024 => 1024,
        _ => 1024,
    };

    let height = match height {
        0..=512 => 512,
        513..=768 => 768,
        769..=1024 => 1024,
        _ => 1024,
    };

    let cfg_scale = match request.maybe_cfg_scale {
        Some(val) => if val > 32 { 32 } else { val }
        None => 7,
    };

    let number_of_samples = match request.maybe_number_of_samples {
        Some(val) => if val < 0 { 20 } else if val > 128 { 128 } else { val }
        None => 20,
    };

    let batch_count = match request.maybe_batch_count {
        Some(val) => if val > 4 { 4 } else { val }
        None => 1,
    };

    let sampler = match request.maybe_sampler.clone() {
        Some(val) => if is_valid_string(&val) { val.clone() } else { String::from("Euler a") }
        None => String::from("Euler a"),
    };

    let sd_weight_token = ModelWeightToken(
        request.maybe_sd_model_token.clone().unwrap_or_default()
    );
    let lora_token = ModelWeightToken(request.maybe_lora_model_token.clone().unwrap_or_default());

    let n_prompt = request.maybe_n_prompt.clone().unwrap_or_default();
    // we can only do 1 upload type at a time.
    // if we are uploading a model.
    let upload_path = request.maybe_upload_path.clone().unwrap_or_default();
    // if we are uploading a lora model.
    let lora_upload_path = request.maybe_lora_upload_path.clone().unwrap_or_default();

    let mut seed = -1;

    if let Some(s) = request.maybe_seed {
        seed = s;
    }

    let mut version:u32 = 0;
    let type_of_inference = mode.to_string().clone();
    let description = request.maybe_description.clone();
    let name = request.maybe_name.clone();

    if let Some(s) = request.maybe_version {
        version = s;
    }

    let inference_args = StableDiffusionArgs {
        maybe_sd_model_token: Some(sd_weight_token),
        maybe_lora_model_token: Some(lora_token),
        maybe_prompt: Some(request.maybe_prompt.clone().unwrap_or_default()),
        maybe_n_prompt: Some(n_prompt),
        maybe_seed: Some(seed),
        maybe_upload_path: Some(upload_path),
        maybe_lora_upload_path: Some(lora_upload_path),
        type_of_inference,
        maybe_cfg_scale: Some(cfg_scale),
        maybe_number_of_samples: Some(number_of_samples),
        maybe_batch_count: Some(batch_count),
        maybe_width: Some(width),
        maybe_height: Some(height),
        maybe_sampler: Some(sampler),
        maybe_description: description,
        maybe_name: name,
        maybe_version: version,
    };

    // create the inference args here
    let maybe_avt_token = server_state.avt_cookie_manager.get_avt_token_from_request(&http_request);

    // create the job record here!
    let query_result = insert_generic_inference_job(InsertGenericInferenceArgs {
        uuid_idempotency_token: &request.uuid_idempotency_token,
        inference_category: InferenceCategory::ImageGeneration,
        maybe_model_type: Some(InferenceModelType::StableDiffusion), // NB: Model is static during inference
        maybe_model_token: None, // NB: Model is static during inference
        maybe_input_source_token: None,
        maybe_input_source_token_type: None,
        maybe_raw_inference_text: None,
        maybe_max_duration_seconds: None,
        maybe_inference_args: Some(GenericInferenceArgs {
            inference_category: Some(InferenceCategoryAbbreviated::ImageGeneration),
            args: Some(PolymorphicInferenceArgs::Ig(inference_args)),
        }),
        maybe_creator_user_token: maybe_user_token.as_ref(),
        maybe_avt_token: maybe_avt_token.as_ref(),
        creator_ip_address: &ip_address,
        creator_set_visibility: visbility,
        priority_level,
        requires_keepalive: false, //reverse ...  TODO fix this. we set it base on account is premium or not ... 
        is_debug_request,
        maybe_routing_tag: maybe_routing_tag.as_deref(),
        mysql_pool: &server_state.mysql_pool,
    }).await;

    let job_token = match query_result {
        Ok((job_token, _id)) => job_token,
        Err(err) => {
            warn!("New generic inference job creation DB error: {:?}", err);
            return Err(EnqueueImageGenRequestError::ServerError);
        }
    };

    let response: EnqueueImageGenRequestSuccessResponse = EnqueueImageGenRequestSuccessResponse {
        success: true,
        inference_job_token: job_token,
    };

    let body = serde_json
        ::to_string(&response)
        .map_err(|_e| EnqueueImageGenRequestError::ServerError)?;

    // Error handling 101 rust result type returned like so.
    Ok(HttpResponse::Ok().content_type("application/json").body(body))
}

// with LoRA
// http://127.0.0.1:12345/v1/image_gen/inference/enqueue_image_gen
// {
//     "uuid_idempotency_token": "12",
//     "maybe_sd_model_token": "weight_dmmthavhawqc2hj7yqyemcbf8",
//     "maybe_lora_model_token": "weight_t7gz78fjg27m0wtw6r33gafxs",
//     "maybe_prompt": "raiden mei a very well drawn, anime girl, with pink and purple hair sitting down on a chair relaxed, highest quality, semi nude, masterpiece, painted",
//     "maybe_a_prompt": "a anime girl, with pink and purple hair sitting down on a chair relaxed.",
//     "maybe_n_prompt": "nsfw, black and white, low quality, pixelated",
//     "maybe_seed": -1,
//     "maybe_width": 1024,
//     "maybe_height": 1024,
//     "maybe_sampler": "DPM++ 2M SDE Heun",
//     "maybe_cfg_scale": 7,
//     "maybe_number_of_samples": 64,
//     "maybe_batch_count": 4,
//   }

// without LoRA
// {
//     "uuid_idempotency_token": "132141",
//     "maybe_sd_model_token": "weight_dmmthavhawqc2hj7yqyemcbf8",
//     "maybe_prompt": "raiden mei a very well drawn, anime girl, with pink and purple hair sitting down on a chair relaxed, highest quality, semi nude, masterpiece, painted",
//     "maybe_a_prompt": "a anime girl, with pink and purple hair sitting down on a chair relaxed.",
//     "maybe_n_prompt": "nsfw, black and white, low quality, pixelated",
//     "maybe_seed": -1,
//     "maybe_width": 512,
//     "maybe_height": 512,
//     "maybe_sampler": "DPM++ 2M SDE Heun",
//     "maybe_cfg_scale": 8,
//     "maybe_number_of_samples": 64,
//     "maybe_batch_count": 4
// }

// http://127.0.0.1:12345/v1/image_gen/upload/lora
// {
//     "uuid_idempotency_token": "12",
//     "maybe_lora_upload_path": "https://drive.google.com/file/d/1WRgR2pn0Ky8ls5_9Zq6tQlHTBvyWeach/view?usp=sharing",
//     "maybe_name":"some_name",
//     "maybe_description":"some_description"
// }

// http://127.0.0.1:12345/v1/image_gen/upload/model
// {
//     "uuid_idempotency_token": "13",
//     "maybe_upload_path": "https://drive.google.com/file/d/1WRgR2pn0Ky8ls5_9Zq6tQlHTBvyWeach/view?usp=sharing",
//     "maybe_name":"some_name",
//     "maybe_description":"some_description"
// }

// {
//     "uuid_idempotency_token": "123",
//     "maybe_lora_upload_path": "https://drive.google.com/file/d/1WRgR2pn0Ky8ls5_9Zq6tQlHTBvyWeach/view?usp=sharing",
//     "maybe_name":"some_name",
//     "maybe_description":"some_description"
// }