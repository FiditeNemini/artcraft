use std::collections::HashSet;
use elasticsearch::Elasticsearch;
use log::error;
use errors::{anyhow, AnyhowResult};
use crate::plans::model_weights::evaluate::search::search_term_only;
use crate::plans::model_weights::evaluate::titles::{print_titles, to_title_set};

pub async fn assert_search_term_contains_titles(
  client: &Elasticsearch,
  search_term: &str,
  expected_titles: &Vec<&str>,
) -> AnyhowResult<()> {
  let results = search_term_only(search_term, client).await?;
  let titles = to_title_set(&results);

  println!("Titles:");
  print_titles(&results);

  if let Err(err) = assert_contains_all(&titles, expected_titles, search_term) {
    error!("Title not found for search: {}", search_term);
    print_titles(&results);
    return Err(err);
  }

  Ok(())
}
pub fn assert_contains(titles: &HashSet<String>, expected: &str, search_term: &str) -> AnyhowResult<()> {
  if !titles.contains(expected) {
    error!("Expected title not found: {} for search {} ({} results)",
      expected, search_term, titles.len());

    return Err(anyhow!("Expected title not found: {} for search {} ({} results)",
      expected, search_term, titles.len()));
  }
  Ok(())
}

pub fn assert_contains_all(titles: &HashSet<String>, expected: &Vec<&str>, search_term: &str) -> AnyhowResult<()> {
  for title in expected.iter() {
    assert_contains(titles, title, search_term)?;
  }
  Ok(())
}

