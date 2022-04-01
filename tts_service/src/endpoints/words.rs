use actix_web::web::{Data, Json, Query};
use actix_web::http::StatusCode;
use actix_web::{HttpRequest, get, HttpResponse, Either};

use std::sync::Arc;
use crate::AppState;
use crate::database::model::Sentence;
use std::collections::HashMap;
use crate::database::connector::DatabaseConnector;

/// Paginated responses in the format expected by Tabulator.js
#[derive(Serialize, Debug)]
pub struct WordsResult {
  results: Vec<(String, i64)>,
}

#[get("/words")]
pub async fn get_words(
  _request: HttpRequest,
  app_state: Data<Arc<AppState>>
) -> Either<Json<WordsResult>, std::io::Result<HttpResponse>>{

  let app_state = app_state.into_inner();

  // Major performance implications, but this is only going to be called occasionally
  let limit = 20_000_000;
  let offset = 0;
  let sort_ascending = true;

  // TODO: FIXME
  let database_connector = DatabaseConnector::create("");

  let records = match Sentence::load(&database_connector, limit, offset, sort_ascending) {
    Err(e) => {
      error!("Couldn't query database for sentences: {:?}", e);
      return Either::B(Ok(HttpResponse::build(StatusCode::INTERNAL_SERVER_ERROR)
          .content_type("text/plain")
          .body("Couldn't query database database")));
    },
    Ok(results) => results,
  };

  let sentences : Vec<&str> = records
      .iter()
      .map(|r| r.sentence.as_ref())
      .collect();

  let words : Vec<String> = sentences
      .iter()
      .flat_map(|s| s.split_whitespace())
      .map(|s| s.trim())
      .map(|s| s.to_lowercase())
      .map(|s| s.replace("!", ""))
      .map(|s| s.replace(",", ""))
      .map(|s| s.replace(".", ""))
      .map(|s| s.replace("?", ""))
      .collect();

  let mut word_counts : HashMap<String, i64> = HashMap::new();

  for word in words {
    if(!word_counts.contains_key(&word)) {
      word_counts.insert(word.clone(), 0);
    }
    word_counts.get_mut(&word).map(|count| *count += 1);
  }

  let mut word_counts_sortable : Vec<(String, i64)> = Vec::with_capacity(word_counts.len());

  for (word, count) in word_counts {
    word_counts_sortable.push((word.to_string(), count));
  }

  // Sorts descending by count
  word_counts_sortable.sort_by(|a, b| b.1.cmp(&a.1));


  Either::A(Json(WordsResult {
    results: word_counts_sortable
  }))
}
