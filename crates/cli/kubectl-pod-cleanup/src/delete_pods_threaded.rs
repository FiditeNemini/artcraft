use std::thread;
use std::time::{Duration, Instant};

use log::error;

use errors::{anyhow, AnyhowResult};

use crate::delete_pods::delete_pod_batch;
use crate::pod_store::PodStore;

/// If kubectl returns faster than this, it may be spamming the API.
const TIMEOUT_TRIGGER_THRESHOLD : Duration = Duration::from_millis(500);

const TIMEOUT_DURATION : Duration = Duration::from_secs(5);

/// If we fail to delete pods this number of times, exit the thread.
const FAILURE_TRIGGER_THRESHOLD : usize = 5;

pub fn delete_pods_threaded(pod_names: Vec<String>, num_tasks: usize, batch_size: usize) -> AnyhowResult<()> {
  let pod_store = PodStore::from_names(pod_names);

  let mut join_handles = Vec::with_capacity(batch_size);

  for _ in 0 ..num_tasks {
    let cloned = pod_store.clone();

    // NB: Using std::thread instead of Tokio since this API is blocking.
    let handle = thread::spawn(move || {
      let mut failure_to_progress_count = 0;

      loop {
        let batch = match cloned.grab_batch(batch_size) {
          Ok(batch) => batch,
          Err(err) => {
            error!("threading error: {:?}", err);
            return;
          }
        };

        if batch.is_empty() {
          return;
        }

        if batch.len() < batch_size {
          failure_to_progress_count += 1;
        } else {
          failure_to_progress_count = 0;
        }

        if failure_to_progress_count > FAILURE_TRIGGER_THRESHOLD {
          error!("Failure to make progress.");
          return;
        }

        let pod_names = batch.into_iter()
            .map(|n| n.to_string())
            .collect::<Vec<String>>();

        let start = Instant::now();

        if let Err(err) = delete_pod_batch(&pod_names) {
          error!("threading error: {:?}", err);
          return;
        }

        let duration = Instant::now().duration_since(start);

        if duration.lt(&TIMEOUT_TRIGGER_THRESHOLD) {
          thread::sleep(TIMEOUT_DURATION);
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
