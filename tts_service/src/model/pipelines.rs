use arpabet::Arpabet;
use crate::endpoints::speak::speak_with_spectrogram::Spectrogram;
use crate::model::arpabet_glow_tts_model::ArpabetGlowTtsModel;
use crate::model::arpabet_glow_tts_multi_speaker_model::ArpabetGlowTtsMultiSpeakerModel;
use crate::model::arpabet_tacotron_model::ArpabetTacotronModel;
use crate::model::melgan_model::MelganModel;
use crate::model::old_model::TacoMelModel;
use crate::text::arpabet::{text_to_arpabet_encoding, text_to_arpabet_encoding_glow_tts};
use hound::SampleFormat;
use hound::WavSpec;
use hound::WavWriter;
use std::io::{Cursor, BufWriter};
use tch::Tensor;

// TODO: This might be useful to implement as a multi-stage
//  state machine struct with functions, that way you can pull out
//  intermediate pieces (eg. text to send to the db, or reject the request)

pub fn arpabet_glow_tts_multi_speaker_melgan_pipeline(
  cleaned_text: &str,
  speaker_id: i64,
  arpabet_glow_tts: &ArpabetGlowTtsMultiSpeakerModel,
  melgan: &MelganModel,
  sample_rate_hz: u32,
  arpabet: &Arpabet
) -> Vec<u8> {
  let arpabet_encodings = text_to_arpabet_encoding_glow_tts(arpabet, &cleaned_text);

  let mel_tensor = arpabet_glow_tts.encoded_arpabet_to_mel(&arpabet_encodings, speaker_id);

  let audio_tensor = melgan.tacotron_mel_to_audio(&mel_tensor);
  let audio_signal = mel_audio_tensor_to_audio_signal(&audio_tensor);

  audio_signal_to_wav_bytes(audio_signal, sample_rate_hz)
}

pub fn arpabet_glow_tts_multi_speaker_melgan_pipeline_with_spectrogram(
  cleaned_text: &str,
  speaker_id: i64,
  arpabet_glow_tts: &ArpabetGlowTtsMultiSpeakerModel,
  melgan: &MelganModel,
  sample_rate_hz: u32,
  arpabet: &Arpabet
) -> (Spectrogram, Vec<u8>) {
  let arpabet_encodings = text_to_arpabet_encoding_glow_tts(arpabet, &cleaned_text);

  let mel_tensor = arpabet_glow_tts.encoded_arpabet_to_mel(&arpabet_encodings, speaker_id);

  let spectrogram = {
    let dims = mel_tensor.size3().expect("This should work");

    let mut spectrogram = Spectrogram::default();
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

    spectrogram.bytes_base64 = base64::encode(bytes);
    spectrogram
  };

  let audio_tensor = melgan.tacotron_mel_to_audio(&mel_tensor);
  let audio_signal = mel_audio_tensor_to_audio_signal(&audio_tensor);

  (
    spectrogram,
    audio_signal_to_wav_bytes(audio_signal, sample_rate_hz),
  )
}

pub fn arpabet_glow_tts_melgan_pipeline(
  cleaned_text: &str,
  arpabet_glow_tts: &ArpabetGlowTtsModel,
  melgan: &MelganModel,
  sample_rate_hz: u32,
  arpabet: &Arpabet
) -> Vec<u8> {
  let arpabet_encodings = text_to_arpabet_encoding_glow_tts(arpabet, &cleaned_text);

  let mel_tensor = arpabet_glow_tts.encoded_arpabet_to_mel(&arpabet_encodings);

  let audio_tensor = melgan.tacotron_mel_to_audio(&mel_tensor);
  let audio_signal = mel_audio_tensor_to_audio_signal(&audio_tensor);

  audio_signal_to_wav_bytes(audio_signal, sample_rate_hz)
}

pub fn arpabet_glow_tts_melgan_pipeline_with_spectrogram(
  cleaned_text: &str,
  arpabet_glow_tts: &ArpabetGlowTtsModel,
  melgan: &MelganModel,
  sample_rate_hz: u32,
  arpabet: &Arpabet
) -> (Spectrogram, Vec<u8>) {
  let arpabet_encodings = text_to_arpabet_encoding_glow_tts(arpabet, &cleaned_text);

  let mel_tensor = arpabet_glow_tts.encoded_arpabet_to_mel(&arpabet_encodings);

  let spectrogram = {
    let dims = mel_tensor.size3().expect("This should work");

    let mut spectrogram = Spectrogram::default();
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

    spectrogram.bytes_base64 = base64::encode(bytes);
    spectrogram
  };

  let audio_tensor = melgan.tacotron_mel_to_audio(&mel_tensor);
  let audio_signal = mel_audio_tensor_to_audio_signal(&audio_tensor);

  (
    spectrogram,
    audio_signal_to_wav_bytes(audio_signal, sample_rate_hz),
  )
}

pub fn arpabet_tacotron_melgan_pipeline(
  cleaned_text: &str,
  arpabet_tacotron: &ArpabetTacotronModel,
  melgan: &MelganModel,
  sample_rate_hz: u32,
  arpabet: &Arpabet
) -> Option<Vec<u8>> {
  let encoded = text_to_arpabet_encoding(arpabet, &cleaned_text);

  let mel_tensor = match arpabet_tacotron.encoded_arpabet_to_mel(&encoded) {
    None => return None,
    Some(mel) => mel,
  };

  let audio_tensor = melgan.tacotron_mel_to_audio(&mel_tensor);
  let audio_signal = mel_audio_tensor_to_audio_signal(&audio_tensor);

  let wav = audio_signal_to_wav_bytes(audio_signal, sample_rate_hz);
  Some(wav)
}

/// Convert mel spectrogram with audio into an audio signal
pub fn mel_audio_tensor_to_audio_signal(mel: &Tensor) -> Vec<i16> {
  let flat_audio_tensor = mel.squeeze();

  let length = flat_audio_tensor.size1().unwrap() as usize;
  let mut data = [0.0f32].repeat(length);

  flat_audio_tensor.copy_data(data.as_mut_slice(), length as usize);

  data.iter().map(|x| x.trunc() as i16).collect()
}

/// Convert vector-encoded sound into a wave file.
pub fn audio_signal_to_wav_bytes(audio_signal: Vec<i16>, sample_rate_hz: u32) -> Vec<u8> {
  let spec = WavSpec {
    channels: 1,
    sample_rate: sample_rate_hz,
    bits_per_sample: 16,
    sample_format: SampleFormat::Int,
  };
  let bytes: Vec<u8> = Vec::new();
  let seek: Cursor<Vec<u8>> = Cursor::new(bytes);
  let mut buffer = BufWriter::new(seek);
  {
    let mut writer = WavWriter::new(&mut buffer, spec).unwrap();
    for s in audio_signal {
      //let s = s * 0.00001f32; // TODO: Find a more appropriate multiplier
      writer.write_sample(s).unwrap();
    }
    writer.finalize().unwrap(); // TODO: Error
  }
  match buffer.into_inner() {
    Err(_) => { Vec::new() }, // TODO: Error
    Ok(r) => { r.get_ref().to_vec() },
  }
}
