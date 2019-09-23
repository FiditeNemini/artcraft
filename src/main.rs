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

fn main() {
  print_version();
  load_model();
  //load_model_2();
  run_audio().expect("should work");
  run_audio().expect("should work");
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

  // Run the graph.
  let mut x = Tensor::new(&[1]);
  x[0] = 2i32;
  let mut y = Tensor::new(&[1]);
  y[0] = 40i32;

  let mut args = SessionRunArgs::new();
  args.add_feed(&graph.operation_by_name_required("input_A_test").expect("x"), 0, &x);
  //args.add_feed(&graph.operation_by_name_required("y").expect("y"), 0, &y);
  //let z = args.request_fetch(&graph.operation_by_name_required("z").expect("z"), 0);

  session.run(&mut args).expect("Run success");

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
