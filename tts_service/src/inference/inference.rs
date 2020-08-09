use anyhow::Result as AnyhowResult;
use crate::inference::audio::Base64WaveAudio;
use crate::inference::pipelines::glowtts_multispeaker_melgan::GlowTtsMultiSpeakerMelganPipelineMelDone;
use crate::inference::spectrogram::Base64MelSpectrogram;
use arpabet::Arpabet;
use grapheme_to_phoneme::Model;

/// 1) Stage of the pipeline before work is done.
pub trait InferencePipelineStart {
  type TtsModel;
  type VocoderModel;

  fn clean_text(self: Box<Self>, text: &str)
    -> AnyhowResult<Box<dyn InferencePipelineTextCleaningDone<TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel>>>;
}

/// 2) Stage of the pipeline after text is cleaned.
pub trait InferencePipelineTextCleaningDone {
  type TtsModel;
  type VocoderModel;

  fn infer_mel(self: Box<Self>, speaker_id: i64, arpabet: &Arpabet, g2p_model: &Model)
    -> AnyhowResult<Box<dyn InferencePipelineMelDone<TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel>>>;
}

/// 3) Stage of the pipeline after the mel is computed.
pub trait InferencePipelineMelDone {
  type TtsModel;
  type VocoderModel;

  fn infer_audio(self: Box<Self>, sample_rate_hz: u32)
    -> AnyhowResult<Box<dyn InferencePipelineAudioDone<TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel>>>;
}

/// 4) Stage of the pipeline after the audio is computed.
pub trait InferencePipelineAudioDone {
  type TtsModel;
  type VocoderModel;

  fn get_base64_mel_spectrogram(&self) -> AnyhowResult<Base64MelSpectrogram>;
  fn get_base64_audio(&self) -> AnyhowResult<Base64WaveAudio>;
}
