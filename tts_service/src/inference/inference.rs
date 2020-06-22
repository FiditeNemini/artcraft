use anyhow::Result as AnyhowResult;
use crate::inference::spectrogram::Base64MelSpectrogram;
use crate::inference::audio::Base64WaveAudio;
use crate::inference::pipelines::glowtts_multispeaker_melgan::GlowTtsMultiSpeakerMelganPipelineMelDone;

/// 1) Stage of the pipeline before work is done.
pub trait InferencePipelineStart <'a> {
  type TtsModel;
  type VocoderModel;

  fn clean_text(self, text: &str)
    -> AnyhowResult<Box<dyn InferencePipelineTextCleaningDone<'a, TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel> + 'a>>;
}

/// 2) Stage of the pipeline after text is cleaned.
pub trait InferencePipelineTextCleaningDone <'b> {
  type TtsModel;
  type VocoderModel;

  fn infer_mel(self, speaker_id: i64)
    -> AnyhowResult<Box<dyn InferencePipelineMelDone<'b, TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel> + 'b>>;
}

/// 3) Stage of the pipeline after the mel is computed.
pub trait InferencePipelineMelDone <'c> {
  type TtsModel;
  type VocoderModel;

  fn infer_audio(self: Box<Self>)
    -> AnyhowResult<Box<dyn InferencePipelineAudioDone<'c, TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel> + 'c>>;
}

/// 4) Stage of the pipeline after the audio is computed.
pub trait InferencePipelineAudioDone <'d> {
  type TtsModel;
  type VocoderModel;

  fn get_base64_mel_spectrogram(&self) -> AnyhowResult<Base64MelSpectrogram>;
  fn get_base64_audio(&self) -> AnyhowResult<Base64WaveAudio>;
}
