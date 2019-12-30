#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;
#[macro_use] extern crate rocket_contrib;
#[macro_use] extern crate serde_derive;
extern crate hound;
extern crate rand;
extern crate serde;
extern crate serde_json;
extern crate tch;

use tch::CModule;
use tch::Tensor;
use tch::nn::Module;
use tch::nn::ModuleT;
use server::run_server;

pub mod melgan;
pub mod model;
pub mod server;
pub mod tacotron;

pub fn main() {
  println!("Tacotron2 + MelGan");

  //melgan::run_melgan_network();
  //tacotron::run_tacotron();
  //run_end_to_end();

  run_server();
}

fn run_end_to_end() {
  println!("Load Tacotron Model");
  let tacotron_model =
      model::load_model_file("/home/bt/dev/voder/tacotron_melgan/tacotron_container.pt");

  println!("Load Melgan Model");
  let melgan_model =
      model::load_model_file("/home/bt/dev/voder/tacotron_melgan/container2.pt");

  println!("Load Text Sequence Tensor");
  let text_sequence =
      model::load_wrapped_tensor_file("/home/bt/dev/voder/data/text/tacotron_text_sequence.pt.containerized.pt");

  //for i in 0..10 {
    println!(">>> Evaluating Tacotron Model");
    let mut mel_tensor = tacotron_model.forward(&text_sequence);

    println!("Result mel tensor: {:?}", mel_tensor);

    if mel_tensor.dim() == 2 {
      println!("mel unsqeeze");
      mel_tensor = mel_tensor.unsqueeze(0);
    }

    let audio_tensor = melgan_model.forward(&mel_tensor);

    println!("Result audio tensor: {:?}", audio_tensor);

    let audio = melgan::audio_tensor_to_audio_signal(audio_tensor);

    println!("Writing audio file...");
    melgan::write_audio_file(audio, "double_model_results_2.wav");

    println!("Done.");
  //}
}
