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
    let mel_tensor
        = load_wrapped_tensor_file("/home/bt/dev/tacotron-melgan/input_mel.pt.containerized.pt");

    println!("\n\n>>> Mel tensor:\n{:?}\n\n", mel_tensor);

    //let repr = mel_tensor.to_string(20000).unwrap();
    //println!("\n{:?}\n\n", repr);

    /*
    This is the data from Pytorch: "want to go outside".

      # Text
      tensor([[60, 38, 51, 57, 11, 57, 52, 11, 44, 52, 11, 52, 58, 57, 56, 46, 41, 42]])
      # Mel
      torch.Size([1, 80, 133])
      torch.float64
      tensor([[[ -7.3141,  -6.6971,  -6.9072,  ...,  -8.8831,  -8.4337,  -7.9514],
               [ -6.7884,  -6.0337,  -5.9880,  ...,  -7.4524,  -7.2237,  -7.0247],
               [ -6.0898,  -5.1923,  -4.8882,  ...,  -6.3464,  -6.3288,  -6.4104],
               ...,
               [-10.1161, -10.0742,  -9.8574,  ...,  -9.3989,  -9.4183,  -9.3537],
               [-10.1554, -10.1308,  -9.9062,  ...,  -9.4762,  -9.4767,  -9.3855],
               [-10.2204, -10.1800,  -9.9611,  ...,  -9.5313,  -9.5202,  -9.4251]]],
             grad_fn=<TransposeBackward0>)
      Minimum: tensor(-11.3642, requires_grad=True)
      Maximum: tensor(0.4480, requires_grad=True)

    This is the data from Rust: "want to go outside".

      Text : "want%20to%20go%20outside"
      Text tensor: Tensor[[24], Int64]
      Text tensor unsq: Tensor[[1, 24], Int64]
      Text buffer: [60, 38, 51, 57, 11, 11, 11, 57, 52, 11, 11, 11, 44, 52, 11, 11, 11, 52, 58, 57, 56, 46, 41, 42]
      >>> Mel tensor:
      Tensor[[1, 80, 200], Float]

    URLencoding was the cause of the length discrepancy, now only the encoding (float vs int) matters.
    (However, perhaps the payload contents differ in more than just the encoding?)

      Text : "want+to+go+outside"
      Text buffer: [60, 38, 51, 57, 11, 57, 52, 11, 44, 52, 11, 52, 58, 57, 56, 46, 41, 42]
      Text tensor: Tensor[[18], Int64]
      Text tensor unsq: Tensor[[1, 18], Int64]
      >>> Mel tensor:
      Tensor[[1, 80, 133], Float]
    */

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
        let s = s * 0.00001f32; // TODO: Find a more appropriate multiplier
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
