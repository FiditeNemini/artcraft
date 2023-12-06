
use crate::http_server::endpoints::*;
use tokens::tokens::*;

use utoipa::OpenApi;
#[derive(OpenApi)]
#[openapi(paths(crate::http_server::endpoints::voice_designer::inference::enqueue_tts_request::enqueue_tts_request),
 components(schemas(EnqueueTTSRequest,EnqueueTTSRequestSuccessResponse,EnqueueTTSRequestError,InferenceJobToken)))]

 #[openapi(paths(crate::http_server::endpoints::weights::list_availible_weights::list_availible_weights),
 components(schemas(ListAvailibleWeightsQuery,ListAvailibleWeightsSuccessResponse,ListWeightsByPathInfo,ModelWeightForList)))]
pub struct ApiDoc;
