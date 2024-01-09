use utoipa::OpenApi;

use enums::by_table::media_files::media_file_origin_category::MediaFileOriginCategory;
use enums::by_table::media_files::media_file_origin_model_type::MediaFileOriginModelType;
use enums::by_table::media_files::media_file_origin_product_category::MediaFileOriginProductCategory;
use enums::by_table::media_files::media_file_type::MediaFileType;
use enums::by_table::model_weights::{weights_category::WeightsCategory, weights_types::WeightsType};
use enums::by_table::user_bookmarks::user_bookmark_entity_type::UserBookmarkEntityType;
use enums::by_table::user_ratings::entity_type::UserRatingEntityType;
use enums::by_table::user_ratings::rating_value::UserRatingValue;
use enums::common::visibility::Visibility;
use tokens::tokens::generic_inference_jobs::*;
use tokens::tokens::media_files::*;
use tokens::tokens::model_weights::*;
use tokens::tokens::user_bookmarks::*;
use tokens::tokens::users::*;

use crate::http_server::common_responses::media_file_social_meta_lite::MediaFileSocialMetaLight;
use crate::http_server::common_responses::pagination_cursors::PaginationCursors;
use crate::http_server::common_responses::pagination_page::PaginationPage;
use crate::http_server::common_responses::user_details_lite::{DefaultAvatarInfo, UserDetailsLight};
use crate::http_server::endpoints::media_files::get_media_file::*;
use crate::http_server::endpoints::media_files::list_featured_media_files::*;
use crate::http_server::endpoints::media_files::list_media_files::*;
use crate::http_server::endpoints::media_files::list_media_files_for_user::*;
use crate::http_server::endpoints::media_files::upload::upload_error::MediaFileUploadError;
use crate::http_server::endpoints::media_files::upload_media_file::*;
use crate::http_server::endpoints::user_bookmarks::batch_get_user_bookmarks_handler::*;
use crate::http_server::endpoints::user_bookmarks::create_user_bookmark_handler::*;
use crate::http_server::endpoints::user_bookmarks::delete_user_bookmark_handler::*;
use crate::http_server::endpoints::user_bookmarks::list_user_bookmarks_for_entity_handler::*;
use crate::http_server::endpoints::user_bookmarks::list_user_bookmarks_for_user_handler::*;
use crate::http_server::endpoints::user_ratings::batch_get_user_rating_handler::*;
use crate::http_server::endpoints::user_ratings::get_user_rating_handler::*;
use crate::http_server::endpoints::user_ratings::set_user_rating_handler::*;
use crate::http_server::endpoints::voice_designer::inference::enqueue_tts_request::*;
use crate::http_server::endpoints::weights::delete_weight::*;
use crate::http_server::endpoints::weights::get_weight::*;
use crate::http_server::endpoints::weights::list_available_weights::*;
use crate::http_server::endpoints::weights::list_weights_by_user::*;
use crate::http_server::endpoints::weights::set_model_weight_cover_image::*;
use crate::http_server::endpoints::weights::update_weight::*;
use crate::http_server::web_utils::response_success_helpers::*;

#[derive(OpenApi)]
#[openapi(
  paths(
    crate::http_server::endpoints::media_files::get_media_file::get_media_file_handler,
    crate::http_server::endpoints::media_files::list_featured_media_files::list_featured_media_files_handler,
    crate::http_server::endpoints::media_files::list_media_files::list_media_files_handler,
    crate::http_server::endpoints::media_files::list_media_files_for_user::list_media_files_for_user_handler,
    crate::http_server::endpoints::media_files::upload_media_file::upload_media_file_handler,
    crate::http_server::endpoints::user_bookmarks::batch_get_user_bookmarks_handler::batch_get_user_bookmarks_handler,
    crate::http_server::endpoints::user_bookmarks::create_user_bookmark_handler::create_user_bookmark_handler,
    crate::http_server::endpoints::user_bookmarks::delete_user_bookmark_handler::delete_user_bookmark_handler,
    crate::http_server::endpoints::user_bookmarks::list_user_bookmarks_for_entity_handler::list_user_bookmarks_for_entity_handler,
    crate::http_server::endpoints::user_bookmarks::list_user_bookmarks_for_user_handler::list_user_bookmarks_for_user_handler,
    crate::http_server::endpoints::user_ratings::batch_get_user_rating_handler::batch_get_user_rating_handler,
    crate::http_server::endpoints::user_ratings::get_user_rating_handler::get_user_rating_handler,
    crate::http_server::endpoints::user_ratings::set_user_rating_handler::set_user_rating_handler,
    crate::http_server::endpoints::voice_designer::inference::enqueue_tts_request::enqueue_tts_request,
    crate::http_server::endpoints::weights::delete_weight::delete_weight_handler,
    crate::http_server::endpoints::weights::get_weight::get_weight_handler,
    crate::http_server::endpoints::weights::list_available_weights::list_available_weights_handler,
    crate::http_server::endpoints::weights::list_weights_by_user::list_weights_by_user_handler,
    crate::http_server::endpoints::weights::set_model_weight_cover_image::set_model_weight_cover_image_handler,
    crate::http_server::endpoints::weights::update_weight::update_weight_handler,
  ),
  components(schemas(
    // Tokens
    InferenceJobToken,
    MediaFileToken,
    ModelWeightToken,
    UserBookmarkToken,
    UserToken,

    // Enums
    MediaFileOriginCategory,
    MediaFileOriginModelType,
    MediaFileOriginProductCategory,
    MediaFileType,
    WeightsCategory,
    WeightsType,

    // Common response structs
    DefaultAvatarInfo,
    MediaFileSocialMetaLight,
    PaginationCursors,
    PaginationPage,
    SimpleGenericJsonSuccess,
    UserDetailsLight,
    Visibility,

    // Inference
    EnqueueTTSRequest,EnqueueTTSRequestSuccessResponse,EnqueueTTSRequestError,
    // Media Files
    GetMediaFilePathInfo,GetMediaFileError,GetMediaFileSuccessResponse,GetMediaFileModelInfo,MediaFileInfo,
    // Model Weights
    GetWeightPathInfo,GetWeightResponse,GetWeightError,
    UpdateWeightRequest,UpdateWeightRequest,UpdateWeightPathInfo,UpdateWeightRequest,UpdateWeightError,
    SetModelWeightCoverImageRequest,SetModelWeightCoverImageResponse,SetModelWeightCoverImagePathInfo,SetModelWeightCoverImageError,
    DeleteWeightPathInfo,DeleteWeightRequest,DeleteWeightError,DeleteWeightRequest,DeleteWeightError,
    UploadMediaSuccessResponse,MediaFileUploadError,
    ListWeightError,ModelWeightForList,ListWeightError,
    ListAvailableWeightsQuery,ListAvailableWeightsSuccessResponse,ModelWeightForList,
    ListWeightsByUserError,ListWeightsByUserSuccessResponse,ListWeightsByUserPathInfo,Weight,
    WeightsData,MediaFileData,
    BookmarkListStats,
    BatchGetUserRatingQueryParams,BatchGetUserRatingResponse,BatchGetUserRatingError,RatingRow,
    BatchGetUserBookmarksQueryParams,BatchGetUserBookmarksResponse,BatchGetUserBookmarksError,BookmarkRow,
    ListFeaturedMediaFilesSuccessResponse,MediaFile, ListFeaturedMediaFilesError,
    ListMediaFilesSuccessResponse, ListMediaFilesError, MediaFileListItem, ListMediaFilesQueryParams,
    ListMediaFilesForUserSuccessResponse,ListMediaFilesForUserQueryParams,ListMediaFilesForUserError,ListMediaFilesForUserPathInfo,
    MediaFileForUserListItem, MediaFileForUserListItem,
    UserBookmarkDetailsForUserList,UserBookmarkEntityType,
    CreateUserBookmarkRequest,CreateUserBookmarkError,CreateUserBookmarkSuccessResponse,
    DeleteUserBookmarkPathInfo,DeleteUserBookmarkError,DeleteUserBookmarkRequest,
    ListUserBookmarksPathInfo,ListUserBookmarksForUserError,ListUserBookmarksForUserSuccessResponse,UserBookmarkListItem,
    ListUserBookmarksForEntityPathInfo,ListUserBookmarksForEntityError,ListUserBookmarksForEntitySuccessResponse,UserBookmarkForEntityListItem,
    GetUserRatingError,GetUserRatingResponse,UserRatingValue,UserRatingEntityType,
    SetUserRatingError,SetUserRatingRequest,SetUserRatingResponse,
  ))
)]
pub struct ApiDoc;
