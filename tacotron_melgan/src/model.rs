use hound::SampleFormat;
use hound::WavSpec;
use hound::WavWriter;

use tch::{CModule, Device, Kind};
use tch::Tensor;
use tch::nn::Module;
use tch;

use std::io::Cursor;
use std::io::BufWriter;

use melgan::audio_tensor_to_audio_signal;

/// Load a Torch model
pub fn load_model_file(filename: &str) -> CModule {
  println!("Loading model: {}", filename);
  tch::CModule::load(filename).unwrap()
}

/// This is a _HACK_ to load a single Tensor.
///
/// It seems currently impossible to load tensors into tch.rs (libtorch),
/// (eg with 'Tensor::load(filename)') that are saved from pytorch. They
/// use different serialization formats. Luckily, I can embed a tensor in
/// a JIT module and unpack it from there instead. The most
/// straightforward way of getting it out is to define a 'forward()'
/// method that simply returns the wrapped tensor.
///
/// I wrote a script to wrap tensors: 'jit_containerize_tensor.py'.
pub fn load_wrapped_tensor_file(filename: &str) -> Tensor {
  println!("Loading wrapped tensor file: {}", filename);
  let module = tch::CModule::load(filename).unwrap();
  let mut temp = Tensor::zeros(
    &[10, 10, 10],
    (tch::Kind::Float, tch::Device::Cpu)
  );
  module.forward(&temp)
}

pub struct TacoMelModel {
  tacotron_model: CModule,
  melgan_model: CModule,
}

impl TacoMelModel {

  pub fn create(tacotron_filename: &str, melgan_filename: &str) -> Self {
    let tacotron_model = load_model_file(tacotron_filename);
    let melgan_model = load_model_file(melgan_filename);

    Self {
      tacotron_model,
      melgan_model,
    }
  }

  pub fn run_tts(&self, text: &str) -> Vec<f32> {
    println!("Text : {:?}", text);
    let copied = text.to_string().to_ascii_lowercase();
    let mut text_buffer : Vec<i64> = Vec::new();

    for ch in copied.chars() {
      // TODO: HORRIBLE EXPERIMENTAL HACK. Write a formal module to clean and process text
      let mut v = ch as i64 - 59;
      if v < 1 {
        v = 11; // NB: Space
      }
      text_buffer.push(v);
    }

    println!("Text buffer: {:?}", text_buffer);

    let text_tensor = Tensor::of_slice(text_buffer.as_slice());

    println!("Text tensor: {:?}", text_tensor);

    let text_tensor = text_tensor.unsqueeze(0);

    println!("Text tensor unsq: {:?}", text_tensor);

    //let mut mel_tensor = self.tacotron_model.forward(&text_tensor);

    println!("Loading mel...");
    let mel_tensor = load_wrapped_tensor_file("/home/bt/dev/tacotron-melgan/saved_mel.pt.containerized.pt");

    println!("\n\n>>> Mel tensor:\n{:?}\n\n", mel_tensor);

    //let repr = mel_tensor.to_string(20000).unwrap();
    //println!("\n{:?}\n\n", repr);

    println!("Running melgan...");

    let audio_tensor = self.melgan_model.forward(&mel_tensor);

    println!("\n\n>>> Audio tensor:\n{:?}\n\n", audio_tensor);

    audio_tensor_to_audio_signal(audio_tensor)
  }

  pub fn run_tts_audio(&self, text: &str) -> Vec<u8> {
    let audio_signal = self.run_tts(text);

    audio_signal_to_wav_bytes(audio_signal)
  }
}

pub fn audio_signal_to_wav_bytes(audio_signal: Vec<f32>) -> Vec<u8> {
  let spec = WavSpec {
    channels: 1,
    sample_rate: 16000,
    bits_per_sample: 32,
    sample_format: SampleFormat::Float,
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
