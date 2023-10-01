use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;

use log::{info, warn};


pub async fn update_voice(voice_token: web::Path<String>) -> HttpResponse {
  // Implementation for updating a voice
  HttpResponse::Ok().json(format!("Voice {} updated successfully", voice_token))
}
