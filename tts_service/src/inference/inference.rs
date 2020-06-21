use anyhow::Result as AnyhowResult;
use crate::inference::spectrogram::Base64MelSpectrogram;
use crate::inference::audio::Base64WaveAudio;

pub trait InferencePipelineStart {
  fn infer_mel<'a>(&'a self, text: &str, speaker_id: i32) -> AnyhowResult<Box<dyn InferencePipelineMelDone + 'a>>;
}

pub trait InferencePipelineMelDone {
  //fn infer_audio(self) -> AnyhowResult<Box<dyn InferencePipelineAudioDone + 'a>>;
  //fn infer_audio(&'a self);
}

pub trait InferencePipelineAudioDone {
  fn get_base64_mel_spectrogram(&self) -> AnyhowResult<Base64MelSpectrogram>;
  fn get_base64_audio(&self) -> AnyhowResult<Base64WaveAudio>;
}
