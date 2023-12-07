
use crate::http_server::endpoints::voice_designer::inference::enqueue_tts_request::*;

use crate::http_server::endpoints::weights::list_available_weights::*;
use crate::http_server::web_utils::response_success_helpers::*;
use crate::http_server::endpoints::weights::delete_weight::*;
use crate::http_server::endpoints::weights::get_weight::*;
use crate::http_server::endpoints::weights::update_weight::*;
use enums::by_table::model_weights::{
    weights_types::WeightsType,
    weights_category::WeightsCategory,
};

use tokens::tokens::generic_inference_jobs::*;
use tokens::tokens::model_weights::*;
use tokens::tokens::users::*;
use enums::common::visibility::Visibility;
use chrono::{DateTime, Utc};
use utoipa::OpenApi;


#[derive(OpenApi)]
#[openapi(paths(crate::http_server::endpoints::voice_designer::inference::enqueue_tts_request::enqueue_tts_request,
    crate::http_server::endpoints::weights::list_available_weights::list_available_weights_handler,
    crate::http_server::endpoints::weights::delete_weight::delete_weight_handler,
    crate::http_server::endpoints::weights::update_weight::update_weight_handler,
    crate::http_server::endpoints::weights::get_weight::get_weight_handler,
    crate::http_server::endpoints::weights::list_weights_by_user::list_weights_by_user_handler
    ),components(schemas(
    // Tokens
    UserToken,Visibility,
    // 
    SimpleGenericJsonSuccess,
    // Inference
    EnqueueTTSRequest,EnqueueTTSRequestSuccessResponse,EnqueueTTSRequestError,InferenceJobToken,
    //Model Weights                   
    ModelWeightToken,WeightsCategory,WeightsType,
    GetWeightPathInfo,GetWeightResponse,GetWeightError,
    UpdateWeightRequest,UpdateWeightRequest,UpdateWeightPathInfo,UpdateWeightRequest,UpdateWeightError,
    DeleteWeightPathInfo,DeleteWeightRequest,DeleteWeightError,DeleteWeightRequest,DeleteWeightError,
    ListWeightError,ModelWeightForList,ListWeightError, 
    ListAvailableWeightsQuery,ListAvailableWeightsSuccessResponse,ModelWeightForList,
    ListWeightsByUserError,ListWeightsByUserSuccessResponse,ListWeightsByUserPathInfo,Weight
    )))]
pub struct ApiDoc;

