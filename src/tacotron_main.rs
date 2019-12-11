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

const INPUT_NAME : &'static str = "inputs";
const INPUT_LENGTHS_NAME : &'static str = "input_lengths";

// Tensor("model/griffinlim/Squeeze:0", shape=(?,), dtype=float32)
const OUTPUT_NAME : &'static str = "model/griffinlim/Squeeze";

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

  let sentence = [40, 52, 64, 41, 28, 40, 32, 64, 36, 46, 64, 31, 42, 41, 28, 39, 31, 64, 47, 45, 48, 40, 43, 1];

  let mut input = Tensor::new(&[1, 24])
    .with_values(
      // cleaned string "my name is donald trump"
      &sentence
    )
    .unwrap();

  let mut input_length  = Tensor::new(&[1])
    .with_values(&[24])
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

    // You must feed a value for placeholder tensor 'inputs' with dtype int32 and shape [1,?]
    // InvalidArgument: You must feed a value for placeholder tensor 'input_lengths' with dtype int32 and shape [1]
    //thread 'main' panicked at 'inputs_lengths: {inner:0x56247a89c920, Unavailable: Operation "inputs_lengths" not found}', src/libcore/result.rs:1165:5

    let z = args.request_fetch(
        &graph.operation_by_name_required(OUTPUT_NAME)
            .expect(OUTPUT_NAME), 0);

    println!(">>> Running...");

    session.run(&mut args).expect("Run success");

    // Check our results.
    let z_res = args.fetch::<f32>(z).expect("ret");

    println!("z_rez.dims(): {:?}", z_res.dims());
    println!("z_rez: {:?}", z_res);
  }
}