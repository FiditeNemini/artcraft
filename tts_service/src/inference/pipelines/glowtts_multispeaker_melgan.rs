use anyhow::Result as AnyhowResult;
use crate::model::melgan_model::MelganModel;
use crate::model::arpabet_glow_tts_multi_speaker_model::ArpabetGlowTtsMultiSpeakerModel;
use crate::inference::inference::{InferencePipelineStart, InferencePipelineMelDone, InferencePipelineAudioDone};
use tch::Tensor;
use crate::inference::audio::Base64WaveAudio;
use crate::inference::spectrogram::Base64MelSpectrogram;

struct GlowTtsMultiSpeakerMelganPipeline<'a> {
  glow_tts: &'a ArpabetGlowTtsMultiSpeakerModel,
  melgan: &'a MelganModel,
}

struct GlowTtsMultiSpeakerMelganPipelineMelDone<'a> {
  glow_tts: &'a ArpabetGlowTtsMultiSpeakerModel,
  melgan: &'a MelganModel,
  mel: Option<Tensor>,
}

struct GlowTtsMultiSpeakerMelganPipelineAudioDone<'a> {
  glow_tts: &'a ArpabetGlowTtsMultiSpeakerModel,
  melgan: &'a MelganModel,
  mel: Option<Tensor>,
  wave_audio: Option<Tensor>,
}

impl <'a> GlowTtsMultiSpeakerMelganPipeline <'a> {
  pub fn new(glow_tts: &'a ArpabetGlowTtsMultiSpeakerModel, melgan: &'a MelganModel) -> Self {
    Self {
      glow_tts,
      melgan,
    }
  }
}

impl InferencePipelineStart for GlowTtsMultiSpeakerMelganPipeline <'_> {
  fn infer_mel<'a>(&'a self, text: &str, speaker_id: i32) -> AnyhowResult<Box<dyn InferencePipelineMelDone + 'a>> {
    let inner = GlowTtsMultiSpeakerMelganPipelineMelDone {
      glow_tts: self.glow_tts,
      melgan: self.melgan,
      mel: None,
    };

    let outer : Box<dyn InferencePipelineMelDone> = Box::new(inner);

    Ok(outer)
  }
}

impl <'a> InferencePipelineMelDone for GlowTtsMultiSpeakerMelganPipelineMelDone <'a> {
  /*fn infer_audio(&'a self) {
    unimplemented!()
  }*/
  /*fn infer_audio(self) -> AnyhowResult<Box<dyn InferencePipelineAudioDone + 'a>> {
    Ok(Box::new(GlowTtsMultiSpeakerMelganPipelineAudioDone {
      glow_tts: self.glow_tts,
      melgan: self.melgan,
      mel: None,
      wave_audio: None,
    }))
  }*/
}

/*impl <'a> InferencePipelineAudioDone for GlowTtsMultiSpeakerMelganPipelineAudioDone <'a> {
  fn get_base64_mel_spectrogram(&self) -> AnyhowResult<Base64MelSpectrogram> {
    unimplemented!()
  }

  fn get_base64_audio(&self) -> AnyhowResult<Base64WaveAudio> {
    unimplemented!()
  }
}*/
