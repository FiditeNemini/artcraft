use anyhow::Result as AnyhowResult;
use crate::inference::spectrogram::Base64MelSpectrogram;
use crate::inference::audio::Base64WaveAudio;
use crate::inference::pipelines::glowtts_multispeaker_melgan::GlowTtsMultiSpeakerMelganPipelineMelDone;

/// Stage of the pipeline before work is done.
pub trait InferencePipelineStart <'a> {
  type TtsModel;
  type VocoderModel;

  fn infer_mel(self, text: &str, speaker_id: i64)
    -> AnyhowResult<Box<dyn InferencePipelineMelDone<'a, TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel> + 'a>>;
}

/// Stage of the pipeline after the mel is computed.
pub trait InferencePipelineMelDone <'b> {
  type TtsModel;
  type VocoderModel;

  fn infer_audio(self: Box<Self>)
    -> AnyhowResult<Box<dyn InferencePipelineAudioDone<'b, TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel> + 'b>>;
}

/// Stage of the pipeline after the audio is computed.
pub trait InferencePipelineAudioDone <'c> {
  type TtsModel;
  type VocoderModel;

  fn get_base64_mel_spectrogram(&self) -> AnyhowResult<Base64MelSpectrogram>;
  fn get_base64_audio(&self) -> AnyhowResult<Base64WaveAudio>;
}
