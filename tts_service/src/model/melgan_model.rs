use crate::model::model_container::ModelContainer;
use anyhow::Result;
use tch::Tensor;
use std::path::Path;
use crate::inference::vocoder_model::VocoderModelT;

pub struct MelganModel {
  model_container: ModelContainer,
}

impl MelganModel {
  pub fn load(filename: &Path) -> Result<Self> {
    let model_container = ModelContainer::load(filename)?;
    Ok(Self {
      model_container,
    })
  }

  pub fn tacotron_mel_to_audio(&self, mel_tensor: &Tensor) -> Tensor {
    self.model_container.forward(&mel_tensor)
  }
}

impl VocoderModelT for MelganModel {
  fn mel_to_audio(&self, mel_tensor: &Tensor) -> Tensor {
    self.model_container.forward(&mel_tensor)
  }
}
