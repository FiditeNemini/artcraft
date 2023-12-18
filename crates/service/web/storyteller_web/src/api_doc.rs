use crate::http_server::endpoints::voice_designer::inference::enqueue_tts_request::*;

use crate::http_server::endpoints::weights::list_available_weights::*;
use crate::http_server::web_utils::response_success_helpers::*;
use crate::http_server::endpoints::weights::delete_weight::*;
use crate::http_server::endpoints::weights::get_weight::*;
use crate::http_server::endpoints::weights::update_weight::*;
use crate::http_server::endpoints::weights::list_weights_by_user::*;
use crate::http_server::common_responses::user_details_lite::{DefaultAvatarInfo, UserDetailsLight};
use crate::http_server::common_responses::media_file_social_meta_lite::MediaFileSocialMetaLight;
use crate::http_server::common_responses::pagination_cursors::PaginationCursors;
use crate::http_server::common_responses::pagination_page::PaginationPage;
use crate::http_server::endpoints::media_files::list_featured_media_files::*;
use crate::http_server::endpoints::media_files::list_media_files::*;
use crate::http_server::endpoints::media_files::list_media_files_for_user::*;
use enums::by_table::model_weights::{weights_types::WeightsType, weights_category::WeightsCategory};
use enums::by_table::media_files::media_file_type::MediaFileType;
use enums::by_table::media_files::media_file_origin_category::MediaFileOriginCategory;
use enums::by_table::media_files::media_file_origin_model_type::MediaFileOriginModelType;
use enums::by_table::media_files::media_file_origin_product_category::MediaFileOriginProductCategory;

use tokens::tokens::generic_inference_jobs::*;
use tokens::tokens::model_weights::*;
use tokens::tokens::users::*;
use tokens::tokens::media_files::*;
use enums::common::visibility::Visibility;
use chrono::{DateTime, Utc};
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(paths(crate::http_server::endpoints::voice_designer::inference::enqueue_tts_request::enqueue_tts_request,
    crate::http_server::endpoints::weights::list_available_weights::list_available_weights_handler,
    crate::http_server::endpoints::weights::delete_weight::delete_weight_handler,
    crate::http_server::endpoints::weights::update_weight::update_weight_handler,
    crate::http_server::endpoints::weights::get_weight::get_weight_handler,
    crate::http_server::endpoints::weights::list_weights_by_user::list_weights_by_user_handler,
    crate::http_server::endpoints::media_files::list_featured_media_files::list_featured_media_files_handler,
    crate::http_server::endpoints::media_files::list_media_files::list_media_files_handler,
    crate::http_server::endpoints::media_files::list_media_files_for_user::list_media_files_for_user_handler
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
    ListWeightsByUserError,ListWeightsByUserSuccessResponse,ListWeightsByUserPathInfo,Weight,
    UserDetailsLight,DefaultAvatarInfo,
    PaginationCursors,
    PaginationPage,
    MediaFileOriginModelType,MediaFileOriginProductCategory,MediaFileOriginCategory,
    ListFeaturedMediaFilesSuccessResponse,MediaFile,MediaFileToken,MediaFileType, ListFeaturedMediaFilesError,
    ListMediaFilesSuccessResponse, ListMediaFilesError, MediaFileListItem, ListMediaFilesQueryParams,
    MediaFileSocialMetaLight,
    ListMediaFilesForUserSuccessResponse,ListMediaFilesForUserQueryParams,ListMediaFilesForUserError,ListMediaFilesForUserPathInfo,
    MediaFileForUserListItem, MediaFileForUserListItem
    )))]
pub struct ApiDoc;
