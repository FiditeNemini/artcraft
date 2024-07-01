use std::collections::HashSet;
use once_cell::sync::Lazy;
use serde_json::{json, Value};
use enums::by_table::media_files::media_file_class::MediaFileClass;
use enums::by_table::media_files::media_file_engine_category::MediaFileEngineCategory;
use enums::by_table::media_files::media_file_type::MediaFileType;
use errors::AnyhowResult;

static JSON_QUERY : Lazy<Value> = Lazy::new(|| {
  const QUERY_TEMPLATE : &str = include_str!("../../../../../_elasticsearch/searches/media_files/search.json");

  let json : Value = serde_json::from_str(QUERY_TEMPLATE)
      .expect("json should parse");

  json
});

pub struct SearchArgs {
  pub maybe_media_classes: Option<HashSet<MediaFileClass>>,
  pub maybe_media_types: Option<HashSet<MediaFileType>>,
  pub maybe_engine_categories: Option<HashSet<MediaFileEngineCategory>>,
}

pub fn search_media_files(args: SearchArgs) -> AnyhowResult<()> {

}

fn build_query(args: SearchArgs) -> AnyhowResult<Value> {
  let query = JSON_QUERY.clone();

  let query = jsonpath_lib::replace_with(query, "$.query.bool.must[0].bool.must", &mut |_| {
    let mut predicates = vec![
      must_be_not_deleted(),
    ];

    if let Some(media_classes) = &args.maybe_media_classes {
      predicates.push(media_classes_predicate(media_classes));
    }

    if let Some(media_types) = &args.maybe_media_types {
      predicates.push(media_types_predicate(media_types));
    }

    if let Some(engine_categories) = &args.maybe_engine_categories {
      predicates.push(engine_categories_predicate(engine_categories));
    }

    Some(json!(predicates))
  })?;

  println!("QUERY: {}", query);

  Ok(query)
}

fn must_be_not_deleted() -> Value {
  json!({
    "term": {
      "is_deleted": false,
    }
  })
}

fn media_classes_predicate(media_classes: &HashSet<MediaFileClass>) -> Value {
  let predicates : Vec<Value> = media_classes.iter()
      .map(|media_type| {
        json!({
          "term": {
            "media_class": media_type.to_str(),
          }
        })
      })
      .collect();

  json!({
    "bool": {
      "should": predicates,
    }
  })
}

fn media_types_predicate(media_types: &HashSet<MediaFileType>) -> Value {
  let predicates : Vec<Value> = media_types.iter()
      .map(|media_type| {
        json!({
          "term": {
            "media_type": media_type.to_str(),
          }
        })
      })
      .collect();

  json!({
    "bool": {
      "should": predicates,
    }
  })
}

fn engine_categories_predicate(engine_categories: &HashSet<MediaFileEngineCategory>) -> Value {
  let predicates : Vec<Value> = engine_categories.iter()
      .map(|engine_category| {
        json!({
          "term": {
            "maybe_engine_category": engine_category.to_str(),
          }
        })
      })
      .collect();

  json!({
    "bool": {
      "should": predicates,
    }
  })
}

#[cfg(test)]
mod tests {
  use crate::searches::search_media_files::SearchArgs;

  #[test]
  fn test() {
    super::search_media_files(SearchArgs {
      maybe_media_classes: None,
      maybe_media_types: None,
      maybe_engine_categories: None,
    }).expect("should function");

    assert_eq!(1, 2);
  }
}