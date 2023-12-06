
use crate::http_server::endpoints::voice_designer::inference::enqueue_tts_request::*;
use crate::http_server::endpoints::weights::list_availible_weights::*;

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
    crate::http_server::endpoints::weights::list_availible_weights::list_availible_weights_handler
    ),components(schemas(EnqueueTTSRequest,EnqueueTTSRequestSuccessResponse,EnqueueTTSRequestError,InferenceJobToken,
                        
                        ModelWeightToken,UserToken,Visibility,
                        ListWeightError,ListWeightsByPathInfo,ModelWeightForList,ListWeightError,WeightsCategory,WeightsType,
                        ListAvailibleWeightsQuery,ListAvailibleWeightsSuccessResponse,ListWeightsByPathInfo,ModelWeightForList)))]
pub struct ApiDoc;

