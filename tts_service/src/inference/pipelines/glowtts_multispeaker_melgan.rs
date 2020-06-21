use anyhow::Result as AnyhowResult;
use crate::model::melgan_model::MelganModel;
use crate::model::arpabet_glow_tts_multi_speaker_model::ArpabetGlowTtsMultiSpeakerModel;
use crate::inference::inference::{InferencePipelineStart, InferencePipelineMelDone, InferencePipelineAudioDone};
use tch::Tensor;
use crate::inference::audio::Base64WaveAudio;
use crate::inference::spectrogram::Base64MelSpectrogram;

pub struct GlowTtsMultiSpeakerMelganPipeline<'a> {
  //glow_tts: &'a ArpabetGlowTtsMultiSpeakerModel,
  //melgan: &'a MelganModel,
  existing_state: &'a str,
}

pub struct GlowTtsMultiSpeakerMelganPipelineMelDone<'b> {
  //glow_tts: &'a ArpabetGlowTtsMultiSpeakerModel,
  //melgan: &'a MelganModel,
  existing_state: &'b str,
  mel: Option<Tensor>,
}

pub struct GlowTtsMultiSpeakerMelganPipelineAudioDone<'c> {
  //glow_tts: &'a ArpabetGlowTtsMultiSpeakerModel,
  //melgan: &'a MelganModel,
  existing_state: &'c str,
  mel: Option<Tensor>,
  wave_audio: Option<Tensor>,
}

impl <'a> GlowTtsMultiSpeakerMelganPipeline <'a> {
  //pub fn new(glow_tts: &'a ArpabetGlowTtsMultiSpeakerModel, melgan: &'a MelganModel) -> Self {
  pub fn new(existing_state: &'a str) -> Self {
    Self {
      //glow_tts,
      //melgan,
      existing_state,
    }
  }
}

impl <'a> InferencePipelineStart<'_> for GlowTtsMultiSpeakerMelganPipeline<'a> {
  type State = &'a str;

  fn return_inner(self) -> Self::State {
    self.existing_state
  }

  /*fn infer_mel<'longer, 'a: 'longer>(self, text: &str, speaker_id: i32) -> AnyhowResult<GlowTtsMultiSpeakerMelganPipelineMelDone<'longer>> {
    let consume: &'longer str = self.existing_state;
    Ok(GlowTtsMultiSpeakerMelganPipelineMelDone {
      //glow_tts: self.glow_tts,
      //melgan: self.melgan,
      existing_state: consume,
      mel: None,
    })
  }*/

  /*fn infer_mel<'b>(self, text: &'b str, speaker_id: i32) -> AnyhowResult<Box<dyn InferencePipelineMelDone<'a> + 'a>> {
    let inner = GlowTtsMultiSpeakerMelganPipelineMelDone {
      //glow_tts: self.glow_tts,
      //melgan: self.melgan,
      existing_state: self.existing_state,
      mel: None,
    };

    let outer : Box<dyn InferencePipelineMelDone<'a>> = Box::new(inner);

    Ok(outer)
  }*/
}

impl InferencePipelineMelDone<'_> for GlowTtsMultiSpeakerMelganPipelineMelDone <'_> {
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

fn test(existing_state: &str) {
  let pipeline = GlowTtsMultiSpeakerMelganPipeline::new(existing_state)
      .return_inner();
}

