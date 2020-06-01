use actix_web::web::{
  Data,
  Json,
};
use actix_web::http::StatusCode;
use actix_web::{HttpRequest, get, HttpResponse, Either};

use std::sync::Arc;
use crate::AppState;
use crate::database::model::Sentence;

#[derive(Serialize, Debug)]
pub struct SentencesResult {
  sentences: Vec<Sentence>,
}

#[get("/sentences")]
pub async fn get_sentences(
  _request: HttpRequest,
  app_state: Data<Arc<AppState>>
) -> Either<Json<SentencesResult>, std::io::Result<HttpResponse>>{
  let app_state = app_state.into_inner();

  let limit = 1000;
  let sentences = match Sentence::load(&app_state.database_connector, limit) {
    Err(e) => {
      error!("Couldn't query database for sentences: {:?}", e);
      return Either::B(Ok(HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
          .content_type("text/plain")
          .body("Couldn't query database database")));
    },
    Ok(results) => results,
  };

  Either::A(Json(SentencesResult {
    sentences: sentences,
  }))
}
