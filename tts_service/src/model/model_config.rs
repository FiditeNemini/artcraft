use serde_derive::Deserialize;
use std::fs;
use std::path::Path;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ModelConfigs {
  pub speakers: Vec<Speaker>,
  pub model_locations: Vec<ModelLocation>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Speaker {
  /// Name of the speaker
  pub name: String,
  /// URL slug / key
  pub slug: String,
  /// Speaker Id, if used
  pub speaker_id: Option<i64>,
  /// Model pipeline to use
  pub model_pipeline: ModelPipeline,
  /// Tacotron model, if used.
  pub tacotron: Option<String>,
  /// Glow-tts model, if used.
  pub glow_tts: Option<String>,
  /// Glow-tts multi-speaker model, if used.
  pub glow_tts_multi_speaker: Option<String>,
  /// Melgan model, if used.
  pub melgan: Option<String>,
}

/// The types of models supported by our system.
#[derive(Serialize, Deserialize, Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum ModelType {
  RawTextTacotron,
  ArpabetTacotron,
  ArpabetGlowTts, // NB: This uses a different arpabet preprocessor
  ArpabetGlowTtsMultiSpeaker, // NB: This uses a different arpabet preprocessor
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
  ArpabetGlowTtsMelgan,
  ArpabetGlowTtsMultiSpeakerMelgan,
}

impl ModelConfigs {
  pub fn load_from_file(filename: &str) -> Self {
    let contents = fs::read_to_string(filename)
        .expect("Couldn't read file");
    toml::from_str(&contents)
        .expect("Couldn't parse toml")
  }

  pub fn find_speaker_by_slug(&self, slug: &str) -> Option<&Speaker> {
    self.speakers.iter()
        .find(|speaker| speaker.slug == slug)
  }
}
