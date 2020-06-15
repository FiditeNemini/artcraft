use crate::model::model_container::ModelContainer;
use anyhow::{Result, Error};
use std::path::Path;
use std::thread;
use std::time::Duration;
use tch::Tensor;
use crate::text::arpabet::text_to_arpabet_encoding_glow_tts;

pub struct ArpabetGlowTtsMultiSpeakerModel {
  model_container: ModelContainer,
}

impl ArpabetGlowTtsMultiSpeakerModel {
  pub fn load(filename: &Path) -> Result<Self> {
    let model_container = ModelContainer::load(filename)?;
    Ok(Self {
      model_container,
    })
  }

  pub fn encoded_arpabet_to_mel(&self, arpabet_encodings: &Vec<i64>, speaker_id: i64) -> Tensor {
    let text_tensor = Tensor::of_slice(&arpabet_encodings.as_slice());
    let text_tensor_2d = text_tensor.unsqueeze(0); // Add another axis

    let lengths = [arpabet_encodings.len() as i64];
    let lengths_tensor = Tensor::of_slice(&lengths);

    let speaker = [speaker_id];
    let speaker_tensor = Tensor::of_slice(&speaker);

    self.model_container.forward3(&text_tensor_2d, &lengths_tensor, &speaker_tensor)
  }
}
