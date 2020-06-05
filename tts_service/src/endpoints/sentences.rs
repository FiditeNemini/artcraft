use actix_web::web::{Data, Json, Query};
use actix_web::http::StatusCode;
use actix_web::{HttpRequest, get, HttpResponse, Either};

use std::sync::Arc;
use crate::AppState;
use crate::database::model::Sentence;

/// Request with pagination from Tabulator.js
#[derive(Deserialize, Debug)]
pub struct SentencesRequest {
  page: Option<i64>,
  per_page: Option<i64>,
  sort_direction: Option<String>,
}

/// Paginated responses in the format expected by Tabulator.js
#[derive(Serialize, Debug)]
pub struct SentencesResult {
  record_count: i64, // Added for my own purposes
  last_page: i64,
  data: Vec<Sentence>,
}

#[get("/sentences")]
pub async fn get_sentences(
  _request: HttpRequest,
  query: Query<SentencesRequest>,
  app_state: Data<Arc<AppState>>
) -> Either<Json<SentencesResult>, std::io::Result<HttpResponse>>{

  debug!("SentencesRequest: {:?}", query);

  let app_state = app_state.into_inner();

  let sentence_count = Sentence::count(&app_state.database_connector)
      .ok()
      .unwrap_or(0);

  debug!("Total Sentence Records: {:?}", sentence_count);

  let page = query.page.unwrap_or(1);
  let limit = query.per_page.unwrap_or(100);

  let offset = limit * (page - 1);

  let sort_ascending = match query.sort_direction.as_ref() {
    None => true,
    Some(direction) => match direction.as_ref() {
      "asc" => true,
      "desc" => false,
      _ => true,
    },
  };

  debug!("Sentence Query: Limit: {}, Offset: {}, Sort Ascending: {}", limit, offset, sort_ascending);

  let sentences = match Sentence::load(&app_state.database_connector, limit, offset, sort_ascending) {
    Err(e) => {
      error!("Couldn't query database for sentences: {:?}", e);
      return Either::B(Ok(HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
          .content_type("text/plain")
          .body("Couldn't query database database")));
    },
    Ok(results) => results,
  };

  let last_page = (sentence_count / limit) + 1;

  Either::A(Json(SentencesResult {
    data: sentences,
    last_page,
    record_count: sentence_count,
  }))
}
