use anyhow::anyhow;
use enums::by_table::generic_inference_jobs::inference_category::InferenceCategory;
use enums::by_table::generic_inference_jobs::inference_model_type::InferenceModelType;
use errors::AnyhowResult;
use std::collections::HashMap;
use std::sync::{Arc, LockResult, RwLock};

#[derive(Clone)]
pub struct ModelInfoLite {
  pub inference_category: InferenceCategory,
  pub model_type: InferenceModelType,
}

/// Model token to type will never change, so we can cache them indefinitely.
/// This is for generic inference jobs only.
#[derive(Clone)]
pub struct ModelTokenToInfoCache {
  database: Arc<RwLock<HashMap<String, ModelInfoLite>>>,
}

impl ModelTokenToInfoCache {
  pub fn new() -> Self {
    Self {
      database: Arc::new(RwLock::new(HashMap::new())),
    }
  }

  pub fn insert_one(&self, token: &str, info: &ModelInfoLite) -> AnyhowResult<()> {
    match self.database.write() {
      Err(err) => return Err(anyhow!("lock err: {:?}", err)),
      Ok(mut lock) => {
        lock.insert(token.to_string(), info.clone());
      }
    }
    Ok(())
  }

  pub fn insert_many(&self, records: Vec<(String, ModelInfoLite)>) -> AnyhowResult<()> {
    match self.database.write() {
      Err(err) => return Err(anyhow!("lock err: {:?}", err)),
      Ok(mut lock) => {
        for (token, info) in records.into_iter() {
          lock.insert(token, info);
        }
      }
    }
    Ok(())
  }

  pub fn get_info(&self, token: &str) -> AnyhowResult<Option<ModelInfoLite>> {
    match self.database.read() {
      Err(err) => return Err(anyhow!("lock err: {:?}", err)),
      Ok(lock) => {
        Ok(lock.get(token).map(|item| item.clone()))
      }
    }
  }
}
