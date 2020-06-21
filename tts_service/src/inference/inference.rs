use anyhow::Result as AnyhowResult;
use crate::inference::spectrogram::Base64MelSpectrogram;
use crate::inference::audio::Base64WaveAudio;
use crate::inference::pipelines::glowtts_multispeaker_melgan::GlowTtsMultiSpeakerMelganPipelineMelDone;

// declare a lifetime 'b that lives at least as long as 'a by declaring 'b using the syntax 'b: 'a.
pub trait InferencePipelineStart <'a> {
  type TtsModel;
  type VocoderModel;
  //fn infer_mel<'b>(self, text: &'b str, speaker_id: i32) -> AnyhowResult<Box<dyn InferencePipelineMelDone<'a> + 'a>>;

  fn next(self)
    -> AnyhowResult<Box<dyn InferencePipelineMelDone<'a, TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel>>>;
}

pub trait InferencePipelineMelDone <'b> {
  type TtsModel;
  type VocoderModel;

  fn next(self: Box<Self>)
    -> AnyhowResult<Box<dyn InferencePipelineAudioDone<'b, TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel>>>;

  //fn infer_audio(self) -> AnyhowResult<Box<dyn InferencePipelineAudioDone + 'a>>;
  //fn infer_audio(&'a self);
}

pub trait InferencePipelineAudioDone <'c> {
  type TtsModel;
  type VocoderModel;

  fn get_base64_mel_spectrogram(&self) -> AnyhowResult<Base64MelSpectrogram>;
  fn get_base64_audio(&self) -> AnyhowResult<Base64WaveAudio>;
}
