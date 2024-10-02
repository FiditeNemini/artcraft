use std::collections::HashSet;
use elasticsearch_schema::documents::model_weight_document::ModelWeightDocument;

pub fn print_titles(results: &Vec<ModelWeightDocument>) {
  for result in results {
    println!("  - result: {:#?} ({:?})", result.title, result.token);
  }
}

pub fn to_title_set(results: &Vec<ModelWeightDocument>) -> HashSet<String> {
  results.iter().map(|result| result.title.clone()).collect()
}

