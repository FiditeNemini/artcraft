use hound::SampleFormat;
use hound::WavSpec;
use hound::WavWriter;

use tch::CModule;
use tch::Tensor;
use tch::nn::Module;
use tch::nn::ModuleT;

use std::io::Cursor;
use std::io::BufWriter;

pub struct TacoMelModel {
  tacotron_model: CModule,
  melgan_model: CModule,
}

impl TacoMelModel {
  fn load_model_file(filename: &str) -> CModule {
    println!("Loading model: {}", filename);
    CModule::load(filename).unwrap()
  }

  pub fn create(tacotron_filename: &str, melgan_filename: &str) -> Self {
    let tacotron_model = Self::load_model_file(tacotron_filename);
    let melgan_model = Self::load_model_file(melgan_filename);

    Self {
      tacotron_model,
      melgan_model,
    }
  }

  pub fn run_tts(&self, text: &str) -> Vec<i16> {
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
  }

  fn encoded_text_to_audio_signal(&self, text_buffer: &Vec<i64>) -> Vec<i16> {
    let text_tensor = Tensor::of_slice(text_buffer.as_slice());
    println!("Text tensor: {:?}", text_tensor);
    let text_tensor = text_tensor.unsqueeze(0);
    println!("Text tensor unsq: {:?}", text_tensor);
    let mut mel_tensor = self.tacotron_model.forward(&text_tensor);
    println!("\n\n>>> Mel tensor:\n{:?}\n\n", mel_tensor);
    println!("Running melgan...");
    let audio_tensor = self.melgan_model.forward(&mel_tensor);
    println!("\n\n>>> Audio tensor:\n{:?}\n\n", audio_tensor);
    Self::audio_tensor_to_audio_signal(audio_tensor)
  }

  pub fn run_tts_audio(&self, text: &str) -> Vec<u8> {
    let audio_signal = self.run_tts(text);
    Self::audio_signal_to_wav_bytes(audio_signal)
  }

  pub fn run_tts_encoded(&self, encoded_text: &Vec<i64>) -> Vec<u8> {
    let audio_signal = self.encoded_text_to_audio_signal(encoded_text);
    Self::audio_signal_to_wav_bytes(audio_signal)
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
