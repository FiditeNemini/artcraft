use std::process::Command;
use std::vec::IntoIter;

use itertools::{Chunk, Itertools};
use log::info;

use errors::AnyhowResult;

pub fn delete_pods(pod_names: Vec<String>, batch_size: usize) -> AnyhowResult<()> {
  for pod_batch in pod_names.into_iter().chunks(batch_size).into_iter() {
    delete_pod_batch(pod_batch)?;
  }
  Ok(())
}

fn delete_pod_batch(pod_names: Chunk<IntoIter<String>>) -> AnyhowResult<()> {
  let mut args = Vec::from(["delete".to_string(), "pods".to_string()]);

  args.extend(pod_names);

  info!("Deleting batch of {} pods", (args.len() - 2));

  let output = Command::new("kubectl")
      .args(args)
      .output()?;

  let stdout = String::from_utf8(output.stdout)?;

  info!("Output: {}", stdout);

  Ok(())
}
