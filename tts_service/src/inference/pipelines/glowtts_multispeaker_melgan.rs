use anyhow::Result as AnyhowResult;
use crate::model::melgan_model::MelganModel;
use crate::model::arpabet_glow_tts_multi_speaker_model::ArpabetGlowTtsMultiSpeakerModel;
use crate::inference::inference::{InferencePipelineStart, InferencePipelineMelDone, InferencePipelineAudioDone};
use tch::Tensor;
use crate::inference::audio::Base64WaveAudio;
use crate::inference::spectrogram::Base64MelSpectrogram;

pub struct GlowTtsMultiSpeakerMelganPipeline<'a> {
  glow_tts: &'a ArpabetGlowTtsMultiSpeakerModel,
  melgan: &'a MelganModel,
}

pub struct GlowTtsMultiSpeakerMelganPipelineMelDone<'b> {
  glow_tts: &'b ArpabetGlowTtsMultiSpeakerModel,
  melgan: &'b MelganModel,
  mel: Option<Tensor>,
}

pub struct GlowTtsMultiSpeakerMelganPipelineAudioDone<'c> {
  glow_tts: &'c ArpabetGlowTtsMultiSpeakerModel,
  melgan: &'c MelganModel,
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

impl <'a> InferencePipelineStart<'a> for GlowTtsMultiSpeakerMelganPipeline<'a> {
  type TtsModel = &'a ArpabetGlowTtsMultiSpeakerModel;
  type VocoderModel = &'a MelganModel;

  fn infer_mel(self, text: &str, speaker_id: i64) -> AnyhowResult<Box<dyn InferencePipelineMelDone<'a, TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel>>> {
    unimplemented!();
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

impl <'a> InferencePipelineMelDone<'a> for Box<GlowTtsMultiSpeakerMelganPipelineMelDone<'a>> {
  type TtsModel = &'a ArpabetGlowTtsMultiSpeakerModel;
  type VocoderModel = &'a MelganModel;

  fn next(self: Box<Self>) -> AnyhowResult<Box<dyn InferencePipelineAudioDone<'a, TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel> + 'a>> {
    let glow_tts : &'a ArpabetGlowTtsMultiSpeakerModel = self.glow_tts;
    let melgan : &'a MelganModel = self.melgan;

    let boxed : Box<GlowTtsMultiSpeakerMelganPipelineAudioDone<'a>> = Box::new(GlowTtsMultiSpeakerMelganPipelineAudioDone {
      glow_tts,
      melgan,
      mel: None,
      wave_audio: None
    });

    Ok(boxed)
  }
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

impl <'a> InferencePipelineAudioDone<'_> for GlowTtsMultiSpeakerMelganPipelineAudioDone <'a> {
  type TtsModel = &'a ArpabetGlowTtsMultiSpeakerModel;
  type VocoderModel = &'a MelganModel;

  fn get_base64_mel_spectrogram(&self) -> AnyhowResult<Base64MelSpectrogram> {
    unimplemented!()
  }

  fn get_base64_audio(&self) -> AnyhowResult<Base64WaveAudio> {
    unimplemented!()
  }
}

fn test(glow: &ArpabetGlowTtsMultiSpeakerModel, melgan: &MelganModel) {
  let pipeline = GlowTtsMultiSpeakerMelganPipeline::new(glow, melgan)
      .infer_mel("test", 1)
      .unwrap()
      .next()
      .unwrap()
      .get_base64_audio();
}

