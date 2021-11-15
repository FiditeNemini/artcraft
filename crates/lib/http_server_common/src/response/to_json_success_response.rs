use serde::Serialize;
use actix_web::HttpResponse;
use container_common::anyhow_result::AnyhowResult;

pub fn to_json_success_response(response: &impl Serialize) -> AnyhowResult<HttpResponse> {
  let body = serde_json::to_string(&response)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
