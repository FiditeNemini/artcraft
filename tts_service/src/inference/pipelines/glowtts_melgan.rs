use anyhow::Result as AnyhowResult;
use arpabet::Arpabet;
use crate::inference::audio::Base64WaveAudio;
use crate::inference::inference::{InferencePipelineStart, InferencePipelineMelDone, InferencePipelineAudioDone};
use crate::inference::spectrogram::Base64MelSpectrogram;
use crate::inference::spectrogram::MelSpectrogram;
use crate::model::arpabet_glow_tts_model::ArpabetGlowTtsModel;
use crate::model::melgan_model::MelganModel;
use crate::model::pipelines::{mel_audio_tensor_to_audio_signal, audio_signal_to_wav_bytes};
use crate::text::arpabet::text_to_arpabet_encoding_glow_tts;
use tch::Tensor;

pub struct GlowTtsMelganPipeline<'a> {
  glow_tts: &'a ArpabetGlowTtsModel,
  melgan: &'a MelganModel,
}

pub struct GlowTtsMelganPipelineMelDone<'a> {
  glow_tts: &'a ArpabetGlowTtsModel,
  melgan: &'a MelganModel,
  mel_tensor: Tensor,
  mel_spectrogram: MelSpectrogram,
}

pub struct GlowTtsMelganPipelineAudioDone<'a> {
  glow_tts: &'a ArpabetGlowTtsModel,
  melgan: &'a MelganModel,
  mel_tensor: Tensor,
  mel_spectrogram: MelSpectrogram,
  audio_tensor: Tensor,
  wav_audio_signal: Vec<u8>
}

impl <'a> GlowTtsMelganPipeline <'a> {
  pub fn new(glow_tts: &'a ArpabetGlowTtsModel, melgan: &'a MelganModel) -> Self {
    Self {
      glow_tts,
      melgan,
    }
  }
}

impl <'a> InferencePipelineStart<'a> for GlowTtsMelganPipeline<'a> {
  type TtsModel = &'a ArpabetGlowTtsModel;
  type VocoderModel = &'a MelganModel;

  fn infer_mel(self, text: &str, _speaker_id: i64)
    -> AnyhowResult<Box<dyn InferencePipelineMelDone<'a, TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel> + 'a>>
  {
    // TODO: Creating arpabet instances every time is inefficient (even if lazy_static! under the hood).
    let arpabet = Arpabet::load_cmudict();
    let arpabet_encodings = text_to_arpabet_encoding_glow_tts(arpabet, &text);

    let mel_tensor = self.glow_tts.encoded_arpabet_to_mel(&arpabet_encodings);

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

    let boxed : Box<GlowTtsMelganPipelineMelDone<'a>> = Box::new(GlowTtsMelganPipelineMelDone {
      glow_tts: self.glow_tts,
      melgan: self.melgan,
      mel_tensor: mel_tensor,
      mel_spectrogram: spectrogram,
    });

    Ok(boxed)
  }
}

impl <'a> InferencePipelineMelDone<'a> for GlowTtsMelganPipelineMelDone<'a> {
  type TtsModel = &'a ArpabetGlowTtsModel;
  type VocoderModel = &'a MelganModel;

  fn infer_audio(self: Box<Self>)
    -> AnyhowResult<Box<dyn InferencePipelineAudioDone<'a, TtsModel = Self::TtsModel, VocoderModel = Self::VocoderModel> + 'a>>
  {
    let audio_tensor = self.melgan.tacotron_mel_to_audio(&self.mel_tensor);

    let raw_audio_signal = mel_audio_tensor_to_audio_signal(&audio_tensor);
    let wav_audio_signal = audio_signal_to_wav_bytes(raw_audio_signal);

    let boxed : Box<GlowTtsMelganPipelineAudioDone<'a>> = Box::new(GlowTtsMelganPipelineAudioDone {
      glow_tts: self.glow_tts,
      melgan: self.melgan,
      mel_tensor: self.mel_tensor,
      mel_spectrogram: self.mel_spectrogram,
      audio_tensor: audio_tensor,
      wav_audio_signal: wav_audio_signal,
    });

    Ok(boxed)
  }
}

impl <'a> InferencePipelineAudioDone<'_> for GlowTtsMelganPipelineAudioDone <'a> {
  type TtsModel = &'a ArpabetGlowTtsModel;
  type VocoderModel = &'a MelganModel;

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
