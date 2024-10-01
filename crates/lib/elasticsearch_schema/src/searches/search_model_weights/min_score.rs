use serde_json::{Number, Value};

pub fn add_min_score(
  mut query: Value,
  search_term: &str,
  maybe_user_defined_minimum_score: Option<u64>,
) -> Value {

  if let Some(mimimum_score) = maybe_user_defined_minimum_score {
    if let Some(mut object) = query.as_object_mut() {
      object.insert(
        "min_score".to_string(),
        Value::Number(Number::from(mimimum_score))
      );
    }
    return query;
  }

  if search_term.is_empty() {
    return query;
  }

  let minimum_score = match search_term.len() {
    1..=3 => 1,
    4 => 5,
    5 => 10,
    6 => 30,
    7 => 50,
    _ => 100,
  };

  if let Some(mut object) = query.as_object_mut() {
    object.insert(
      "min_score".to_string(),
      Value::Number(Number::from(minimum_score))
    );
  }

  query
}