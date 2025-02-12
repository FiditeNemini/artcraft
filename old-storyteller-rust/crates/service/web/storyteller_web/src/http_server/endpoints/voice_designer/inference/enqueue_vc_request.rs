use actix_web::HttpResponse;

pub async fn enqueue_vc_request() -> HttpResponse {
  // Implementation for enqueuing a VC request
  HttpResponse::Ok().json("VC request enqueued successfully")
}
