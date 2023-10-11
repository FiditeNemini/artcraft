use std::thread;

use log::error;

use errors::{anyhow, AnyhowResult};

use crate::delete_pods::delete_pod_batch;
use crate::pod_store::PodStore;

pub fn delete_pods_threaded(pod_names: Vec<String>, num_tasks: usize, batch_size: usize) -> AnyhowResult<()> {
  let pod_store = PodStore::from_names(pod_names);

  let mut join_handles = Vec::with_capacity(batch_size);

  for _ in 0 ..num_tasks {
    let cloned = pod_store.clone();

    // NB: Using std::thread instead of Tokio since this API is blocking.
    let handle = thread::spawn(move || {
      loop {
        let batch = match cloned.grab_batch(batch_size) {
          Ok(batch) => batch,
          Err(err) => {
            error!("threading error: {:?}", err);
            return;
          }
        };

        if batch.is_empty() {
          break;
        }

        let pod_names = batch.into_iter()
            .map(|n| n.to_string())
            .collect::<Vec<String>>();

        if let Err(err) = delete_pod_batch(&pod_names) {
          error!("threading error: {:?}", err);
          return;
        }
      }
    });

    join_handles.push(handle);
  }

  for handle in join_handles {
    if let Err(err) = handle.join() {
      return Err(anyhow!("threading error: {:?}", err));
    }
  }

  Ok(())
}
