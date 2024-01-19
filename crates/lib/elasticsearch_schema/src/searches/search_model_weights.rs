use elasticsearch::{Elasticsearch, SearchParts};
use serde_json::{json, Value};

use enums::by_table::model_weights::weights_types::WeightsType;
use errors::{anyhow, AnyhowResult};

use crate::documents::model_weight_document::{MODEL_WEIGHT_INDEX, ModelWeightDocument};

pub struct SearchModelWeightsQuery<'a> {
  pub search_term: &'a str,
  pub maybe_language_subtag: Option<&'a str>,
  pub maybe_weights_type: Option<WeightsType>,
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

    Ok(search_json)
  }
}

pub async fn search_model_weights(
  client: &Elasticsearch,
  search_term: &str,
  maybe_language_subtag: Option<&str>,
  maybe_weights_type: Option<WeightsType>,
) -> AnyhowResult<Vec<ModelWeightDocument>> {

  let query = SearchModelWeightsQuery {
    search_term,
    maybe_language_subtag,
    maybe_weights_type,
  };

  let search_json = query.query()?;

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

fn base_search(search_term: &str) -> Value {
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
  use enums::by_table::model_weights::weights_types::WeightsType;
  use errors::AnyhowResult;
  use crate::searches::search_model_weights::{query_model_weights, SearchModelWeightsQuery};

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

    let expected_json = compact_json(&expected_json);

    assert_eq!(&json, &expected_json);
  }

  #[test]
  fn search_with_language_and_weights() {
    let query = SearchModelWeightsQuery {
      search_term: "FOO_BAR_BAZ",
      maybe_language_subtag: Some("en"),
      maybe_weights_type: Some(WeightsType::SoVitsSvc),
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
