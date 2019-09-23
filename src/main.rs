//! NB: From wavy library
//!
//! This example records audio and plays it back in real time as it's being recorded.

extern crate wavy;
extern crate tensorflow;

use wavy::*;

use std::collections::VecDeque;
use std::fs::File;
use std::io::Read;
use std::path::Path;
use std::process::exit;
use tensorflow::Code;
use tensorflow::Graph;
use tensorflow::ImportGraphDefOptions;
use tensorflow::Session;
use tensorflow::SessionOptions;
use tensorflow::SessionRunArgs;
use tensorflow::Status;
use tensorflow::Tensor;
use tensorflow::version;

const INPUT_NAME : &'static str = "input_A_test";
const OUTPUT_NAME : &'static str = "generator_A2B_3/output_transpose";

fn main() {
  print_version();
  load_model();
  //load_model_2();
  run_audio().expect("should work");
  //run_audio().expect("should work");
}

fn print_version() {
  // Python TensorFlow version: 1.14.0
  // Rust TensorFlow version:   1.13.1 (default, must be hand-upgraded)
  let version = version().expect("version");
  println!("Tensorflow version: {}", version);
}

fn load_model() {
    let export_dir = "/home/bt/dev/voder/saved_model";

    let mut graph = Graph::new();
    let session = Session::from_saved_model(
        &SessionOptions::new(),
        //&["train", "serve"],
        &["serve"],
        &mut graph,
        export_dir,
    ).expect("Should load");

  //graph.import_graph_def(&proto, &ImportGraphDefOptions::new())?;
  //let session = Session::new(&SessionOptions::new(), &graph)?;

  //let mut x = Tensor::new(&[2]);
  //x[0] = 2.0f32;
  //x[1] = 2.0f32;

  let mut x = Tensor::new(&[2, 24, 2])
      .with_values(&[
        0.0f32, 0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
      ])
      .unwrap();

  println!(">>> Tensor dims: {:?}", x.dims());

  /*
2019-09-23 01:05:40.971382: I tensorflow/cc/saved_model/loader.cc:311] SavedModel load for tags { serve }; Status: success. Took 3432598 microseconds.
2019-09-23 01:05:42.734062: W tensorflow/core/framework/op_kernel.cc:1502] OP_REQUIRES failed at transpose_op.cc:157 : Invalid argument: transpose expects a vector of size 1. But input(1) is a vector of size 3
thread 'main' panicked at 'Run success: {inner:0x5648cba1b510, InvalidArgument: transpose expects a vector of size 1. But input(1) is a vector of size 3
  */

  // Run the graph.
  let mut args = SessionRunArgs::new();

  // input_A_test:
  // Tensor("input_A_test:0", shape=(?, 24, ?), dtype=float32)
  args.add_feed(&graph.operation_by_name_required(INPUT_NAME)
      .expect(INPUT_NAME), 0, &x);

  // generation_B_test:
  // Tensor("generator_A2B_3/output_transpose:0", shape=(?, 24, ?), dtype=float32)
  let _z = args.request_fetch(
    &graph.operation_by_name_required(OUTPUT_NAME)
        .expect(OUTPUT_NAME), 0);

  session.run(&mut args).expect("Run success");

  // Check our results.
  //let z_res: i32 = args.fetch(z).expect("ret")[0];
  //println!("{:?}", z_res);

}

fn load_model_2() {
  // from regression_checkpoint.rs example

  let filename = "/home/bt/dev/voder/saved_model/saved_model.pb";

  let mut graph = Graph::new();
  let mut proto = Vec::new();

  File::open(filename)
      .expect("opened")
      .read_to_end(&mut proto)
      .expect("cannot read");

  graph.import_graph_def(&proto, &ImportGraphDefOptions::new()).expect("cannot import");

  let session = Session::new(&SessionOptions::new(), &graph).expect("cannot session");

  /*let op_x = graph.operation_by_name_required("x").expect("x");
  let op_y = graph.operation_by_name_required("y").expect("y");
  let op_init = graph.operation_by_name_required("init").expect("init");
  let op_train = graph.operation_by_name_required("train").expect("train");
  let op_w = graph.operation_by_name_required("w").expect("w");
  let op_b = graph.operation_by_name_required("b").expect("b");
  let op_file_path = graph.operation_by_name_required("save/Const").expect("const");
  let op_save = graph.operation_by_name_required("save/control_dependency").expect("save");*/

  //let file_path_tensor: Tensor<String> =
  //    Tensor::from(String::from("/home/bt/dev/voder/extra_model/sf1_tm1.ckpt.data-00000-of-00001"));
  //println!("Tensor: {:?}", file_path_tensor);
}

fn run_audio() -> Result<(), AudioError> {
    println!("Opening microphone system");
    let mut mic = MicrophoneSystem::new(SampleRate::Normal)?;

    println!("Opening speaker system");
    let mut speaker = SpeakerSystem::new(SampleRate::Sparse)?;

    println!("Done");

    let mut buffer = VecDeque::new();

    loop {
        mic.record(&mut |_index, l, r| {
            buffer.push_back((l, l));
        });

        speaker.play(&mut || {
            if let Some((lsample, rsample)) = buffer.pop_front() {
                AudioSample::stereo(lsample, rsample)
            } else {
                AudioSample::stereo(0, 0)
            }
        });
    }
}
