use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use log::warn;
use utoipa::ToSchema;

use enums::by_table::media_files::media_file_type::MediaFileType;
use enums::common::visibility::Visibility;
use http_server_common::response::response_success_helpers::simple_json_success;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use mysql_queries::queries::media_files::get_media_file::get_media_file;
use mysql_queries::queries::model_weights::edit::update_weight::{CoverImageOption, update_weights, UpdateWeightArgs};
use mysql_queries::queries::model_weights::get::get_weight::get_weight_by_token;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::model_weights::ModelWeightToken;
use user_input_common::check_for_slurs::contains_slurs;
use user_input_common::markdown_to_html::markdown_to_html;

use crate::server_state::ServerState;

// TODO will eventually be polymorphic
/// **IMPORTANT**: This endpoint handles sparse (by-field) updates rather than wholesale updates.
/// That is, if a field is absent, we do not update it (as opposed to clearing it).
#[derive(Deserialize, ToSchema)]
pub struct UpdateWeightRequest {
    pub title: Option<String>,
    pub description_markdown: Option<String>,

    /// The media file token of the *image* media file.
    /// Set to *empty string* to clear the cover image.
    pub cover_image_media_file_token: Option<MediaFileToken>,
    pub visibility: Option<Visibility>,
}

#[derive(Serialize, ToSchema)]
pub struct UpdateWeightResponse {
    pub success: bool,
}

/// For the URL PathInfo
#[derive(Deserialize,ToSchema)]
pub struct UpdateWeightPathInfo {
    weight_token: String,
}

// =============== Error Response ===============

#[derive(Debug, Serialize, ToSchema)]
pub enum UpdateWeightError {
    BadInput(String),
    NotFound,
    NotAuthorized,
    ServerError,
}

impl ResponseError for UpdateWeightError {
    fn status_code(&self) -> StatusCode {
        match *self {
            UpdateWeightError::BadInput(_) => StatusCode::BAD_REQUEST,
            UpdateWeightError::NotFound => StatusCode::NOT_FOUND,
            UpdateWeightError::NotAuthorized => StatusCode::UNAUTHORIZED,
            UpdateWeightError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        serialize_as_json_error(self)
    }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for UpdateWeightError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

// =============== Handler ===============
#[utoipa::path(
    post,
    tag = "Model Weights",
    path = "/v1/weights/weight/{weight_token}",
    responses(
        (status = 200, description = "Success Update", body = SimpleGenericJsonSuccess),
        (status = 400, description = "Bad input", body = UpdateWeightError),
        (status = 401, description = "Not authorized", body = UpdateWeightError),
        (status = 500, description = "Server error", body = UpdateWeightError),
    ),
    params(
        ("request" = UpdateWeightRequest, description = "Payload for Request"),
        ("path" = UpdateWeightPathInfo, description = "Path for Request")
    )
  )]
pub async fn update_weight_handler(
    http_request: HttpRequest,
    path: Path<UpdateWeightPathInfo>,
    request: web::Json<UpdateWeightRequest>,
    server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, UpdateWeightError> {
    let my_sql_pool = &server_state.mysql_pool;

    let maybe_user_session = server_state.session_checker
        .maybe_get_user_session(&http_request, &server_state.mysql_pool).await
        .map_err(|e| {
            warn!("Session checker error: {:?}", e);
            UpdateWeightError::ServerError
        })?;

    let user_session = match maybe_user_session {
        Some(session) => session,
        None => {
            warn!("not logged in");
            return Err(UpdateWeightError::NotAuthorized);
        }
    };

    let weight_token = path.weight_token.clone();

    // TODO wouldn't we want to instead use a function that will query the DB for the user and determine if they are a mod?
    let is_mod = user_session.can_ban_users;

    let weight_lookup_result = get_weight_by_token(
        &ModelWeightToken::new(weight_token.clone()),
        is_mod,
        &server_state.mysql_pool
    ).await;

    let weight = match weight_lookup_result {
        Ok(Some(weight)) => weight,
        Ok(None) => {
            warn!("Weight not found: {:?}", weight_token);
            return Err(UpdateWeightError::NotFound);
        }
        Err(err) => {
            warn!("Error looking up weight: {:?}", err);
            return Err(UpdateWeightError::ServerError);
        }
    };

    let is_creator =
        weight.creator_user_token.to_string() ==
            user_session.user_token_typed.as_str().to_string();

    if !is_creator && !is_mod {
        warn!("user is not allowed to edit this weight: {:?}", user_session.user_token_typed);
        return Err(UpdateWeightError::NotAuthorized);
    }

    let mut weight_title = None;
    let mut cover_image = None;
    let mut description_markdown = None;
    let mut description_rendered_html = None;

    if let Some(title) = &request.title {
        if contains_slurs(title) {
            return Err(UpdateWeightError::BadInput("Title contains slurs".to_string()));
        }
        weight_title = Some(title.trim().to_string());
    }

    if let Some(media_file_token) = &request.cover_image_media_file_token {
        if media_file_token.as_str().trim().is_empty() {
            cover_image = Some(CoverImageOption::ClearCoverImage);
        } else {
            let maybe_media_file = get_media_file(
                media_file_token,
                false, // NB: Even mods shouldn't set deleted media files.
                &server_state.mysql_pool
            ).await.map_err(|err| {
                warn!("Error looking up media file: {:?}", err);
                UpdateWeightError::ServerError
            })?;

            let maybe_media_file_type = maybe_media_file.map(|media_file| media_file.media_type);

            match maybe_media_file_type {
                Some(MediaFileType::Image) => cover_image = Some(CoverImageOption::SetCoverImage(media_file_token)),
                None => return Err(UpdateWeightError::BadInput("Media file does not exist".to_string())),
                _ => return Err(UpdateWeightError::BadInput("Media file is the wrong type".to_string())),
            }
        }
    }

    if let Some(markdown) = &request.description_markdown {
        if contains_slurs(markdown) {
            return Err(UpdateWeightError::BadInput("Description contains slurs".to_string()));
        }
        let markdown = markdown.trim().to_string();
        let html = markdown_to_html(&markdown);
        description_markdown = Some(markdown);
        description_rendered_html = Some(html);
    }

    let query_result = update_weights(UpdateWeightArgs {
        weight_token: &ModelWeightToken::new(path.weight_token.clone()),
        mysql_pool: &server_state.mysql_pool,
        title: weight_title.as_deref(),
        cover_image,
        maybe_description_markdown: description_markdown.as_deref(),
        maybe_description_rendered_html: description_rendered_html.as_deref(),
        creator_set_visibility: request.visibility.as_ref(),
    }).await;

    match query_result {
        Ok(_) => {}
        Err(err) => {
            warn!("Update Weight DB error: {:?}", err);
            return Err(UpdateWeightError::ServerError);
        }
    }

    Ok(simple_json_success())
}
