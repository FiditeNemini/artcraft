use serde_derive::Deserialize;
use std::fs;
use std::path::Path;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ModelConfigs {
  speakers: Vec<Speaker>,
  pub model_locations: Vec<ModelLocation>,
  tacotron: Vec<ModelDetails>,
  melgan: Vec<ModelDetails>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Speaker {
  /// Name of the speaker
  pub name: String,
  /// URL slug / key
  pub slug: String,
  /// Model pipeline to use
  pub model_pipeline: ModelPipeline,
  /// Tacotron model, if used.
  pub tacotron: Option<String>,
  /// Melgan model, if used.
  pub melgan: Option<String>,
}

/// The types of models supported by our system.
#[derive(Serialize, Deserialize, Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum ModelType {
  RawTextTacotron,
  ArpabetTacotron,
  Melgan,
}

/// Where the various models are stored.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct ModelLocation {
  pub model_type: ModelType,
  pub base_directory: Option<String>,
}

/// The valid model pipelines in use by our system.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub enum ModelPipeline {
  //ArpabetTacotronGriffinLim,
  //ArpabetTacotronWorld,
  ArpabetTacotronMelgan,
  RawTextTacotronMelgan,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct ModelDetails {
  pub file_path: String,
  pub description: String,

  /// Just the file name without a path
  #[serde(skip_deserializing)]
  pub base_name: Option<String>,
}

impl ModelConfigs {
  pub fn load_from_file(filename: &str) -> Self {
    let contents = fs::read_to_string(filename)
        .expect("Couldn't read file");
    let mut model_configs : ModelConfigs = toml::from_str(&contents)
        .expect("Couldn't parse toml");

    model_configs.update_base_names();
    model_configs
  }

  fn update_base_names(&mut self) {
    for mut details in self.tacotron.iter_mut() {
      let path = Path::new(&details.file_path);
      details.base_name = path.file_name()
          .and_then(|name| name.to_str())
          .map(|s| s.to_string());
    }

    for mut details in self.melgan.iter_mut() {
      let path = Path::new(&details.file_path);
      details.base_name = path.file_name()
          .and_then(|name| name.to_str())
          .map(|s| s.to_string());
    }
  }
}
