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

pub struct VoiceModel {
  graph: Graph,
  session: Session,
}

impl VoiceModel {
  pub fn load(dir_name: &str) -> Self {
    let mut graph = Graph::new();
    let session = Session::from_saved_model(
      &SessionOptions::new(),
      &["serve"],
      &mut graph,
      dir_name,
    ).expect("Should load");

    VoiceModel {
      graph,
      session,
    }
  }

  pub fn evaluate(&self, input: &Tensor<f32>) {
    println!(">>> Input tensor dims: {:?}", input.dims());

    // Run the graph.
    let mut args = SessionRunArgs::new();

    // input_A_test:
    // Tensor("input_A_test:0", shape=(?, 24, ?), dtype=float32)
    args.add_feed(&self.graph.operation_by_name_required(INPUT_NAME)
        .expect(INPUT_NAME), 0, &input);

    // generation_B_test:
    // Tensor("generator_A2B_3/output_transpose:0", shape=(?, 24, ?), dtype=float32)
    let z = args.request_fetch(
      &self.graph.operation_by_name_required(OUTPUT_NAME)
          .expect(OUTPUT_NAME), 0);

    self.session.run(&mut args).expect("Run success");

    // Check our results.
    let z_res = args.fetch::<f32>(z).expect("ret");

    println!("z_rez.dims(): {:?}", z_res.dims());
    println!("z_rez: {:?}", z_res);
  }
}

pub fn load_model() {
  let model_dir = "/home/bt/dev/voder/saved_model";
  let model = VoiceModel::load(model_dir);

  // ] generation_B_test: Tensor("generator_A2B_3/output_transpose:0", shape=(?, 24, ?), dtype=float32)
  // ] input_A_test: Tensor("input_A_test:0", shape=(?, 24, ?), dtype=float32)
  // ] inputs.shape: (1, 24, 380) -- the last dimension is the signal

  let mut input  = Tensor::new(&[1, 24, 10])
      .with_values(&[
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0f32, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
      ])
      .unwrap();

  model.evaluate(&input);
  model.evaluate(&input);
  model.evaluate(&input);
}

/*fn load_model_2() {
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
}*/

pub fn print_tensorfow_version() {
  // Python TensorFlow version: 1.14.0
  // Rust TensorFlow version:   1.13.1 (default, must be hand-upgraded)
  let version = version().expect("version");
  println!("Tensorflow version: {}", version);
}

