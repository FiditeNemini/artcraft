use anyhow::{Result, Error};
use crate::inference::tts_model::TtsModelT;
use crate::model::model_container::ModelContainer;
use crate::text::arpabet::text_to_arpabet_encoding_glow_tts;
use std::path::Path;
use std::thread;
use std::time::Duration;
use tch::Tensor;

pub struct ArpabetGlowTtsModel {
  model_container: ModelContainer,
}

impl ArpabetGlowTtsModel {
  pub fn load(filename: &Path) -> Result<Self> {
    let model_container = ModelContainer::load(filename)?;
    Ok(Self {
      model_container,
    })
  }

  pub fn encoded_arpabet_to_mel(&self, arpabet_encodings: &Vec<i64>) -> Tensor {
    let text_tensor = Tensor::of_slice(&arpabet_encodings.as_slice());
    let text_tensor_2d = text_tensor.unsqueeze(0); // Add another axis

    let lengths = [arpabet_encodings.len() as i64];
    let lengths_tensor = Tensor::of_slice(&lengths);

    self.model_container.forward2(&text_tensor_2d, &lengths_tensor)
  }
}

impl TtsModelT for ArpabetGlowTtsModel {
  fn encoded_sequence_to_mel(&self, arpabet_encodings: &Vec<i64>, _speaker_id: i64) -> Tensor {
    self.encoded_arpabet_to_mel(arpabet_encodings)
  }

  fn encoded_sequence_to_mel_single_speaker(&self, arpabet_encodings: &Vec<i64>) -> Tensor {
    self.encoded_arpabet_to_mel(arpabet_encodings)
  }
}
