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

pub struct SearchArgs<'a> {
  pub search_term: &'a str,
  pub maybe_media_classes: Option<HashSet<MediaFileClass>>,
  pub maybe_media_types: Option<HashSet<MediaFileType>>,
  pub maybe_engine_categories: Option<HashSet<MediaFileEngineCategory>>,
}

pub fn search_media_files(args: SearchArgs) -> AnyhowResult<()> {
  let query = build_query(args)?;

  Ok(())
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

    println!("Predicates: {:?}", predicates);

    Some(json!(predicates))
  })?;

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
  should_predicates(media_classes.iter()
      .map(|media_type| {
        json!({
          "term": {
            "media_class": media_type.to_str(),
          }
        })
      })
      .collect())
}

fn media_types_predicate(media_types: &HashSet<MediaFileType>) -> Value {
  should_predicates(media_types.iter()
      .map(|media_type| {
        json!({
          "term": {
            "media_type": media_type.to_str(),
          }
        })
      })
      .collect())
}

fn engine_categories_predicate(engine_categories: &HashSet<MediaFileEngineCategory>) -> Value {
  should_predicates(engine_categories.iter()
      .map(|engine_category| {
        json!({
          "term": {
            "maybe_engine_category": engine_category.to_str(),
          }
        })
      })
      .collect())
}

// NB: "Should" is a logical OR.
fn should_predicates(predicates: Vec<Value>) -> Value {
  json!({
    "bool": {
      "should": predicates,
    }
  })
}

#[cfg(test)]
mod tests {
  use std::collections::HashSet;
  use std::iter::FromIterator;

  use serde_json::Value;

  use enums::by_table::media_files::media_file_class::MediaFileClass;
  use enums::by_table::media_files::media_file_engine_category::MediaFileEngineCategory;
  use enums::by_table::media_files::media_file_type::MediaFileType;

  use crate::searches::search_media_files::{build_query, SearchArgs};

  #[test]
  fn test_default_search() {
    let search = build_query(SearchArgs {
      search_term: "foo",
      maybe_media_classes: None,
      maybe_media_types: None,
      maybe_engine_categories: None,
    }).unwrap();

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.must[0].term.is_deleted").unwrap();

    assert_eq!(value[0], &Value::Bool(false));
  }

  #[test]
  fn test_media_class() {
    let search = build_query(SearchArgs {
      search_term: "bar",
      maybe_media_classes: Some(HashSet::from_iter(vec![
        MediaFileClass::Dimensional,
        MediaFileClass::Image,
      ])),
      maybe_media_types: None,
      maybe_engine_categories: None,
    }).unwrap();

    let value = select(&search, "$.query.bool.must[0].bool.must[0].term.is_deleted");

    assert_eq!(value[0], &Value::Bool(false));

    let values = select_str_values(
      &search, "$.query.bool.must[0].bool.must[1].bool.should[*].term.media_class");

    assert_eq!(values.len(), 2);
    assert!(values.contains(&"image"));
    assert!(values.contains(&"dimensional"));
  }

  #[test]
  fn test_media_type() {
    let search = build_query(SearchArgs {
      search_term: "baz",
      maybe_media_classes: None,
      maybe_media_types: Some(HashSet::from_iter(vec![
        MediaFileType::Glb,
        MediaFileType::Png,
      ])),
      maybe_engine_categories: None,
    }).unwrap();

    let value = select(&search, "$.query.bool.must[0].bool.must[0].term.is_deleted");

    assert_eq!(value[0], &Value::Bool(false));

    let values = select_str_values(
      &search, "$.query.bool.must[0].bool.must[1].bool.should[*].term.media_type");

    assert_eq!(values.len(), 2);
    assert!(values.contains(&"glb"));
    assert!(values.contains(&"png"));
  }

  #[test]
  fn test_engine_category() {
    let search = build_query(SearchArgs {
      search_term: "bin",
      maybe_media_classes: None,
      maybe_media_types: None,
      maybe_engine_categories: Some(HashSet::from_iter(vec![
        MediaFileEngineCategory::Animation,
        MediaFileEngineCategory::Character,
      ])),
    }).unwrap();

    let value = select(&search, "$.query.bool.must[0].bool.must[0].term.is_deleted");

    assert_eq!(value[0], &Value::Bool(false));

    let values = select_str_values(
      &search, "$.query.bool.must[0].bool.must[1].bool.should[*].term.maybe_engine_category");

    assert_eq!(values.len(), 2);
    assert!(values.contains(&"animation"));
    assert!(values.contains(&"character"));
  }

  fn select<'a>(search: &'a Value, path: &str) -> Vec<&'a Value> {
    jsonpath_lib::select(search, path).unwrap()
  }

  fn select_str_values<'a>(search: &'a Value, path: &str) -> Vec<&'a str> {
    select(search, path).into_iter()
        .map(|value| {
          match value {
            Value::String(inner) => inner.as_str(),
            _ => panic!("Expected string"),
          }
        })
        .collect()
  }
}
