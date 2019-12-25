extern crate tch;

use tch::vision::imagenet;
use tch::vision::resnet;
use tch::nn::ModuleT;
use tch::Tensor;

pub mod melgan;
pub mod tacotron;

pub fn main() {
  println!("Tacotron2 + MelGan");
  melgan::run_melgan();
}