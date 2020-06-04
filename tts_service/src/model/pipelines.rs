use arpabet::Arpabet;
use crate::model::arpabet_tacotron_model::ArpabetTacotronModel;
use crate::model::melgan_model::MelganModel;
use crate::model::old_model::TacoMelModel;
use crate::text::arpabet::{text_to_arpabet_encoding, text_to_arpabet_encoding_glow_tts};
use hound::SampleFormat;
use hound::WavSpec;
use hound::WavWriter;
use std::io::{Cursor, BufWriter};
use tch::Tensor;
use crate::model::arpabet_glow_tts_model::ArpabetGlowTtsModel;

// TODO: This might be useful to implement as a multi-stage
//  state machine struct with functions, that way you can pull out
//  intermediate pieces (eg. text to send to the db, or reject the request)

pub fn arpabet_glow_tts_melgan_pipeline(
  cleaned_text: &str,
  arpabet_glow_tts: &ArpabetGlowTtsModel,
  melgan: &MelganModel) -> Option<Vec<u8>> {

  let arpabet = Arpabet::load_cmudict(); // TODO: Inefficient.
  let arpabet_sentence = text_to_arpabet_encoding_glow_tts(arpabet, &cleaned_text);

  let mel_tensor = arpabet_glow_tts.encoded_arpabet_to_mel(&arpabet_sentence);

  let audio_tensor = melgan.tacotron_mel_to_audio(&mel_tensor);
  let audio_signal = mel_audio_tensor_to_audio_signal(audio_tensor);

  let wav = audio_signal_to_wav_bytes(audio_signal);
  Some(wav)
}

pub fn arpabet_tacotron_melgan_pipeline(
  cleaned_text: &str,
  arpabet_tacotron: &ArpabetTacotronModel,
  melgan: &MelganModel) -> Option<Vec<u8>> {

  let arpabet = Arpabet::load_cmudict(); // TODO: Inefficient.
  let encoded = text_to_arpabet_encoding(arpabet, &cleaned_text);

  let mel_tensor = match arpabet_tacotron.encoded_arpabet_to_mel(&encoded) {
    None => return None,
    Some(mel) => mel,
  };

  let audio_tensor = melgan.tacotron_mel_to_audio(&mel_tensor);
  let audio_signal = mel_audio_tensor_to_audio_signal(audio_tensor);

  let wav = audio_signal_to_wav_bytes(audio_signal);
  Some(wav)
}

/// Convert mel spectrogram with audio into an audio signal
fn mel_audio_tensor_to_audio_signal(mel: Tensor) -> Vec<i16> {
  let flat_audio_tensor = mel.squeeze();

  let length = flat_audio_tensor.size1().unwrap() as usize;
  let mut data = [0.0f32].repeat(length);

  flat_audio_tensor.copy_data(data.as_mut_slice(), length as usize);

  data.iter().map(|x| x.trunc() as i16).collect()
}

/// Convert vector-encoded sound into a wave file.
fn audio_signal_to_wav_bytes(audio_signal: Vec<i16>) -> Vec<u8> {
  let spec = WavSpec {
    channels: 1,
    sample_rate: 20000,
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
