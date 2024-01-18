use elasticsearch::{Elasticsearch, SearchParts};
use serde_json::{json, Value};

use enums::by_table::model_weights::weights_types::WeightsType;
use errors::AnyhowResult;

use crate::documents::model_weight_document::{MODEL_WEIGHT_INDEX, ModelWeightDocument};

pub async fn search_model_weights(
  client: &Elasticsearch,
  search_term: &str,
  maybe_language_subtag: Option<&str>,
  maybe_weights_type: Option<WeightsType>,
) -> AnyhowResult<Vec<ModelWeightDocument>> {

  let search_json = match (maybe_language_subtag, maybe_weights_type) {
    (Some(language), None) => query_model_weights_with_required_language(search_term, language),
    (None, Some(weights_type)) => query_model_weights_with_model_weights_type(search_term, weights_type),
    _ => query_model_weights(search_term),
  };

  let search_response = client
      .search(SearchParts::Index(&[MODEL_WEIGHT_INDEX]))
      .body(search_json)
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

fn query_model_weights(search_term: &str) -> Value {
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
                      "value": search_term,
                      "fuzziness": 2
                    }
                  }
                },
                {
                  "match": {
                    "title": {
                      "query": search_term,
                      "boost": 1
                    }
                  }
                },
                {
                  "multi_match": {
                    "query": search_term,
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

fn query_model_weights_with_required_language(search_term: &str, language_tag: &str) -> Value {
  json!({
    "query": {
      "bool": {
        "must": [
          {
            "match": {
              "maybe_ietf_primary_language_subtag": language_tag
            }
          },
          {
            "bool": {
              "should": [
                {
                  "fuzzy": {
                    "title": {
                      "value": search_term,
                      "fuzziness": 2
                    }
                  }
                },
                {
                  "match": {
                    "title": {
                      "query": search_term,
                      "boost": 1
                    }
                  }
                },
                {
                  "multi_match": {
                    "query": search_term,
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

fn query_model_weights_with_model_weights_type(search_term: &str, weight_type: WeightsType) -> Value {
  json!({
    "query": {
      "bool": {
        "must": [
          {
            "match": {
              "weights_type": weight_type.to_string(),
            }
          },
          {
            "bool": {
              "should": [
                {
                  "fuzzy": {
                    "title": {
                      "value": search_term,
                      "fuzziness": 2
                    }
                  }
                },
                {
                  "match": {
                    "title": {
                      "query": search_term,
                      "boost": 1
                    }
                  }
                },
                {
                  "multi_match": {
                    "query": search_term,
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

#[cfg(test)]
mod tests {
  use regex::Regex;
  use crate::searches::search_model_weights::query_model_weights;

  #[test]
  fn default_search_only_keyword() {
    let json = query_model_weights("FOO_BAR_BAZ");
    let json = serde_json::to_string(&json).unwrap();

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
                          "fuzziness": 2,
                          "value": "FOO_BAR_BAZ"
                        }
                      }
                    },
                    {
                      "match": {
                        "title": {
                          "boost": 1,
                          "query": "FOO_BAR_BAZ"
                        }
                      }
                    },
                    {
                      "multi_match": {
                        "boost": 50,
                        "fields": [
                          "title",
                          "title._2gram",
                          "title._3gram"
                        ],
                        "query": "FOO_BAR_BAZ",
                        "type": "bool_prefix"
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

    let regex = Regex::new("\\s+").expect("regex should parse");

    let expected_json = regex.replace_all(&expected_json, "");

    assert_eq!(&json, &expected_json);
  }
}
