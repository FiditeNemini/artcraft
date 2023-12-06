use std::fmt;
use std::sync::Arc;
use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use chrono::{DateTime, Utc};
use log::warn;
use enums::common::visibility::Visibility;
use tokens::tokens::users::UserToken;

use crate::http_server::common_responses::user_details_lite::UserDetailsLight;
use crate::server_state::ServerState;

use tokens::tokens::model_weights::ModelWeightToken;
use mysql_queries::queries::model_weights::get_weight::get_weight_by_token;

use enums::by_table::model_weights::weights_types::WeightsType;
use enums::by_table::model_weights::weights_category::WeightsCategory;

use utoipa::ToSchema;

#[derive(Serialize, Clone, ToSchema)]
pub struct GetWeightResponse {
    success: bool,
    weight_token: ModelWeightToken,
    title: String,
    weights_type: WeightsType,
    weights_category: WeightsCategory,
    maybe_thumbnail_token: Option<String>,
    description_markdown: String,
    description_rendered_html: String,
    creator_set_visibility: Visibility,

    file_size_bytes: i32,
    file_checksum_sha2: String,
    
    cached_user_ratings_negative_count: u32,
    cached_user_ratings_positive_count: u32,
    cached_user_ratings_total_count: u32,

    maybe_cached_user_ratings_ratio: Option<f32>,
    cached_user_ratings_last_updated_at: DateTime<Utc>,
    
    version: i32,
    created_at: DateTime<Utc>,
}

#[derive(Deserialize,ToSchema)]
pub struct GetWeightPathInfo {
    weight_token: String,
}

#[derive(Debug,ToSchema)]
pub enum GetWeightError {
    NotAuthorized,
    NotFound,
    ServerError,
}

impl fmt::Display for GetWeightError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl ResponseError for GetWeightError {
    fn status_code(&self) -> StatusCode {
        match *self {
            GetWeightError::NotAuthorized => StatusCode::UNAUTHORIZED,
            GetWeightError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
            GetWeightError::NotFound => StatusCode::NOT_FOUND,
        }
    }
}
#[utoipa::path(
    get,
    path = "/weight/{weight_token}",
    responses(
        (status = 200, description = "Success Update", body = GetWeightResponse),
        (status = 400, description = "Bad input", body = GetWeightError),
        (status = 401, description = "Not authorized", body = GetWeightError),
        (status = 500, description = "Server error", body = GetWeightError),
    ),
    params(
        ("request" = UpdateWeightRequest, description = "Payload for Request"),
        ("path" = GetWeightPathInfo, description = "Path for Request")
    )
  )]
pub async fn get_weight_handler(
    http_request: HttpRequest,
    path: Path<GetWeightPathInfo>,
    server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, GetWeightError> {

    let maybe_user_session = server_state
        .session_checker
        .maybe_get_user_session(&http_request, &server_state.mysql_pool)
        .await
        .map_err(|e| {
            warn!("Session checker error: {:?}", e);
            GetWeightError::ServerError
        })?;

    let user_session = match maybe_user_session {
        Some(session) => session,
        None => {
            warn!("not logged in");
            return Err(GetWeightError::NotAuthorized);
        }
    };

    let weight_token = path.weight_token.clone();
    let creator_user_token = user_session.user_token.clone();
    let is_mod = user_session.can_ban_users;

    let weight_lookup_result = get_weight_by_token(
        &ModelWeightToken::new(weight_token.clone()),
        is_mod,
        &server_state.mysql_pool,
    ).await;

    let weight = match weight_lookup_result {
        Ok(Some(weight)) => weight,
        Ok(None) => {
            warn!("Weight not found: {:?}", weight_token);
            return Err(GetWeightError::NotFound);
        },
        Err(err) => {
            warn!("Error looking up weight: {:?}", err);
            return Err(GetWeightError::ServerError);
        }
    };

    // if the weight is private, only the creator can view it
    let is_private = weight.creator_set_visibility == Visibility::Private;

    if is_private && creator_user_token.as_str() != &user_session.user_token {
        warn!("user is not allowed to view this weight: {}", user_session.user_token);
        return Err(GetWeightError::NotAuthorized);
    } 


    let response = GetWeightResponse {
        success: true,
        weight_token: weight.token,
        title: weight.title,
        weights_type: weight.weights_type,
        weights_category: weight.weights_category,
        maybe_thumbnail_token: weight.maybe_thumbnail_token,
        description_markdown: weight.description_markdown,
        description_rendered_html: weight.description_rendered_html,
        creator_set_visibility: weight.creator_set_visibility,
        file_size_bytes: weight.file_size_bytes,
        file_checksum_sha2: weight.file_checksum_sha2,
        cached_user_ratings_negative_count: weight.cached_user_ratings_negative_count,
        cached_user_ratings_positive_count: weight.cached_user_ratings_positive_count,
        cached_user_ratings_total_count: weight.cached_user_ratings_total_count,
        maybe_cached_user_ratings_ratio: weight.maybe_cached_user_ratings_ratio,
        cached_user_ratings_last_updated_at: weight.cached_user_ratings_last_updated_at,
        version: weight.version,
        created_at: weight.created_at
    };

    let body = serde_json::to_string(&response)
        .map_err(|e| GetWeightError::ServerError)?;

    Ok(HttpResponse::Ok()
        .content_type("application/json")
        .body(body))
}