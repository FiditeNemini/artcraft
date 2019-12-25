/**
 * This takes SavedModels from Keith Ito's Tacotron impl and runs them in Rust.
 * Critically, it can short-circuit the entire model evaluation and only run the pipeline
 * pieces that we care about.
 */
extern crate hound;
extern crate image;
extern crate sample;
extern crate tensorflow;

pub mod model;

use tensorflow::{
  SessionOptions,
  Session,
  Graph,
  Tensor,
  SessionRunArgs
};

use model::print_tensorfow_version;
use sample::ring_buffer::Slice;
use image::RgbImage;
use image::ImageBuffer;
use image::Rgb;
use image::imageops::{rotate90, flip_horizontal, flip_vertical, resize, FilterType, crop};

const INPUT_NAME : &'static str = "inputs";
const INPUT_LENGTHS_NAME : &'static str = "input_lengths";

// NB: This goes through the griffin-lim pipeline, but is hella slow off GPU
// The output of this is *actual* audio, though there are a few more steps in the
// network to run before the audio is a 1:1 match with Tacotron Python.
// Tensor("model/griffinlim/Squeeze:0", shape=(?,), dtype=float32)
//const OUTPUT_NAME : &'static str = "model/griffinlim/Squeeze";

// This appears to be the mel spectrogram before griffin-lim reconstruction.
// Image output shows visible formants. If my thinking holds, we can short circuit
// Griffin-Lim reconstruction and send this to a trained MelGan network for a HUGE
// performance boost end-to-end. It should even be realtime on a CPU.
// Executing the model to this point is *extremely* fast.
const OUTPUT_NAME : &'static str = "model/Pow_1";

/**
 * To save:
     print('Saving model...')

    # https://github.com/tensorflow/models/issues/3530#issuecomment-395968881
    output_dir = './tx_trained2/'
    builder = tf.saved_model.builder.SavedModelBuilder(output_dir)

    builder.add_meta_graph_and_variables(
      self.session,
      [tf.saved_model.tag_constants.SERVING],
      main_op=tf.tables_initializer(),
    )

    builder.save()

    # Save the model text labels to dereference
    definition = self.session.graph_def
    directory = 'saved_model_labels'
    tf.train.write_graph(definition, directory, 'model_labels.pb', as_text=True)
 */
pub fn main() {
  println!("Tacotron");
  print_tensorfow_version();

  let dir_name = "/home/bt/dev/2nd/tacotron/tx_trained2";

  let mut graph = Graph::new();
  let session = Session::from_saved_model(
    &SessionOptions::new(),
    &["serve"],
    &mut graph,
    dir_name,
  ).expect("Should load");

  println!("Model Loaded!");

  // cleaned string "my name is donald trump"
  let sentence = vec![
    40, 52, 64,
    41, 28, 40, 32, 64,
    36, 46, 64,
    31, 42, 41, 28, 39, 31, 64,
    47, 45, 48, 40, 43, 1
  ];

  /*let sentence = vec![
    40, 52, 64,
    40, 52, 64,
    40, 52, 64,
    40, 52, 64,
    40, 52, 64,
    40, 52, 64,
    40, 52, 64,
    41, 28, 40, 32, 64,
    41, 28, 40, 32, 64,
    41, 28, 40, 32, 64,
    41, 28, 40, 32, 64,
    41, 28, 40, 32, 64,
    41, 28, 40, 32, 64,
    41, 28, 40, 32, 64,
    36, 46, 64,
    36, 46, 64,
    36, 46, 64,
    36, 46, 64,
    36, 46, 64,
    31, 42, 41, 28, 39, 31, 64,
    47, 45, 48, 40, 43, 1
  ];*/

  //for _i in 0..32 {
    convert_sentence(&mut graph, &session, &sentence)
  //}
}

fn convert_sentence(graph: &mut Graph, session: &Session, sentence: &Vec<i32>) -> () {
  let mut input = Tensor::new(&[1, sentence.len() as u64])
      .with_values(
        // cleaned string "my name is donald trump"
        sentence.slice()
      )
      .unwrap();
  let mut input_length = Tensor::new(&[1])
      .with_values(&[sentence.len() as i32])
      .unwrap();
  println!(">>> Input tensor dims: {:?}", input.dims());
  {
    let mut args = SessionRunArgs::new();

    println!(">>> Inputs ...");
    args.add_feed(&graph.operation_by_name_required(INPUT_NAME)
        .expect(INPUT_NAME), 0, &input);

    println!(">>> Input Lengths ...");
    args.add_feed(&graph.operation_by_name_required(INPUT_LENGTHS_NAME)
        .expect(INPUT_LENGTHS_NAME), 0, &input_length);

    let z = args.request_fetch(
      &graph.operation_by_name_required(OUTPUT_NAME)
          .expect(OUTPUT_NAME), 0);

    println!(">>> Running...");

    session.run(&mut args).expect("Run success");

    // Check our results.
    let z_res = args.fetch::<f32>(z).expect("ret");

    println!("z_rez.dims(): {:?}", z_res.dims());
    println!("z_rez: {:?}", z_res);

    println!("Data[0]: {:?}", &z_res.get(0));
    println!("Data[1]: {:?}", &z_res.get(1));
    println!("Data[2]: {:?}", &z_res.get(2));

    visualize(z_res);

    //let processed = process_audio(z_res.to_vec());
    //write_wav(processed);
  }
}

fn visualize(tensor : Tensor<f32>) {
  let dims = tensor.dims();
  let width = *dims.get(0).unwrap() as u32;
  let height = *dims.get(1).unwrap() as u32;

  let mut image: RgbImage = ImageBuffer::new(width, height);

  let mut i: u32 = 0;
  let mut j: u32 = 0;
  let mut k: u32 = 0;

  for x in tensor.iter() {
    if j >= height {
      j = 0;
      i += 1
    }
    if i >= width {
      println!("Break @ {}", k);
      break;
    }
    /*if i % 5 == 0  {
      image.put_pixel(i, j, Rgb([0, 0, 0]));
    } else {
      image.put_pixel(i, j, Rgb([0, 255, 0]));
    }*/
    // [-1.0, 1.0]
    let val = (*x) * 255f32;
    let val = val.abs() as u8;
    image.put_pixel(i, j, Rgb([val, val, val]));
    j += 1;
    k += 1;
  }

  //image = rotate90(&image);
  //image = flip_horizontal(&image);
  image = flip_vertical(&image);
  let cropped = crop(&mut image,0, 0, 200, height);
  let mut image = cropped.to_image();
  image = resize(&image, 200, 100, FilterType::Triangle);
  image.save("output.png").unwrap();

  println!("Dimensions: {:?}", dims);
  println!("Width: {:?}", width);
  println!("Height: {:?}", height);
  println!("Num pixels calc: {:?}", (width * height));
  println!("Num pixels covered: {:?}", k);
}

fn process_audio(signal: Vec<f32>) -> Vec<f64> {
  //  wav *= 32767 / max(0.01, np.max(np.abs(wav)))
  //  scipy.io.wavfile.write(path, hparams.sample_rate, wav.astype(np.int16))

  // abs
  //[0.0000000e+00 4.1254760e-12 7.1285297e-11 ... 5.9092813e-14 4.0335224e-14
  // 2.1358613e-15]
  //max abs
  //0.08918631

  let signal = signal.iter()
      .map(|f| *f as f64)
      .collect::<Vec<f64>>();

  let abs = signal.iter()
      .map(|f|  f.abs())
      .collect::<Vec<f64>>();

  println!("Abs[0]: {:?}", &abs.get(0));
  println!("Abs[1]: {:?}", &abs.get(1));
  println!("Abs[2]: {:?}", &abs.get(2));

  let max : f64 = abs.iter()
      .fold(0.01f64, |x, y| x.max(*y));


  let signal_mult = signal.iter()
      .map(|f| *f * 32767.0f64)
      .collect::<Vec<f64>>();

  let signal_div = signal_mult.iter()
      .map(|f| *f / max)
      .collect::<Vec<f64>>();

  println!("Max: {:?}", max);

  let mult = 32767.0f64 / max;
  let rust_mult = 367225.3669259117;
  let python_mult = 367399.4329151011;

  println!("Mult: {:?}", mult);

  /*let result = signal.iter()
      .map(|f| f * python_mult)
      .collect::<Vec<f64>>();

  println!("Res[0]: {:?}", &abs.get(0));
  println!("Res[1]: {:?}", &abs.get(1));
  println!("Res[2]: {:?}", &abs.get(2));*/

  signal_div
}

fn write_wav(signal: Vec<f64>) {
  let spec = hound::WavSpec {
    channels: 1,
    sample_rate: 16000,
    bits_per_sample: 32,
    sample_format: hound::SampleFormat::Float,
  };
  let mut writer = hound::WavWriter::create("output.wav", spec).unwrap();

  for sample in signal {
    writer.write_sample(sample as f32).unwrap();
  }
  writer.finalize().unwrap();
}