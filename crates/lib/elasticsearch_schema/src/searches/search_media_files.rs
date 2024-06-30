use once_cell::sync::Lazy;
use serde_json::{json, Value};


static JSON_QUERY : Lazy<Value> = Lazy::new(|| {
  const QUERY_TEMPLATE : &str = include_str!("../../../../../_elasticsearch/searches/media_files/search.json");

  let json : Value = serde_json::from_str(QUERY_TEMPLATE)
      .expect("json should parse");

  // Replace this with an empty list so that we can attach predicates later.
  let json= jsonpath_lib::replace_with(json, "$.query.bool.must[0].bool.must", &mut |_| {
    //Some(json!([]))
    None
  }).expect("json node should delete");

  json
});


pub fn search() {
  let query = JSON_QUERY.clone();

  println!("{}", query);

  let mut must_node = jsonpath_lib::select(
    &query,
    "$.query.bool.must[0].bool.must").expect("json node should exist");

  println!("{:?}", must_node);

  let new_node = json!({
    "match": {
      "media_file_id": "1234"
    }
  });

  must_node.push(&new_node);

  println!("{:?}", must_node);

  println!("{}", query);
}

#[cfg(test)]
mod tests {
  #[test]
  fn test() {
    super::search();
    assert_eq!(1, 2);
  }
}