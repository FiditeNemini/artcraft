use anyhow::Result as AnyhowResult;
use arpabet::Arpabet;
use crate::inference::audio::Base64WaveAudio;
use crate::inference::inference::{InferencePipelineStart, InferencePipelineMelDone, InferencePipelineAudioDone, InferencePipelineTextCleaningDone};
use crate::inference::spectrogram::Base64MelSpectrogram;
use crate::inference::spectrogram::MelSpectrogram;
use crate::model::arpabet_glow_tts_model::ArpabetGlowTtsModel;
use crate::model::melgan_model::MelganModel;
use crate::model::pipelines::{mel_audio_tensor_to_audio_signal, audio_signal_to_wav_bytes};
use crate::text::arpabet::text_to_arpabet_encoding_glow_tts;
use tch::Tensor;
use crate::text::cleaners::clean_text;
use crate::inference::vocoder_model::VocoderModelT;
use crate::inference::tts_model::TtsModelT;
use std::sync::Arc;

pub struct GlowTtsMelganPipeline {
  glow_tts: Arc<dyn TtsModelT>,
  melgan: Arc<dyn VocoderModelT>,
}

pub struct GlowTtsMelganPipelineTextCleaningDone {
  glow_tts: Arc<dyn TtsModelT>,
  melgan: Arc<dyn VocoderModelT>,
  cleaned_text: String,
}

pub struct GlowTtsMelganPipelineMelDone {
  glow_tts: Arc<dyn TtsModelT>,
  melgan: Arc<dyn VocoderModelT>,
  mel_tensor: Tensor,
  mel_spectrogram: MelSpectrogram,
}

pub struct GlowTtsMelganPipelineAudioDone {
  glow_tts: Arc<dyn TtsModelT>,
  melgan: Arc<dyn VocoderModelT>,
  mel_tensor: Tensor,
  mel_spectrogram: MelSpectrogram,
  audio_tensor: Tensor,
  wav_audio_signal: Vec<u8>
}

impl GlowTtsMelganPipeline  {
  pub fn new(glow_tts: Arc<dyn TtsModelT>, melgan: Arc<dyn VocoderModelT>) -> Self {
    Self {
      glow_tts,
      melgan,
    }
  }
}

impl InferencePipelineStart for GlowTtsMelganPipeline {
  type TtsModel = Arc<dyn TtsModelT>;
  type VocoderModel = Arc<dyn VocoderModelT>;

  fn clean_text(self, text: &str)
    -> AnyhowResult<Box<dyn InferencePipelineTextCleaningDone<TtsModel=Self::TtsModel, VocoderModel=Self::VocoderModel>>>
  {
    let cleaned_text = clean_text(text);

    Ok(Box::new(GlowTtsMelganPipelineTextCleaningDone {
      glow_tts: self.glow_tts,
      melgan: self.melgan,
      cleaned_text: cleaned_text,
    }))
  }
}

impl InferencePipelineTextCleaningDone for GlowTtsMelganPipelineTextCleaningDone {
  type TtsModel = Arc<dyn TtsModelT>;
  type VocoderModel = Arc<dyn VocoderModelT>;

  fn infer_mel(self, _speaker_id: i64)
    -> AnyhowResult<Box<dyn InferencePipelineMelDone<TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel>>>
  {
    // TODO: Creating arpabet instances every time is inefficient (even if lazy_static! under the hood).
    let arpabet = Arpabet::load_cmudict();
    let arpabet_encodings = text_to_arpabet_encoding_glow_tts(arpabet, &self.cleaned_text);

    let mel_tensor = self.glow_tts.encoded_sequence_to_mel_single_speaker(&arpabet_encodings);

    let spectrogram = {
      let dims = mel_tensor.size3().expect("This should work");

      let mut spectrogram = MelSpectrogram::default();
      spectrogram.height = dims.1;
      spectrogram.width = dims.2;

      let length = dims.0 * dims.1 * dims.2;
      let mut data = [0.0f32].repeat(length as usize);
      mel_tensor.copy_data(data.as_mut_slice(), length as usize);

      // NB: The real maxima and minima are +/-inf, but I don't want to deal with that.
      let mut max_value = -100000.0f32;
      let mut min_value = 100000.0f32;

      for sample in data.iter() {
        if *sample < min_value {
          min_value = *sample;
        } else if *sample > max_value {
          max_value = *sample;
        }
      }

      let mut scaled_data = Vec::with_capacity(data.len());
      for sample in data {
        let scaled_sample = ( (255.0f32 - 0.0f32) * (sample - min_value) ) / ( max_value - min_value );
        scaled_data.push(scaled_sample);
      }

      let bytes : Vec<u8> = scaled_data.iter().map(|s| *s as u8).collect();

      spectrogram.bytes = bytes;
      spectrogram
    };

    Ok(Box::new(GlowTtsMelganPipelineMelDone {
      glow_tts: self.glow_tts,
      melgan: self.melgan,
      mel_tensor: mel_tensor,
      mel_spectrogram: spectrogram,
    }))
  }
}

impl InferencePipelineMelDone for GlowTtsMelganPipelineMelDone {
  type TtsModel = Arc<dyn TtsModelT>;
  type VocoderModel = Arc<dyn VocoderModelT>;

  fn infer_audio(self: Box<Self>)
    -> AnyhowResult<Box<dyn InferencePipelineAudioDone<TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel>>>
  {
    let audio_tensor = self.melgan.mel_to_audio(&self.mel_tensor);

    let raw_audio_signal = mel_audio_tensor_to_audio_signal(&audio_tensor);
    let wav_audio_signal = audio_signal_to_wav_bytes(raw_audio_signal);

    Ok(Box::new(GlowTtsMelganPipelineAudioDone {
      glow_tts: self.glow_tts,
      melgan: self.melgan,
      mel_tensor: self.mel_tensor,
      mel_spectrogram: self.mel_spectrogram,
      audio_tensor: audio_tensor,
      wav_audio_signal: wav_audio_signal,
    }))
  }
}

impl InferencePipelineAudioDone for GlowTtsMelganPipelineAudioDone {
  type TtsModel = Arc<dyn TtsModelT>;
  type VocoderModel = Arc<dyn VocoderModelT>;

  fn get_base64_mel_spectrogram(&self) -> AnyhowResult<Base64MelSpectrogram> {
    let base64_bytes = base64::encode(&self.mel_spectrogram.bytes);

    Ok(Base64MelSpectrogram {
      bytes_base64: base64_bytes,
      width: self.mel_spectrogram.width,
      height: self.mel_spectrogram.height,
    })
  }

  fn get_base64_audio(&self) -> AnyhowResult<Base64WaveAudio> {
    let base64_bytes = base64::encode(&self.wav_audio_signal);
    Ok(Base64WaveAudio {
      bytes_base64: base64_bytes,
    })
  }
}
