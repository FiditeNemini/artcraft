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
const INPUT_LENGTHS_NAME : &'static str = "inputs_lengths";

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

  let mut input = Tensor::new(&[1, 24, 10])
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

  println!(">>> Input tensor dims: {:?}", input.dims());

    {
        let mut args = SessionRunArgs::new();

        // input_A_test:
        // Tensor("input_A_test:0", shape=(?, 24, ?), dtype=float32)
        args.add_feed(&graph.operation_by_name_required(INPUT_NAME)
            .expect(INPUT_NAME), 0, &input);

        args.add_feed(&graph.operation_by_name_required(INPUT_NAME)
            .expect(INPUT_LENGTHS_NAME), 0, &input);

        // generation_B_test:
        // Tensor("generator_A2B_3/output_transpose:0", shape=(?, 24, ?), dtype=float32)
        let z = args.request_fetch(
            &graph.operation_by_name_required(OUTPUT_NAME)
                .expect(OUTPUT_NAME), 0);

        session.run(&mut args).expect("Run success");

        // Check our results.
        let z_res = args.fetch::<f32>(z).expect("ret");

        println!("z_rez.dims(): {:?}", z_res.dims());
        println!("z_rez: {:?}", z_res);
    }
}