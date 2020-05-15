use hound::SampleFormat;
use hound::WavSpec;
use hound::WavWriter;

use tch::CModule;
use tch::Tensor;
use tch::nn::Module;
use tch::nn::ModuleT;

use std::io::Cursor;
use std::io::BufWriter;

use crate::model::arpabet_tacotron_model::ArpabetTacotronModel;
use crate::model::model_container::ModelContainer;
use crate::model::melgan_model::MelganModel;

pub struct TacoMelModel {
}

impl TacoMelModel {
  fn load_model_file(filename: &str) -> CModule {
    println!("Loading model: {}", filename);
    CModule::load(filename).unwrap()
  }

  pub fn new() -> Self {
    Self {}
  }

  /*pub fn run_tts_audio(&self, text: &str) -> Vec<u8> {
    let audio_signal = self.run_tts(text);
    Self::audio_signal_to_wav_bytes(audio_signal)
  }

  fn run_tts(&self, text: &str) -> Vec<i16> {
    println!("Text : {:?}", text);
    let copied = text.to_string().to_ascii_lowercase();
    let mut text_buffer : Vec<i64> = Vec::new();

    for ch in copied.chars() {
      // TODO: HORRIBLE EXPERIMENTAL HACK.
      // Write a formal module to clean and process text
      let mut v = ch as i64 - 59;
      if v < 1 {
        v = 11; // NB: Space
      }
      text_buffer.push(v);
    }

    println!("Text buffer: {:?}", text_buffer);

    self.encoded_text_to_audio_signal(&text_buffer)
  }*/

  /// Run TTS on Arpabet encoding
  pub fn run_tts_encoded(&self, tacotron: &ArpabetTacotronModel, melgan: &MelganModel, encoded_text: &Vec<i64>) -> Vec<u8> {
    let audio_signal = self.encoded_text_to_audio_signal(tacotron, melgan, encoded_text);
    Self::audio_signal_to_wav_bytes(audio_signal)
  }

  fn encoded_text_to_audio_signal(&self, tacotron: &ArpabetTacotronModel, melgan: &MelganModel, text_buffer: &Vec<i64>) -> Vec<i16> {
    let mut mel_tensor = tacotron.encoded_arpabet_to_mel(&text_buffer);
    println!("\n\n>>> Mel tensor:\n{:?}\n\n", mel_tensor);
    println!("Running melgan...");
    let audio_tensor = melgan.tacotron_mel_to_audio(&mel_tensor);
    println!("\n\n>>> Audio tensor:\n{:?}\n\n", audio_tensor);
    Self::audio_tensor_to_audio_signal(audio_tensor)
  }

  fn audio_tensor_to_audio_signal(mel: Tensor) -> Vec<i16> {
    let mut flat_audio_tensor = mel.squeeze();

    println!("Sqeueezed tensor: {:?}, dim: {}",
      flat_audio_tensor,
      flat_audio_tensor.dim());

    let length = flat_audio_tensor.size1().unwrap() as usize;
    println!("Length: {}", length);

    let mut data : Vec<f32> = Vec::with_capacity(length);

    for i in 0 .. length {
      data.push(0.0f32);
    }

    flat_audio_tensor.copy_data(data.as_mut_slice(), length as usize);

    data.iter().map(|x| x.trunc() as i16).collect()
  }

  pub fn audio_signal_to_wav_bytes(audio_signal: Vec<i16>) -> Vec<u8> {
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
}
