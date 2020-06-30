use crate::model::arpabet_tacotron_model::ArpabetTacotronModel;
use crate::model::melgan_model::MelganModel;
use crate::model::model_config::{ModelType, ModelLocation};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::Mutex;
use crate::model::arpabet_glow_tts_model::ArpabetGlowTtsModel;
use crate::model::arpabet_glow_tts_multi_speaker_model::ArpabetGlowTtsMultiSpeakerModel;

pub struct ModelCache {
  /// Base directories for each model type(if configured)
  dev_base_directories: HashMap<ModelType, PathBuf>,
  prod_base_directories: HashMap<ModelType, PathBuf>,

  arpabet_tacotron_models: Arc<Mutex<HashMap<String, Arc<ArpabetTacotronModel>>>>,
  arpabet_glow_tts_models: Arc<Mutex<HashMap<String, Arc<ArpabetGlowTtsModel>>>>,
  arpabet_glow_tts_multi_speaker_models: Arc<Mutex<HashMap<String, Arc<ArpabetGlowTtsMultiSpeakerModel>>>>,
  melgan_models: Arc<Mutex<HashMap<String, Arc<MelganModel>>>>,
}

impl ModelCache {
  pub fn new(model_locations: &Vec<ModelLocation>) -> Self {
    let mut dev_base_directories = HashMap::new();
    let mut prod_base_directories = HashMap::new();

    for model_location in model_locations.iter() {
      if let Some(base_directory) = model_location.dev_base_directory.as_ref() {
        let path = PathBuf::from(base_directory);
        dev_base_directories.insert(model_location.model_type.clone(), path);
      }
      if let Some(base_directory) = model_location.prod_base_directory.as_ref() {
        let path = PathBuf::from(base_directory);
        prod_base_directories.insert(model_location.model_type.clone(), path);
      }
    }

    Self {
      dev_base_directories,
      prod_base_directories,
      arpabet_tacotron_models: Arc::new(Mutex::new(HashMap::new())),
      arpabet_glow_tts_models: Arc::new(Mutex::new(HashMap::new())),
      arpabet_glow_tts_multi_speaker_models: Arc::new(Mutex::new(HashMap::new())),
      melgan_models: Arc::new(Mutex::new(HashMap::new())),
    }
  }

  pub fn get_or_load_arbabet_tacotron(&self, filename: &str) -> Option<Arc<ArpabetTacotronModel>> {
    let mut lock = self.arpabet_tacotron_models.lock()
        .expect("should unlock");

    if let Some(model) = lock.get(filename) {
      return Some(model.clone());
    }

    let mut file_path = PathBuf::from(filename);

    let mut maybe_loaded = None;

    if file_path.is_absolute() {
      maybe_loaded = self.load_arpabet_tacotron_model(&file_path);
    } else {
      let check_path = self.resolve_prod_path(ModelType::ArpabetTacotron, &file_path);
      maybe_loaded = self.load_arpabet_tacotron_model(&check_path);

      if maybe_loaded.is_none() {
        let check_path = self.resolve_dev_path(ModelType::ArpabetTacotron, &file_path);
        maybe_loaded = self.load_arpabet_tacotron_model(&check_path);
      }
    }

    match maybe_loaded {
      Some(model) => {
        let arc = Arc::new(model);
        lock.insert(filename.to_string(), arc.clone());
        Some(arc)
      },
      None => {
        warn!("There was an error loading the model `{:?}`", file_path);
        None
      }
    }
  }

  pub fn get_or_load_arbabet_glow_tts(&self, filename: &str) -> Option<Arc<ArpabetGlowTtsModel>> {
    let mut lock = self.arpabet_glow_tts_models.lock()
        .expect("should unlock");

    if let Some(model) = lock.get(filename) {
      return Some(model.clone());
    }

    let mut file_path = PathBuf::from(filename);

    let mut maybe_loaded = None;

    if file_path.is_absolute() {
      maybe_loaded = self.load_arpabet_glow_tts_model(&file_path);
    } else {
      let check_path = self.resolve_prod_path(ModelType::ArpabetGlowTts, &file_path);
      maybe_loaded = self.load_arpabet_glow_tts_model(&check_path);

      if maybe_loaded.is_none() {
        let check_path = self.resolve_dev_path(ModelType::ArpabetGlowTts, &file_path);
        maybe_loaded = self.load_arpabet_glow_tts_model(&check_path);
      }
    }

    match maybe_loaded {
      Some(model) => {
        let arc = Arc::new(model);
        lock.insert(filename.to_string(), arc.clone());
        Some(arc)
      },
      None => {
        warn!("There was an error loading the model `{:?}`", file_path);
        None
      }
    }
  }

  pub fn get_or_load_arbabet_glow_tts_multi_speaker(&self, filename: &str) -> Option<Arc<ArpabetGlowTtsMultiSpeakerModel>> {
    let mut lock = self.arpabet_glow_tts_multi_speaker_models.lock()
        .expect("should unlock");

    if let Some(model) = lock.get(filename) {
      return Some(model.clone());
    }

    let mut file_path = PathBuf::from(filename);

    let mut maybe_loaded = None;

    if file_path.is_absolute() {
      maybe_loaded = self.load_arpabet_glow_tts_multi_speaker_model(&file_path);
    } else {
      let check_path = self.resolve_prod_path(ModelType::ArpabetGlowTtsMultiSpeaker, &file_path);
      maybe_loaded = self.load_arpabet_glow_tts_multi_speaker_model(&check_path);

      if maybe_loaded.is_none() {
        let check_path = self.resolve_dev_path(ModelType::ArpabetGlowTtsMultiSpeaker, &file_path);
        maybe_loaded = self.load_arpabet_glow_tts_multi_speaker_model(&check_path);
      }
    }

    match maybe_loaded {
      Some(model) => {
        let arc = Arc::new(model);
        lock.insert(filename.to_string(), arc.clone());
        Some(arc)
      },
      None => {
        warn!("There was an error loading the model `{:?}`", file_path);
        None
      }
    }
  }

  pub fn get_or_load_melgan(&self, filename: &str) -> Option<Arc<MelganModel>> {
    let mut lock = self.melgan_models.lock()
        .expect("should unlock");

    if let Some(model) = lock.get(filename) {
      return Some(model.clone());
    }

    let mut file_path = PathBuf::from(filename);

    let mut maybe_loaded = None;

    if file_path.is_absolute() {
      maybe_loaded = self.load_melgan_model(&file_path);
    } else {
      let check_path = self.resolve_prod_path(ModelType::Melgan, &file_path);
      maybe_loaded = self.load_melgan_model(&check_path);

      if maybe_loaded.is_none() {
        let check_path = self.resolve_dev_path(ModelType::Melgan, &file_path);
        maybe_loaded = self.load_melgan_model(&check_path);
      }
    }

    match maybe_loaded {
      Some(model) => {
        let arc = Arc::new(model);
        lock.insert(filename.to_string(), arc.clone());
        Some(arc)
      },
      None => {
        warn!("There was an error loading the model `{:?}`", file_path);
        None
      }
    }
  }

  fn load_melgan_model(&self, file_path: &PathBuf) -> Option<MelganModel> {
    MelganModel::load(&file_path).ok()
  }

  fn load_arpabet_tacotron_model(&self, file_path: &PathBuf) -> Option<ArpabetTacotronModel> {
    ArpabetTacotronModel::load(&file_path).ok()
  }

  fn load_arpabet_glow_tts_model(&self, file_path: &PathBuf) -> Option<ArpabetGlowTtsModel> {
    ArpabetGlowTtsModel::load(&file_path).ok()
  }

  fn load_arpabet_glow_tts_multi_speaker_model(&self, file_path: &PathBuf) -> Option<ArpabetGlowTtsMultiSpeakerModel> {
    ArpabetGlowTtsMultiSpeakerModel::load(&file_path).ok()
  }

  fn resolve_prod_path(&self, model_type: ModelType, file_name: &PathBuf) -> PathBuf {
    let base_directory = self.get_prod_base_directory(model_type);
    base_directory.map(|base_dir| base_dir.join(&file_name))
        .unwrap_or(file_name.clone())
  }

  fn resolve_dev_path(&self, model_type: ModelType, file_name: &PathBuf) -> PathBuf {
    let base_directory = self.get_dev_base_directory(model_type);
    base_directory.map(|base_dir| base_dir.join(&file_name))
        .unwrap_or(file_name.clone())
  }

  fn get_prod_base_directory(&self, model_type: ModelType) -> Option<&PathBuf> {
    self.prod_base_directories.get(&model_type)
  }

  fn get_dev_base_directory(&self, model_type: ModelType) -> Option<&PathBuf> {
    self.dev_base_directories.get(&model_type)
  }
}
