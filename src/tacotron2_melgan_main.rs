extern crate tch;


//const TACOTRON_MODEL_PATH : &'static str = "/home/bt/models/tacotron2-nvidia/tacotron2_statedict.pt";
//const MELGAN_MODEL_PATH : &'static str = "/home/bt/models/melgan-swpark/firstgo_a7c2351_1100.pt";
const WRAPPED_MODEL_PATH : &'static str = "/home/bt/dev/voder/container.pt";

pub fn main() {
  println!("Tacotron2 + MelGan");

  // Create the model and load the weights from the file.
  let mut vs = tch::nn::VarStore::new(tch::Device::Cpu);

  println!("Loading Wrapped model: {}", WRAPPED_MODEL_PATH);
  vs.load(WRAPPED_MODEL_PATH).unwrap();

  println!("loaded");

  // TODO: Now how do I evaluate the model?


  /*// Apply the forward pass of the model to get the logits.
  let output = net
      .forward_t(&image.unsqueeze(0), /*train=*/ false)
      .softmax(-1, tch::Kind::Float); // Convert to probability.

  // Print the top 5 categories for this image.
  for (probability, class) in imagenet::top(&output, 5).iter() {
    println!("{:50} {:5.2}%", class, 100.0 * probability)
  }
  Ok(())*/
}