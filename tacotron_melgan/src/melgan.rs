use tch::CModule;
use tch::Tensor;
use tch::nn::Module;
use tch;

use rand::Rng;

use model::{
  load_model,
  load_wrapped_tensor,
};

const WRAPPED_MODEL_PATH : &'static str = "/home/bt/dev/voder/tacotron_melgan/container2.pt";

const EXAMPLE_MEL_1: &'static str = "/home/bt/dev/voder/data/mels/LJ002-0320.mel.containerized.pt";
const EXAMPLE_MEL_2 : &'static str = "/home/bt/dev/voder/data/mels/trump_2018_02_15-001.mel.containerized.pt";

pub const MAX_WAV_VALUE : f32 = 32768.0f32;

// TODO: This is an hparam and should be dynamic.
pub const HOP_LENGTH : i64 = 256;

pub fn audio_tensor_to_audio_signal(mel: Tensor) -> Vec<f32> {
  let mut flat_audio_tensor = mel.squeeze();

  println!("Sqeueezed tensor: {:?}, dim: {}",
    flat_audio_tensor,
    flat_audio_tensor.dim());

  let length = flat_audio_tensor.size1().unwrap() as usize;
  println!("Length: {}", length);

  //let trim_back = HOP_LENGTH * 10;
  //let new_size = length as i64 - trim_back;
  //println!("Old size: {}", length);
  //println!("New size: {}", new_size);
  //flat_audio_tensor = flat_audio_tensor.resize_(&[new_size]);

  flat_audio_tensor = flat_audio_tensor * MAX_WAV_VALUE as f64;

  let mut data : Vec<f32> = Vec::with_capacity(length);

  for i in 0 .. length {
    data.push(0.0f32);
  }

  flat_audio_tensor.copy_data(data.as_mut_slice(), length as usize);

  data
}

fn debug_print_sample(audio: &Vec<f32>, num_samples: usize) {
  let mut rng = rand::thread_rng();
  for _ in 0..num_samples {
    let ri = rng.gen_range(0, audio.len());
    println!("audio_data[{}]: {:?}", ri, audio.get(ri as usize));
  }
}

pub fn run_melgan_network() {
  let mut mel = load_wrapped_tensor(EXAMPLE_MEL_1);
  println!("Got mel: {:?} of dim {}", mel, mel.dim());

  if mel.dim() == 2 {
    println!("mel unsqeeze");
    mel = mel.unsqueeze(0);
  }

  let melgan_model = load_model(WRAPPED_MODEL_PATH);

  println!("Evaluating model...");
  let output = melgan_model.forward(&mel);

  println!("Result tensor: {:?}", output);

  let data = audio_tensor_to_audio_signal(output);

  debug_print_sample(&data, 10);

  write_audio_file(data, "melgan_output.wav");
}

pub fn write_audio_file(audio_signal: Vec<f32>, filename: &str) {
  let spec = hound::WavSpec {
    channels: 1,
    sample_rate: 16000,
    bits_per_sample: 32,
    sample_format: hound::SampleFormat::Float,
  };

  let mut writer = hound::WavWriter::create(filename, spec).unwrap();

  for sample in audio_signal {
    let sample = MAX_WAV_VALUE * sample;
    writer.write_sample(sample).unwrap();
  }
}
