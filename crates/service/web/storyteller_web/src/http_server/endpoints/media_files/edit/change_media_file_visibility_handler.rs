use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use log::{error, log, warn};
use utoipa::ToSchema;
use enums::common::visibility::Visibility;

use http_server_common::request::get_request_ip::get_request_ip;
use http_server_common::response::response_success_helpers::simple_json_success;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use mysql_queries::queries::media_files::get::get_media_file::get_media_file;
use mysql_queries::queries::media_files::update_media_file::{update_media_file, UpdateMediaFileArgs};
use tokens::tokens::media_files::MediaFileToken;

use crate::server_state::ServerState;

#[derive(Deserialize, ToSchema)]
pub struct ChangeMediaFileVisibilityRequest {
    pub creator_set_visibility: Option<String>,
}

/// For the URL PathInfo
#[derive(Deserialize, ToSchema)]
pub struct ChangeMediaFileVisibilityPathInfo {
    token: MediaFileToken,
}

// =============== Error Response ===============

#[derive(Debug, Serialize, ToSchema)]
pub enum ChangeMediaFileVisibilityError {
    BadInput(String),
    NotFound,
    NotAuthorized,
    ServerError,
}

impl ResponseError for ChangeMediaFileVisibilityError {
    fn status_code(&self) -> StatusCode {
        match *self {
            ChangeMediaFileVisibilityError::BadInput(_) => StatusCode::BAD_REQUEST,
            ChangeMediaFileVisibilityError::NotFound => StatusCode::NOT_FOUND,
            ChangeMediaFileVisibilityError::NotAuthorized => StatusCode::UNAUTHORIZED,
            ChangeMediaFileVisibilityError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        serialize_as_json_error(self)
    }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for ChangeMediaFileVisibilityError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

// =============== Handler ===============

#[utoipa::path(
    post,
    tag = "Media Files",
    path = "/v1/media_files/visibility/{token}",
    responses(
        (status = 200, description = "Success Delete", body = SimpleGenericJsonSuccess),
        (status = 400, description = "Bad input", body = ChangeMediaFileVisibilityError),
        (status = 401, description = "Not authorized", body = ChangeMediaFileVisibilityError),
        (status = 500, description = "Server error", body = ChangeMediaFileVisibilityError),
    ),
    params(
        ("request" = ChangeMediaFileVisibilityRequest, description = "Payload for Request"),
        ("path" = ChangeMediaFileVisibilityPathInfo, description = "Path for Request")
    )
)]
pub async fn change_media_file_visibility_handler(
    http_request: HttpRequest,
    path: Path<ChangeMediaFileVisibilityPathInfo>,
    request: web::Json<ChangeMediaFileVisibilityRequest>,
    server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, ChangeMediaFileVisibilityError>
{
    let maybe_user_session = server_state
        .session_checker
        .maybe_get_user_session(&http_request, &server_state.mysql_pool)
        .await
        .map_err(|e| {
            warn!("Session checker error: {:?}", e);
            ChangeMediaFileVisibilityError::ServerError
        })?;

    let user_session = match maybe_user_session {
        Some(session) => session,
        None => {
            warn!("not logged in");
            return Err(ChangeMediaFileVisibilityError::NotAuthorized);
        }
    };

    let media_file_token = path.token.clone();
    let is_mod = user_session.can_ban_users;

    let media_file_lookup_result = get_media_file(
        &path.token,
        is_mod,
        &server_state.mysql_pool,
    ).await;

    let media_file = match media_file_lookup_result {
        Ok(Some(media_file)) => media_file,
        Ok(None) => {
            warn!("MediaFile not found: {:?}", media_file_token);
            return Err(ChangeMediaFileVisibilityError::NotFound);
        },
        Err(err) => {
            warn!("Error looking up media_file: {:?}", err);
            return Err(ChangeMediaFileVisibilityError::ServerError);
        }
    };

    let is_creator = media_file.maybe_creator_user_token
        .is_some_and(|t| t.as_str() == user_session.user_token.as_str());

    if !is_creator && !is_mod {
        warn!("user is not allowed to edit this media_file: {:?}", user_session.user_token);
        return Err(ChangeMediaFileVisibilityError::NotAuthorized);
    }

    let mut creator_set_visibility = Visibility::Public;


    if let Some(visibility) = request.creator_set_visibility.as_deref() {
        creator_set_visibility = Visibility::from_str(visibility)
            .map_err(|_| ChangeMediaFileVisibilityError::BadInput("bad record visibility".to_string()))?;
    }

    let ip_address = get_request_ip(&http_request);
    let mut maybe_mod_user_token = None;

    if is_mod {
        maybe_mod_user_token = Some(user_session.user_token.as_str().to_string());
    }
    let query_result = update_media_file(
        UpdateMediaFileArgs {
            media_file_token: &media_file_token.clone(),
            creator_set_visibility: &creator_set_visibility,
            maybe_mod_user_token: maybe_mod_user_token.as_deref(),
            mysql_pool: &server_state.mysql_pool
        }
    ).await;

    match query_result {
        Ok(_) => {},
        Err(err) => {
            warn!("Update MediaFile DB error: {:?}", err);
            return Err(ChangeMediaFileVisibilityError::ServerError);
        }
    };

    Ok(simple_json_success())
}
