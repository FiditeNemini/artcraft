use tch::Tensor;
use tch::CModule;
use tch;
use tch::nn::Module;


const WRAPPED_MODEL_PATH : &'static str = "/home/bt/dev/voder/tacotron_melgan/tacotron_container.pt";
//const EXAMPLE_TEXT_SEQUENCE : &'static str = "/home/bt/dev/voder/data/text/tacotron_text_sequence.pt";
const EXAMPLE_TEXT_SEQUENCE : &'static str = "/home/bt/dev/voder/data/text/tacotron_text_sequence.pt.containerized.pt";

pub fn load_tacotron_model(filename: &str) -> CModule {
  // TODO
  println!("Loading model: {}", filename);
  tch::CModule::load(filename).unwrap()
}

pub fn load_wrapped_text(filename: &str) -> Tensor {
  println!("Loading wrapped text sequence file: {}", filename);
  let module = tch::CModule::load(filename).unwrap();
  let mut temp = Tensor::zeros(
    &[10, 10, 10],
    (tch::Kind::Float, tch::Device::Cpu)
  );
  module.forward(&temp)
}


pub fn run_tacotron() {
  let mut text_sequence = load_wrapped_text(EXAMPLE_TEXT_SEQUENCE);
  println!("Got text_sequence: {:?} of dim {}", text_sequence, text_sequence.dim());

  let mut vs = tch::nn::VarStore::new(tch::Device::Cpu);
  let tacotron_model = load_tacotron_model(WRAPPED_MODEL_PATH);

  for i in 0..10 {
    println!("Evaluating model... {}", i);
    let output = tacotron_model.forward(&text_sequence);

    println!("Result tensor: {:?}", output);
  }
}

/*println!("Tacotron2 + MelGan");

// Create the model and load the weights from the file.
let mut vs = tch::nn::VarStore::new(tch::Device::Cpu);

println!("Loading Wrapped model: {}", WRAPPED_MODEL_PATH);

println!("loaded");

/* Just gotta do this...
  model = Generator(hp.audio.n_mel_channels).cuda()
  model.load_state_dict(checkpoint['model_g'])
  model.eval(inference=False)

  with torch.no_grad():
      for melpath in tqdm.tqdm(glob.glob(os.path.join(args.input_folder, '*.mel'))):
          mel = torch.load(melpath)
          if len(mel.shape) == 2:
              mel = mel.unsqueeze(0)

          filename = melpath.replace('.mel', '_reconstructed_epoch%04d.png' % checkpoint['epoch'])
          #render_histogram(mel, filename)
          mel = mel.cuda()

          audio = model.inference(mel)
          audio = audio.cpu().detach().numpy()

          out_path = melpath.replace('.mel', '_reconstructed_epoch%04d.wav' % checkpoint['epoch'])
          write(out_path, hp.audio.sampling_rate, audio)
*/

//vs.load(WRAPPED_MODEL_PATH).unwrap();

println!("Loading trained model...");
let model = tch::CModule::load(WRAPPED_MODEL_PATH).unwrap();

// NB: This is just random data for now. Kind of mel shaped since it's an image.
//let path = "/home/bt/Downloads/virtual-studio-design.jpg";
//let image = imagenet::load_image_and_resize(path, 100, 100).unwrap();
//let image = imagenet::load_image(EXAMPLE_MEL_PATH).unwrap();

println!("Loading mel file...");
let mel_file = Tensor::load(EXAMPLE_MEL_PATH).unwrap();

println!("Forwarding mel to model...");
let output = model.forward_ts(&[mel_file.unsqueeze(0)]).unwrap();


/*// TODO: Now how do I evaluate the model?
//let resnet18 = tch::vision::resnet::resnet18(&vs.root(), imagenet::CLASS_COUNT);

let path = "/home/bt/Downloads/virtual-studio-design.jpg";
let image = imagenet::load_image_and_resize(path, 100, 100).unwrap();

// NB: This works
let net = Box::new(resnet::resnet18(&vs.root(), imagenet::CLASS_COUNT));

for _ in 0..10 {
  let output = net
      .forward_t(&image.unsqueeze(0), /*train=*/ false)
      .softmax(-1, tch::Kind::Float); // Convert to probability.

  for (probability, class) in imagenet::top(&output, 5).iter() {
    println!("{:50} {:5.2}%", class, 100.0 * probability)
  }
}*/

/*// Apply the forward pass of the model to get the logits.
let output = net
    .forward_t(&image.unsqueeze(0), /*train=*/ false)
    .softmax(-1, tch::Kind::Float); // Convert to probability.

// Print the top 5 categories for this image.
Ok(())*/
*/
