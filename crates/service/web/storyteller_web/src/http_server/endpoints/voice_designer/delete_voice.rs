use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;

use log::{info, warn};


pub async fn delete_voice(voice_token: web::Path<String>) -> HttpResponse {
  // Implementation for deleting a voice (soft delete)
  HttpResponse::Ok().json(format!("Voice {} deleted (soft delete)", voice_token))
}