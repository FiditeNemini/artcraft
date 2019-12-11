extern crate tensorflow;

pub mod model;

use tensorflow::Graph;
use tensorflow::Session;
use tensorflow::SessionOptions;

use model::print_tensorfow_version;

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

  println!("Loaded!");
}