

use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;

use log::{info, warn};


pub async fn list_datasets_by_user(user_token: web::Path<String>) -> HttpResponse {
  // Implementation for listing datasets for a user
  HttpResponse::Ok().json(format!("List of datasets for user {}", user_token))
}
