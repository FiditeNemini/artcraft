use crate::model::arpabet_tacotron_model::ArpabetTacotronModel;
use crate::model::melgan_model::MelganModel;
use crate::model::model_config::{ModelType, ModelLocation};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::Mutex;

pub struct ModelCache {
  /// Base directories for each model type(if configured)
  base_directories: HashMap<ModelType, PathBuf>,

  arpabet_tacotron_models: Arc<Mutex<HashMap<String, Arc<ArpabetTacotronModel>>>>,
  melgan_models: Arc<Mutex<HashMap<String, Arc<MelganModel>>>>,
}

impl ModelCache {
  pub fn new(model_locations: &Vec<ModelLocation>) -> Self {
    let mut base_directories = HashMap::new();

    for model_location in model_locations.iter() {
      if let Some(base_directory) = model_location.base_directory.as_ref() {
        let path = PathBuf::from(base_directory);
        base_directories.insert(model_location.model_type.clone(), path);
      }
    }

    Self {
      base_directories,
      arpabet_tacotron_models: Arc::new(Mutex::new(HashMap::new())),
      melgan_models: Arc::new(Mutex::new(HashMap::new())),
    }
  }

  pub fn get_or_load_arbabet_tacotron(&self, filename: &str) -> Option<Arc<ArpabetTacotronModel>> {
    let base_directory = self.get_base_directory(ModelType::ArpabetTacotron);

    let mut file_path = PathBuf::from(filename);

    if !file_path.is_absolute() {
      file_path = base_directory.map(|base_dir| base_dir.join(&file_path))
          .unwrap_or(file_path);
    }

    let mut lock = self.arpabet_tacotron_models.lock()
        .expect("should unlock");

    if let Some(model) = lock.get(filename) {
      return Some(model.clone());
    }

    match ArpabetTacotronModel::load(&file_path) {
      Ok(model) => {
        let arc = Arc::new(model);
        lock.insert(filename.to_string(), arc.clone());
        Some(arc)
      },
      Err(e) => {
        warn!("There was an error loading the model `{:?}`: {}", file_path, e);
        None
      },
    }
  }

  pub fn get_or_load_melgan(&self, filename: &str) -> Option<Arc<MelganModel>> {
    let base_directory = self.get_base_directory(ModelType::Melgan);

    let mut file_path = PathBuf::from(filename);

    if !file_path.is_absolute() {
      file_path = base_directory.map(|base_dir| base_dir.join(&file_path))
          .unwrap_or(file_path);
    }

    let mut lock = self.melgan_models.lock()
        .expect("should unlock");

    if let Some(model) = lock.get(filename) {
      return Some(model.clone());
    }

    match MelganModel::load(&file_path) {
      Ok(model) => {
        let arc = Arc::new(model);
        lock.insert(filename.to_string(), arc.clone());
        Some(arc)
      },
      Err(e) => {
        warn!("There was an error loading the model `{:?}`: {}", file_path, e);
        None
      },
    }
  }

  fn get_base_directory(&self, model_type: ModelType) -> Option<&PathBuf> {
    self.base_directories.get(&model_type)
  }
}
