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
    let tacotron_model =
        load_model_file("/home/bt/dev/voder/tacotron_melgan/tacotron_jit_model_voder_c0cac635.pt");

    let melgan_model =
        load_model_file("/home/bt/dev/voder/tacotron_melgan/melgan_jit_model_voder_c0cac635.pt");

    Self {
      tacotron_model,
      melgan_model,
    }
  }

  pub fn run_tts(&self, text: &str) -> Vec<f32> {
    println!("Text : {:?}", text);
    /*let text_tensor = Tensor::new()
        .new_empty(&[text.len() as i64], (Kind::Int16, Device::Cpu));*/

    // tensor([[45, 46, 11, 62, 52, 58]]) = "hi you"
    //tensor: [104, 105, 37, 50, 48, 121, 111, 117]
    //Text tensor: [45, 46, -22, -9, -11, 62, 52, 58] %20
    // Text tensor: [45, 46, -16, 62, 52, 58] +
    // Text tensor: [45, 46, 11, 62, 52, 58]
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

    /*let mut text_buffer4: Vec<i64> = Vec::new();
    text_buffer.push(45);
    text_buffer.push(46);
    text_buffer.push(11);
    text_buffer.push(62);
    text_buffer.push(52);
    text_buffer.push(58);*/

    println!("Text buffer: {:?}", text_buffer);

    let text_tensor = Tensor::of_slice(text_buffer.as_slice());

    println!("Text tensor: {:?}", text_tensor);

    let text_tensor = text_tensor.unsqueeze(0);

    println!("Text tensor unsq: {:?}", text_tensor);

    /*for ch in text {
      text_tensor.set
    }*/

    // TODO
    // Loaded Text tensor: Tensor[[1, 62], Int64]
    /*let text_tensor =
        load_wrapped_tensor_file("/home/bt/dev/voder/data/text/tacotron_text_sequence.pt.containerized.pt");
    println!("Loaded Text tensor: {:?}", text_tensor);*/

    let mut mel_tensor = self.tacotron_model.forward(&text_tensor);
    let audio_tensor = self.melgan_model.forward(&mel_tensor);

    audio_tensor_to_audio_signal(audio_tensor)
  }

  pub fn run_tts_audio(&self, text: &str) -> Vec<u8> {
    let audio_signal = self.run_tts(text);

    let spec = WavSpec {
      channels: 1,
      sample_rate: 16000,
      bits_per_sample: 32,
      sample_format: SampleFormat::Float,
    };

    let bytes : Vec<u8> = Vec::new();
    let seek : Cursor<Vec<u8>> = Cursor::new(bytes);
    let mut buffer = BufWriter::new(seek);

    {
      let mut writer = WavWriter::new(&mut buffer, spec).unwrap();
      for s in audio_signal {
        let s = s * 0.0001f32; // TODO: Temporary fix for audio
        writer.write_sample(s).unwrap();
      }
      writer.finalize().unwrap(); // TODO: Error
    }

    //let mut writer = hound::WavWriter::create(filename, spec).unwrap();

    /*for sample in audio_signal {
      let sample = sample * 0.0001f32;
      writer.write_sample(sample).unwrap();
    }*/

    match buffer.into_inner() {
      Err(_) => { Vec::new() }, // TODO: Error
      Ok(r) => { r.get_ref().to_vec() },
    }
  }
}
