
use crate::http_server::endpoints::voice_designer::inference::enqueue_tts_request::EnqueueTTSRequest;
use crate::http_server::endpoints::voice_designer::inference::enqueue_tts_request::EnqueueTTSRequestSuccessResponse;
use crate::http_server::endpoints::voice_designer::inference::enqueue_tts_request::EnqueueTTSRequestError;
use tokens::tokens::generic_inference_jobs::InferenceJobToken;

use utoipa::OpenApi;
#[derive(OpenApi)]
#[openapi(paths(crate::http_server::endpoints::voice_designer::inference::enqueue_tts_request::enqueue_tts_request),
 components(schemas(EnqueueTTSRequest,EnqueueTTSRequestSuccessResponse,EnqueueTTSRequestError,InferenceJobToken)))]
pub struct ApiDoc;
