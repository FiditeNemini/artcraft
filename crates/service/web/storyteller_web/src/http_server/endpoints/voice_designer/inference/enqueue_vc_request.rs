

use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;

use log::{info, warn};



pub async fn enqueue_vc_request() -> HttpResponse {
  // Implementation for enqueuing a VC request
  HttpResponse::Ok().json("VC request enqueued successfully")
}
