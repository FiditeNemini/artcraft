use anyhow::Result as AnyhowResult;
use crate::inference::spectrogram::Base64MelSpectrogram;
use crate::inference::audio::Base64WaveAudio;
use crate::inference::pipelines::glowtts_multispeaker_melgan::GlowTtsMultiSpeakerMelganPipelineMelDone;

// declare a lifetime 'b that lives at least as long as 'a by declaring 'b using the syntax 'b: 'a.
pub trait InferencePipelineStart <'a> {
  type State;
  //fn infer_mel<'b>(self, text: &'b str, speaker_id: i32) -> AnyhowResult<Box<dyn InferencePipelineMelDone<'a> + 'a>>;

  //fn infer_mel(self, text: &str, speaker_id: i32)
  //   -> AnyhowResult<GlowTtsMultiSpeakerMelganPipelineMelDone<'a>>;

  fn return_inner(self) -> Self::State;
}

pub trait InferencePipelineMelDone <'b> {
  //fn infer_audio(self) -> AnyhowResult<Box<dyn InferencePipelineAudioDone + 'a>>;
  //fn infer_audio(&'a self);
}

pub trait InferencePipelineAudioDone {
  fn get_base64_mel_spectrogram(&self) -> AnyhowResult<Base64MelSpectrogram>;
  fn get_base64_audio(&self) -> AnyhowResult<Base64WaveAudio>;
}
