use anyhow::Error;
use crate::model::arpabet_tacotron_model::ArpabetTacotronModel;
use crate::model::melgan_model::MelganModel;
use std::collections::HashMap;
use std::sync::Arc;
use std::sync::Mutex;

pub struct ModelCache {
  arpabet_tacotron_models: Arc<Mutex<HashMap<String, Arc<ArpabetTacotronModel>>>>,
  melgan_models: Arc<Mutex<HashMap<String, Arc<MelganModel>>>>,
}

impl ModelCache {
  pub fn new() -> Self {
    Self {
      arpabet_tacotron_models: Arc::new(Mutex::new(HashMap::new())),
      melgan_models: Arc::new(Mutex::new(HashMap::new())),
    }
  }

  pub fn get_or_load_arbabet_tacotron(&self, filename: &str) -> Option<Arc<ArpabetTacotronModel>> {
    let mut lock = self.arpabet_tacotron_models.lock()
        .expect("should unlock");

    if let Some(model) = lock.get(filename) {
      return Some(model.clone());
    }

    match ArpabetTacotronModel::load(&filename) {
      Ok(model) => {
        let arc = Arc::new(model);
        lock.insert(filename.to_string(), arc.clone());
        Some(arc)
      },
      Err(_) => None,
    }
  }

  pub fn get_or_load_melgan(&self, filename: &str) -> Option<Arc<MelganModel>> {
    let mut lock = self.melgan_models.lock()
        .expect("should unlock");

    if let Some(model) = lock.get(filename) {
      return Some(model.clone());
    }

    match MelganModel::load(&filename) {
      Ok(model) => {
        let arc = Arc::new(model);
        lock.insert(filename.to_string(), arc.clone());
        Some(arc)
      },
      Err(_) => None,
    }
  }
}
