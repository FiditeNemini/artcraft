use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use chrono::{DateTime, Utc};
use log::{info, warn};
use rand::Rng;
use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;

use enums::by_table::model_weights::{
    weights_category::WeightsCategory,
    weights_types::WeightsType,
};
use enums::common::visibility::Visibility;
use mysql_queries::queries::model_weights::list::list_weights_query_builder::ListWeightsQueryBuilder;
use tokens::tokens::model_weights::ModelWeightToken;
use tokens::tokens::users::UserToken;
use crate::http_server::common_responses::user_details_lite::UserDetailsLight;

use crate::server_state::ServerState;



use utoipa::ToSchema;
use crate::http_server::common_responses::pagination_cursors::PaginationCursors;


#[derive(Deserialize,ToSchema)]
pub struct ListAvailableWeightsQuery {
    pub sort_ascending: Option<bool>,
    pub per_page: Option<u16>,
    pub username: Option<String>,
    pub weights_type: Option<String>,
    pub weights_category: Option<String>,
    pub cursor_is_reversed: Option<bool>,
    pub cursor: Option<String>,
}

#[derive(Serialize,ToSchema)]
pub struct ListAvailableWeightsSuccessResponse {
    pub success: bool,
    pub results: Vec<ModelWeightForList>,
    pub pagination: PaginationCursors,
}

#[derive(Serialize,ToSchema)]
pub struct ModelWeightForList {
    pub weight_token: ModelWeightToken,

    pub weights_type: WeightsType,
    pub weights_category: WeightsCategory,

    pub title: String,

    pub description_markdown: String,
    pub description_rendered_html: String,

    /// Cover images are small descriptive images that can be set for any model.
    /// If a cover image is set, this is the path to the asset.
    pub maybe_cover_image_public_bucket_path: Option<String>,

    pub creator: UserDetailsLight,
    pub creator_set_visibility: Visibility,

    pub file_size_bytes: i32,
    pub file_checksum_sha2: String,

    pub cached_user_ratings_total_count: u32,
    pub cached_user_ratings_positive_count: u32,
    pub cached_user_ratings_negative_count: u32,
    pub maybe_cached_user_ratings_ratio: Option<f32>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,

    pub creator_username: String,
    pub creator_display_name: String,
    pub creator_email_gravatar_hash: String,

    // additional fields to be added when tables are around
    pub likes: u32,
    pub bookmarks: bool,

}

#[derive(Debug,ToSchema)]
pub enum ListWeightError {
    NotAuthorized,
    ServerError,
}

impl std::fmt::Display for ListWeightError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl ResponseError for ListWeightError {
    fn status_code(&self) -> StatusCode {
        match *self {
            ListWeightError::NotAuthorized => StatusCode::UNAUTHORIZED,
            ListWeightError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

#[utoipa::path(
    get,
    path = "/v1/weights/list",
    responses(
        (status = 200, description = "List Weights", body = ListAvailableWeightsSuccessResponse),
        (status = 401, description = "Not authorized", body = ListWeightError),
        (status = 500, description = "Server error", body = ListWeightError),
    ),
    params(
        ("request" = ListAvailableWeightsQuery, description = "Payload for Request"),
    )
)]
pub async fn list_available_weights_handler(
    http_request: HttpRequest,
    query: web::Query<ListAvailableWeightsQuery>,
    server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, impl ResponseError> {
    let maybe_user_session = server_state.session_checker
        .maybe_get_user_session(&http_request, &server_state.mysql_pool).await
        .map_err(|e| {
            warn!("Session checker error: {:?}", e);
            ListWeightError::ServerError
        })?;

    let mut is_mod = false;
    let user_session = match maybe_user_session {
        Some(session) => {
            is_mod = session.can_ban_users;
            session
        }
        None => {
            info!("not logged in");
            return Err(ListWeightError::NotAuthorized);
        }
    };

    let limit = query.per_page.unwrap_or(25);

    let sort_ascending = query.sort_ascending.unwrap_or(false);
    let cursor_is_reversed = query.cursor_is_reversed.unwrap_or(false);

    let cursor = if let Some(cursor) = query.cursor.as_deref() {
        let cursor = server_state.sort_key_crypto.decrypt_id(cursor)
            .map_err(|e| {
                warn!("crypto error: {:?}", e);
                ListWeightError::ServerError
            })?;
        Some(cursor)
    } else {
        None
    };

    let include_user_hidden = is_mod;

    let mut weights_category: Option<WeightsCategory> = None;
    let mut weights_type: Option<WeightsType> = None;

    if let Some(weights_category_string) = query.weights_category.as_ref() {
        let result = WeightsCategory::from_str(&weights_category_string);
        match result {
            Ok(category) => { 
                weights_category = Some(category) 
            },
            Err(e) => {
                warn!("invalid weights_category: {:?}", e);
                weights_category = None
            }
        }
    }

    if let Some(weights_type_string) = query.weights_type.as_ref() {
        let result = WeightsType::from_str(&weights_type_string);
        match result {
            Ok(wtype) => { 
                weights_type = Some(wtype) 
            },
            Err(e) => {
                warn!("invalid weights_type: {:?}", e);
                weights_type = None
            }
        }
    }

    let mut query_builder = ListWeightsQueryBuilder::new()
        .sort_ascending(sort_ascending)
        .cursor_is_reversed(cursor_is_reversed)
        .weights_category(weights_category)
        .weights_type(weights_type)
        .scope_creator_username(None)
        .include_user_hidden(include_user_hidden)
        .include_user_deleted_results(is_mod)
        .include_mod_deleted_results(is_mod)
        .limit(limit)
        .offset(cursor);

    let query_results = query_builder.perform_query_for_page(&server_state.mysql_pool).await;

    let weights_page = match query_results {
        Ok(results) => results,
        Err(e) => {
            warn!("Query error: {:?}", e);
            return Err(ListWeightError::ServerError);
        }
    };

    let cursor_next = if let Some(id) = weights_page.last_id {
        let cursor = server_state.sort_key_crypto.encrypt_id(id as u64)
          .map_err(|e| {
            warn!("crypto error: {:?}", e);
            ListWeightError::ServerError
        })?;
        Some(cursor)
    } else {
        None
    };

    let cursor_previous = if let Some(id) = weights_page.first_id {
        let cursor = server_state.sort_key_crypto.encrypt_id(id as u64)
          .map_err(|e| {
            warn!("crypto error: {:?}", e);
            ListWeightError::ServerError
        })?;
        Some(cursor)
    } else {
        None
    };

    let mut rng = rand::thread_rng();
    let random_float = rng.gen_range(0.0..1.0);
    let random_bool = random_float >= 0.5;

    // generate parse a response
    let response = ListAvailableWeightsSuccessResponse {
        success: true,
        results: weights_page.weights.into_iter()
            .map(|weight| {

                let maybe_cover_image = weight.maybe_cover_image_public_bucket_hash
                    .as_deref()
                    .map(|hash| {
                        MediaFileBucketPath::from_object_hash(
                            hash,
                            weight.maybe_cover_image_public_bucket_prefix.as_deref(),
                            weight.maybe_cover_image_public_bucket_extension.as_deref())
                            .get_full_object_path_str()
                            .to_string()
                    });

                ModelWeightForList {
                    weight_token: weight.token,
                    title: weight.title,
                    weights_type: weight.weights_type,
                    weights_category: weight.weights_category,

                    description_markdown: weight.description_markdown,
                    description_rendered_html: weight.description_rendered_html,
                    maybe_cover_image_public_bucket_path: maybe_cover_image,

                    creator: UserDetailsLight::from_db_fields(
                        &weight.creator_user_token,
                        &weight.creator_username,
                        &weight.creator_display_name,
                        &weight.creator_email_gravatar_hash
                    ),
                    creator_set_visibility: weight.creator_set_visibility,

                    file_size_bytes: weight.file_size_bytes,
                    file_checksum_sha2: weight.file_checksum_sha2,

                    cached_user_ratings_total_count: weight.cached_user_ratings_total_count,
                    cached_user_ratings_positive_count: weight.cached_user_ratings_positive_count,
                    cached_user_ratings_negative_count: weight.cached_user_ratings_negative_count,
                    maybe_cached_user_ratings_ratio: weight.maybe_cached_user_ratings_ratio,

                    created_at: weight.created_at,
                    updated_at: weight.updated_at,

                    creator_username: weight.creator_username,
                    creator_display_name: weight.creator_display_name,
                    creator_email_gravatar_hash: weight.creator_email_gravatar_hash,

                    // TODO: FIX THIS when we align again.
                    bookmarks: random_bool,
                    likes: rng.gen_range(0..1000),
                }
            }).collect::<Vec<_>>(),
        pagination: PaginationCursors {
            maybe_next: cursor_next,
            maybe_previous: cursor_previous,
            cursor_is_reversed,
        },
    };

    let body = serde_json::to_string(&response)
      .map_err(|e| ListWeightError::ServerError)?;

    Ok(HttpResponse::Ok().content_type("application/json").body(body))
}
