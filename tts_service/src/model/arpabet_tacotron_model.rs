use crate::model::model_container::ModelContainer;
use anyhow::Result;
use tch::Tensor;
use std::path::Path;
use std::sync::{Mutex, MutexGuard, TryLockError};
use std::time::Duration;
use std::thread;

pub struct ArpabetTacotronModel {
  model_container: Mutex<ModelContainer>,
}

impl ArpabetTacotronModel {
  pub fn load(filename: &Path) -> Result<Self> {
    let model_container = ModelContainer::load(filename)?;
    Ok(Self {
      model_container: Mutex::new(model_container),
    })
  }

  pub fn encoded_arpabet_to_mel(&self, text_buffer: &Vec<i64>) -> Option<Tensor> {
    let text_tensor = Tensor::of_slice(text_buffer.as_slice());
    println!("Text tensor: {:?}", text_tensor);

    let text_tensor = text_tensor.unsqueeze(0);
    println!("Text tensor unsq: {:?}", text_tensor);

    // TODO: The Tacotron model is segfaulting when concurrently executed.
    //  I'm going to serialize access for now. I think making the network
    //  non-mutating may fix the issue.
    let mut mel = None;

    for _ in 0 .. 5 {
      match self.model_container.try_lock() {
        Err(_) => {
          thread::sleep(Duration::from_millis(100));
          continue;
        },
        Ok(model) => {
          // This produces the mel, though it will require processing before
          // sending it to MelGan.
          let result = model.forward(&text_tensor);
          mel = Some(result);
          break;
        },
      }
    }

    mel
  }
}
