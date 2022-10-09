use actix_http::Error;
use actix_http::http::header;
use actix_web::HttpResponseBuilder;
use actix_web::cookie::Cookie;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::{Path, Json};
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use chrono::{DateTime, Utc, NaiveDateTime};
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::response_success_helpers::simple_json_success;
use crate::server_state::ServerState;
use database_queries::complex_models::event_responses::EventResponse;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use lexical_sort::natural_lexical_cmp;
use log::{info, warn, log, error};
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::fmt;
use std::sync::Arc;

// =============== Success Response ===============

#[derive(Serialize)]
pub struct AppFeature {
    /// Required.
    /// The identifier for the feature,
    /// eg. "unlimited_models"
    pub key: String,

    /// Optional.
    /// Whether the feature is enabled.
    /// If a feature is associated with a number rather than a boolean on/off, this will be absent.
    pub is_enabled: Option<boolean>,

    /// Optional.
    /// A quantity associated with the feature.
    /// Sometimes a feature may be associated with a number rather than an enabled flag,
    /// such as "number_of_models = 50".
    pub quantity: Option<u64>,
}

#[derive(Serialize)]
pub struct AppPlansResponse {
    pub success: bool,

    // News items will be sorted in reverse chronological order.
    pub features: Vec<AppFeature>,
}


// =============== Error Response ===============

#[derive(Debug, Serialize)]
pub enum AppPlansError {
    ServerError,
}

impl ResponseError for AppPlansError {
    fn status_code(&self) -> StatusCode {
        match *self {
            AppPlansError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        serialize_as_json_error(self)
    }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for AppPlansError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

// =============== Handler ===============

pub async fn get_app_plans_handler(
    http_request: HttpRequest,
    server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, AppPlansError>
{
    // TODO: Real features.
    let username = "";

    let maybe_user = server_state
        .session_checker
        .maybe_get_user_session(&http_request, &server_state.mysql_pool)
        .await
        .map_err(|e| {
            warn!("Session checker error: {:?}", e);
            AppPlansError::ServerError
        })?;

    let unlimited_time = maybe_user
        .map(|user| user.username.to_lowercase().starts_with("time"))
        .unwrap_or(false);

    let model_count = maybe_user
        .map(|user| {
            let name = user.username.to_lowercase();
            if name.ends_with("some") {
                10
            } else if name.ends_with("more") {
                25
            } else if name.ends_with("most") {
                50
            } else {
                0
            }
        })
        .unwrap_or(0);


    let mut features = Vec::new();

    // NB: Triggered by username!
    if unlimited_time {
        features.push(AppFeature {
            key: "no_time_limit",
            is_enabled: Some(true),
        });
    }

    // NB: Triggered by username!
    if model_count > 0 {
        features.push(AppFeature {
            key: "number_of_downloads_supported",
            quantity: Some(model_count),
        });
    }

    let response = AppPlansResponse {
        success: true,
        features,
    };

    let body = serde_json::to_string(&response)
        .map_err(|e| AppPlansError::ServerError)?;

    Ok(HttpResponse::Ok()
        .content_type("application/json")
        .body(body))
}
