use serde_derive::Deserialize;
use std::fs;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ModelConfigs {
  tacotron: Vec<ModelDetails>,
  melgan: Vec<ModelDetails>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct ModelDetails {
  pub file: String,
  pub description: String,
}

impl ModelConfigs {
  pub fn load_from_file(filename: &str) -> Self {
    let contents = fs::read_to_string(filename)
        .expect("Couldn't read file");
    toml::from_str(&contents)
        .expect("Couldn't parse toml")
  }
}
