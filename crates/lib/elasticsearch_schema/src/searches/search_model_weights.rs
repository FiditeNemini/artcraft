use std::collections::HashSet;

use elasticsearch::{Elasticsearch, SearchParts};
use once_cell::sync::Lazy;
use serde_json::{json, Value};

use enums::by_table::model_weights::weights_category::WeightsCategory;
use enums::by_table::model_weights::weights_types::WeightsType;
use errors::{anyhow, AnyhowResult};
use tokens::tokens::users::UserToken;

use crate::documents::model_weight_document::{MODEL_WEIGHT_INDEX, ModelWeightDocument};

static JSON_QUERY : Lazy<Value> = Lazy::new(|| {
  const QUERY_TEMPLATE : &str = include_str!("../../../../../_elasticsearch/searches/model_weights/search.json");

  let json : Value = serde_json::from_str(QUERY_TEMPLATE)
      .expect("json should parse");

  json
});

pub struct SearchModelWeightsQuery<'a> {
  pub search_term: &'a str,
  pub maybe_language_subtag: Option<&'a str>,
  pub maybe_weights_type: Option<WeightsType>,
  pub maybe_weights_category: Option<WeightsCategory>,
}

impl <'a>SearchModelWeightsQuery<'a> {

  fn base_query(&self) -> Value {
    json!({
      "query": {
        "bool": {
          "must": [
            {
              "bool": {
                "should": [
                  {
                    "fuzzy": {
                      "title": {
                        "value": self.search_term,
                        "fuzziness": 2
                      }
                    }
                  },
                  {
                    "match": {
                      "title": {
                        "query": self.search_term,
                        "boost": 1
                      }
                    }
                  },
                  {
                    "multi_match": {
                      "query": self.search_term,
                      "type": "bool_prefix",
                      "fields": [
                        "title",
                        "title._2gram",
                        "title._3gram"
                      ],
                      "boost": 50
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    })
  }

  pub fn query(&self) -> AnyhowResult<Value> {
    let mut search_json = self.base_query();

    let must_clause = search_json.pointer_mut("/query/bool/must")
        .map(|pointer| pointer.as_array_mut())
        .flatten()
        .ok_or_else(|| anyhow!("could not get pointer to must clause"))?;

    if let Some(maybe_language_subtag) = &self.maybe_language_subtag {
      must_clause.push(json!(
        {
          "match": {
            "maybe_ietf_primary_language_subtag": maybe_language_subtag
          }
        }
      ));
    }

    if let Some(weights_type) = &self.maybe_weights_type {
      must_clause.push(json!(
        {
          "match": {
            "weights_type": weights_type.to_string(),
          }
        }
      ));
    }

    if let Some(weights_category) = &self.maybe_weights_category {
      must_clause.push(json!(
        {
          "match": {
            "weights_category": weights_category.to_string(),
          }
        }
      ));
    }

    Ok(search_json)
  }
}

pub struct SearchArgs<'a> {
  pub search_term: &'a str,
  // pub is_featured: Option<bool>,
  pub maybe_creator_user_token: Option<&'a UserToken>,
  pub maybe_ietf_primary_language_subtag: Option<&'a str>,
  pub maybe_weights_categories: Option<HashSet<WeightsCategory>>,
  pub maybe_weights_types: Option<HashSet<WeightsType>>,

  pub client: &'a Elasticsearch,
}

pub async fn search_model_weights(args: SearchArgs<'_>) -> AnyhowResult<Vec<ModelWeightDocument>> {
  let query = build_query(&args)?;

  let search_response = args.client
      .search(SearchParts::Index(&[MODEL_WEIGHT_INDEX]))
      .body(query)
      .size(30)
      .allow_no_indices(true)
      .send()
      .await?;

  let _status_code = search_response.status_code();

  let mut response_json = search_response.json::<Value>().await?;

  let hits = response_json.get_mut("hits")
      .map(|hits| hits.take());

  let hits = hits.map(|mut hits| {
    hits.get_mut("hits")
        .map(|hits| hits.take())
  }).flatten();

  let mut documents = Vec::new();

  match hits {
    Some(Value::Array(inner_hits)) => {
      for mut hit in inner_hits {
        let maybe_object = hit.get_mut("_source")
            .map(|source| source.take());
        if let Some(value) = maybe_object {
          let document = serde_json::from_value::<ModelWeightDocument>(value)?;
          documents.push(document);
        }
      }
    }
    _ => {},
  }

  Ok(documents)
}

fn build_query(args: &SearchArgs) -> AnyhowResult<Value> {
  let query = JSON_QUERY.clone();

  let query = jsonpath_lib::replace_with(query, "$.query.bool.must[0].bool.must", &mut |_| {
    let mut predicates = vec![
      must_be_not_deleted(),
    ];

//    if let Some(is_featured) = args.is_featured {
//      predicates.push(featured_predicate(is_featured));
//    }
//

    if let Some(language_subtag) = args.maybe_ietf_primary_language_subtag {
      predicates.push(language_subtag_predicate(language_subtag));
    }

    if let Some(creator_user_token) = args.maybe_creator_user_token {
      predicates.push(creator_user_token_predicate(creator_user_token));
    }

    if let Some(weights_categories) = &args.maybe_weights_categories {
      predicates.push(weights_categories_predicates(weights_categories));
    }

    if let Some(weights_types) = &args.maybe_weights_types {
      predicates.push(weights_types_predicates(weights_types));
    }

    Some(json!(predicates))
  })?;

  let query = jsonpath_lib::replace_with(query, "$.query.bool.must[0].bool.should[0].fuzzy.title.value", &mut |_| {
    Some(json!(args.search_term))
  })?;

  let query = jsonpath_lib::replace_with(query, "$.query.bool.must[0].bool.should[1].match.title.query", &mut |_| {
    Some(json!(args.search_term))
  })?;

  let query = jsonpath_lib::replace_with(query, "$.query.bool.must[0].bool.should[2].multi_match.query", &mut |_| {
    Some(json!(args.search_term))
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

// fn featured_predicate(is_featured: bool) -> Value {
//   json!({
//     "term": {
//       "is_featured": is_featured,
//     }
//   })
// }

fn creator_user_token_predicate(creator_user_token: &UserToken) -> Value {
  json!({
    "term": {
      "maybe_creator_user_token": creator_user_token.as_str(),
    }
  })
}

fn language_subtag_predicate(language_subtag: &str) -> Value {
  json!({
    "term": {
      "maybe_ietf_primary_language_subtag": language_subtag,
    }
  })
}


fn weights_categories_predicates(weights_categories: &HashSet<WeightsCategory>) -> Value {
  should_predicates(weights_categories.iter()
      .map(|weight_category| {
        json!({
          "term": {
            "weights_category": weight_category.to_str(),
          }
        })
      })
      .collect())
}

fn weights_types_predicates(weights_types: &HashSet<WeightsType>) -> Value {
  should_predicates(weights_types.iter()
      .map(|weights_type| {
        json!({
          "term": {
            "weights_type": weights_type.to_str(),
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

  use enums::by_table::model_weights::weights_category::WeightsCategory;
  use enums::by_table::model_weights::weights_types::WeightsType;
  use tokens::tokens::users::UserToken;

  use crate::searches::search_model_weights::build_query;
  use crate::searches::search_model_weights::SearchArgs;

  #[test]
  fn test_default_search() {
    let search = build_query(&SearchArgs {
      search_term: "foo",
      maybe_creator_user_token: None,
      maybe_ietf_primary_language_subtag: None,
      maybe_weights_categories: None,
      maybe_weights_types: None,
      client: &elasticsearch::Elasticsearch::default(),
    }).unwrap();

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.must[0].term.is_deleted").unwrap();

    assert_eq!(value[0], &Value::Bool(false));

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.should[0].fuzzy.title.value").unwrap();

    assert_eq!(value[0], &Value::String("foo".to_string()));

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.should[1].match.title.query").unwrap();

    assert_eq!(value[0], &Value::String("foo".to_string()));

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.should[2].multi_match.query").unwrap();

    assert_eq!(value[0], &Value::String("foo".to_string()));
  }

  #[test]
  fn test_creator_user_token() {
    let search = build_query(&SearchArgs {
      search_term: "asdf",
      maybe_creator_user_token: Some(&UserToken::new_from_str("USER_TOKEN")),
      maybe_ietf_primary_language_subtag: None,
      maybe_weights_categories: None,
      maybe_weights_types: None,
      client: &elasticsearch::Elasticsearch::default(),
    }).unwrap();

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.must[0].term.is_deleted").unwrap();

    assert_eq!(value[0], &Value::Bool(false));

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.must[1].term.maybe_creator_user_token").unwrap();

    assert_eq!(value[0], &Value::String("USER_TOKEN".to_string()));

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.should[0].fuzzy.title.value").unwrap();

    assert_eq!(value[0], &Value::String("asdf".to_string()));

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.should[1].match.title.query").unwrap();

    assert_eq!(value[0], &Value::String("asdf".to_string()));

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.should[2].multi_match.query").unwrap();

    assert_eq!(value[0], &Value::String("asdf".to_string()));
  }

  #[test]
  fn test_ietf_primary_language_subtag() {
    let search = build_query(&SearchArgs {
      search_term: "foo",
      maybe_creator_user_token: None,
      maybe_ietf_primary_language_subtag: Some("ja"),
      maybe_weights_categories: None,
      maybe_weights_types: None,
      client: &elasticsearch::Elasticsearch::default(),
    }).unwrap();

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.must[0].term.is_deleted").unwrap();

    assert_eq!(value[0], &Value::Bool(false));

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.must[1].term.maybe_ietf_primary_language_subtag").unwrap();

    assert_eq!(value[0], &Value::String("ja".to_string()));

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.should[0].fuzzy.title.value").unwrap();

    assert_eq!(value[0], &Value::String("foo".to_string()));

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.should[1].match.title.query").unwrap();

    assert_eq!(value[0], &Value::String("foo".to_string()));

    let value = jsonpath_lib::select(
      &search, "$.query.bool.must[0].bool.should[2].multi_match.query").unwrap();

    assert_eq!(value[0], &Value::String("foo".to_string()));
  }

  #[test]
  fn test_weight_types() {
    let search = build_query(&SearchArgs {
      search_term: "bar",
      maybe_creator_user_token: None,
      maybe_ietf_primary_language_subtag: None,
      maybe_weights_categories: None,
      maybe_weights_types: Some(HashSet::from_iter(vec![
        WeightsType::Tacotron2,
        WeightsType::GptSoVits,
      ])),
      client: &elasticsearch::Elasticsearch::default(),
    }).unwrap();

    let value = select(&search, "$.query.bool.must[0].bool.must[0].term.is_deleted");

    assert_eq!(value[0], &Value::Bool(false));

    let values = select_str_values(
      &search, "$.query.bool.must[0].bool.must[1].bool.should[*].term.weights_type");

    assert_eq!(values.len(), 2);
    assert!(values.contains(&"tt2"));
    assert!(values.contains(&"gpt_so_vits"));
  }

  #[test]
  fn test_weight_categories() {
    let search = build_query(&SearchArgs {
      search_term: "bar",
      maybe_creator_user_token: None,
      maybe_ietf_primary_language_subtag: None,
      maybe_weights_types: None,
      maybe_weights_categories: Some(HashSet::from_iter(vec![
        WeightsCategory::TextToSpeech,
        WeightsCategory::VoiceConversion,
      ])),
      client: &elasticsearch::Elasticsearch::default(),
    }).unwrap();

    let value = select(&search, "$.query.bool.must[0].bool.must[0].term.is_deleted");

    assert_eq!(value[0], &Value::Bool(false));

    let values = select_str_values(
      &search, "$.query.bool.must[0].bool.must[1].bool.should[*].term.weights_category");

    assert_eq!(values.len(), 2);
    assert!(values.contains(&"text_to_speech"));
    assert!(values.contains(&"voice_conversion"));
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

  mod old_tests {
    use regex::Regex;

    use enums::by_table::model_weights::weights_category::WeightsCategory;
    use enums::by_table::model_weights::weights_types::WeightsType;
    use errors::AnyhowResult;

    use crate::searches::search_model_weights::SearchModelWeightsQuery;

    fn query_to_json_string(query: SearchModelWeightsQuery<'_>) -> AnyhowResult<String> {
      let json = query.query()?;
      let json = serde_json::to_string(&json)?;
      Ok(json)
    }

    fn compact_json(json: &str) -> String {
      let regex = Regex::new("\\s+").expect("regex should parse");
      let json = regex.replace_all(&json, "");
      json.to_string()
    }

    #[test]
    fn default_search_only_keyword() {
      let query = SearchModelWeightsQuery {
        search_term: "FOO_BAR_BAZ",
        maybe_language_subtag: None,
        maybe_weights_type: None,
        maybe_weights_category: None,
      };

      let json = query_to_json_string(query).unwrap();

      // NB: Keys in emitted JSON are sorted.
      let expected_json = r#"
      {
        "query": {
          "bool": {
            "must": [
              {
                "bool": {
                  "should": [
                    {
                      "fuzzy": {
                        "title": {
                          "value": "FOO_BAR_BAZ",
                          "fuzziness": 2
                        }
                      }
                    },
                    {
                      "match": {
                        "title": {
                          "query": "FOO_BAR_BAZ",
                          "boost": 1
                        }
                      }
                    },
                    {
                      "multi_match": {
                        "query": "FOO_BAR_BAZ",
                        "type": "bool_prefix",
                        "fields": [
                          "title",
                          "title._2gram",
                          "title._3gram"
                        ],
                        "boost": 50
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    "#;

      let expected_json = compact_json(&expected_json);

      assert_eq!(&json, &expected_json);
    }

    #[test]
    fn search_with_language_and_weights() {
      let query = SearchModelWeightsQuery {
        search_term: "FOO_BAR_BAZ",
        maybe_language_subtag: Some("en"),
        maybe_weights_type: Some(WeightsType::SoVitsSvc),
        maybe_weights_category: Some(WeightsCategory::Vocoder),
      };

      let json = query_to_json_string(query).unwrap();

      // NB: Keys in emitted JSON are sorted.
      let expected_json = r#"
      {
        "query": {
          "bool": {
            "must": [
              {
                "bool": {
                  "should": [
                    {
                      "fuzzy": {
                        "title": {
                          "value": "FOO_BAR_BAZ",
                          "fuzziness": 2
                        }
                      }
                    },
                    {
                      "match": {
                        "title": {
                          "query": "FOO_BAR_BAZ",
                          "boost": 1
                        }
                      }
                    },
                    {
                      "multi_match": {
                        "query": "FOO_BAR_BAZ",
                        "type": "bool_prefix",
                        "fields": [
                          "title",
                          "title._2gram",
                          "title._3gram"
                        ],
                        "boost": 50
                      }
                    }
                  ]
                }
              },
              {
                "match": {
                  "maybe_ietf_primary_language_subtag": "en"
                }
              },
              {
                "match": {
                  "weights_type": "so_vits_svc"
                }
              },
              {
                "match": {
                  "weights_category": "vocoder"
                }
              }
            ]
          }
        }
      }
    "#;

      let expected_json = compact_json(&expected_json);

      assert_eq!(&json, &expected_json);
    }
  }
}
