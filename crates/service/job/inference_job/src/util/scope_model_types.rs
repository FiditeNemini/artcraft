use anyhow::anyhow;
use enums::by_table::generic_inference_jobs::inference_model_type::InferenceModelType;
use errors::AnyhowResult;
use std::collections::BTreeSet;

pub fn scope_model_types() -> AnyhowResult<BTreeSet<InferenceModelType>> {
  let comma_separated_types = match easyenv::get_env_string_optional("SCOPE_MODEL_TYPES") {
    None => return Ok(InferenceModelType::all_variants()),
    Some(val) => val,
  };

  parse_model_types(&comma_separated_types)
}

pub fn parse_model_types(comma_separated_types: &str) -> AnyhowResult<BTreeSet<InferenceModelType>> {
  let scoped_types = comma_separated_types.trim()
      .split(",")
      .map(|val| val.to_lowercase())
      .collect::<Vec<String>>();

  let mut model_types = BTreeSet::new();

  for t in scoped_types.into_iter() {
    let model_type = InferenceModelType::from_str(&t)
        .map_err(|err| anyhow!("Invalid model type: {:?}", t))?;

    model_types.insert(model_type);
  }

  Ok(model_types)
}

#[cfg(test)]
mod tests {
  use crate::util::scope_model_types::parse_model_types;
  use enums::by_table::generic_inference_jobs::inference_model_type::InferenceModelType;
  use std::collections::BTreeSet;

  #[test]
  fn test_parse() {
    assert_eq!(parse_model_types("rvc_v2,so_vits_svc").unwrap(),
      BTreeSet::from([InferenceModelType::RvcV2, InferenceModelType::SoVitsSvc]));
  }
}