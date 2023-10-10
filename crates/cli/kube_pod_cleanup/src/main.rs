use std::ops::Index;
use std::thread;
use std::time::Duration;

use log::info;

use config::shared_constants::DEFAULT_RUST_LOG;
use errors::AnyhowResult;

use crate::delete_pods::delete_pods;
use crate::list_pods::list_pods;

pub mod list_pods;
pub mod delete_pods;

pub fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  info!("kube-pod-cleanup");

  const POD_STATUSES_TO_KEEP : [&str; 1] = [
    "Running",
  ];

  const POD_STATUSES_TO_ALWAYS_CLEAR : [&str; 2] = [
    "Error",
    "Evicted",
  ];

  const POD_STATUSES_TO_SOMETIMES_CLEAR : [&str; 1] = [
    "ContainerStatusUnknown",
  ];

  let all_pods = list_pods()?;

  let pods_to_clear = all_pods.iter()
      .filter(|pod| !POD_STATUSES_TO_KEEP.contains(&pod.status.as_str()))
      .filter(|pod| POD_STATUSES_TO_ALWAYS_CLEAR.contains(&pod.status.as_str()))
      .collect::<Vec<_>>();

  info!("Clearing {} / {} pods...", pods_to_clear.len(), all_pods.len());

  let wait_duration = Duration::from_secs(10);

  info!("Clearing in {} seconds... (Last chance to cancel!)", wait_duration.as_secs());

  thread::sleep(wait_duration);

  let pod_names_to_clear = pods_to_clear.iter()
      .map(|pod| pod.name.to_string())
      .collect::<Vec<_>>();

  info!("Clearing pods: {:?}", &pod_names_to_clear);

  delete_pods(pod_names_to_clear)?;

  info!("Done!");
  Ok(())
}
