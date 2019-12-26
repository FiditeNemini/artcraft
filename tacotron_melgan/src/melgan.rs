use tch::Tensor;
use tch::CModule;
use tch;
use tch::nn::Module;

//const TACOTRON_MODEL_PATH : &'static str = "/home/bt/models/tacotron2-nvidia/tacotron2_statedict.pt";
//const MELGAN_MODEL_PATH : &'static str = "/home/bt/models/melgan-swpark/firstgo_a7c2351_1100.pt";
const WRAPPED_MODEL_PATH : &'static str = "/home/bt/dev/voder/tacotron_melgan/container.pt";
//const WRAPPED_MODEL_PATH : &'static str = "/home/bt/dev/voder/tacotron_melgan/cpu_container.pt";

//const EXAMPLE_MEL_1: &'static str = "/home/bt/dev/voder/data/mels/LJ002-0320.mel";
const EXAMPLE_MEL_1: &'static str = "/home/bt/dev/voder/data/mels/LJ002-0320.mel.containerized.pt";
const EXAMPLE_MEL_2 : &'static str = "/home/bt/dev/voder/data/mels/trump_2018_02_15-001.mel";

const MAX_WAV_VALUE : f32 = 32768.0f32;

// TODO: This is an hparam and should be dynamic.
const HOP_LENGTH : i64 = 256;

pub fn load_melgan_model(filename: &str) -> CModule {
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
pub fn load_wrapped_mel(filename: &str) -> Tensor {
  println!("Loading wrapped mel file: {}", filename);
  let module = tch::CModule::load(filename).unwrap();
  let mut temp = Tensor::zeros(
    &[10, 10, 10],
    (tch::Kind::Float, tch::Device::Cpu)
  );
  module.forward(&temp)
}

pub fn run_melgan() {
  let mut mel = load_wrapped_mel(EXAMPLE_MEL_1);
  println!("Got mel: {:?} of dim {}", mel, mel.dim());

  if mel.dim() == 2 {
    println!("mel unsqeeze");
    mel = mel.unsqueeze(0);
  }

  let mut vs = tch::nn::VarStore::new(tch::Device::Cpu);
  let melgan_model = load_melgan_model(WRAPPED_MODEL_PATH);

  println!("Evaluating model...");
  let output = melgan_model.forward(&mel);

  println!("Result tensor: {:?}", output);

  let mut flat_audio_tensor = output.squeeze();

  println!("Sqeueezed tensor: {:?}, dim: {}",
    flat_audio_tensor,
    flat_audio_tensor.dim());

  let length = flat_audio_tensor.size1().unwrap() as usize;
  println!("Length: {}", length);

  /*
      def inference(self, mel):
        hop_length = 256
        # pad input mel with zeros to cut artifact
        # see https://github.com/seungwonpark/melgan/issues/8
        zero = torch.full((1, self.mel_channel, 10), -11.5129).to(mel.device)
        mel = torch.cat((mel, zero), dim=2)

        audio = self.forward(mel)
        audio = audio.squeeze() # collapse all dimension except time axis
        audio = audio[:-(hop_length*10)]
        audio = MAX_WAV_VALUE * audio
        audio = audio.clamp(min=-MAX_WAV_VALUE, max=MAX_WAV_VALUE-1)
        audio = audio.short()

        return audio
  */

  // Hmm, this isn't flat.
  println!("Tensor Data: {:?}", flat_audio_tensor.get(0));
  println!("Tensor Data: {:?}", flat_audio_tensor.get(100));
  println!("Tensor Data: {:?}", flat_audio_tensor.get(2000));
  println!("Tensor Data: {:?}", flat_audio_tensor.get(5000));
  println!("Tensor Data: {:?}", flat_audio_tensor.get(10000));

  //let trim_back = HOP_LENGTH * 10;
  //let new_size = length as i64 - trim_back;
  //println!("Old size: {}", length);
  //println!("New size: {}", new_size);
  //flat_audio_tensor = flat_audio_tensor.resize_(&[new_size]);

  flat_audio_tensor = flat_audio_tensor * MAX_WAV_VALUE as f64;

  println!("Mul Tensor Data: {:?}", flat_audio_tensor.get(0));
  println!("Mul Tensor Data: {:?}", flat_audio_tensor.get(100));
  println!("Mul Tensor Data: {:?}", flat_audio_tensor.get(2000));
  println!("Mul Tensor Data: {:?}", flat_audio_tensor.get(5000));
  println!("Mul Tensor Data: {:?}", flat_audio_tensor.get(10000));

  let mut data : Vec<f32> = Vec::with_capacity(length);
  for i in 0 .. length {
    data.push(0.0f32);
  }

  flat_audio_tensor.copy_data(data.as_mut_slice(), length as usize);

  println!("Data: {:?}", data.get(0));
  println!("Data: {:?}", data.get(100));
  println!("Data: {:?}", data.get(2000));
  println!("Data: {:?}", data.get(5000));
  println!("Data: {:?}", data.get(10000));

  let spec = hound::WavSpec {
    channels: 1,
    sample_rate: 16000,
    bits_per_sample: 32,
    sample_format: hound::SampleFormat::Float,
  };

  let mut writer = hound::WavWriter::create("melgan_output.wav", spec).unwrap();

  for sample in data {
    let sample = MAX_WAV_VALUE * sample;
    writer.write_sample(sample).unwrap();
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
}
