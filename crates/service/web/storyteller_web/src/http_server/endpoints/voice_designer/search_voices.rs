

use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;

use log::{info, warn};

pub async fn search_voices() -> HttpResponse {
  // Implementation for searching voices with keywords
  HttpResponse::Ok().json("Search results for voices")
}