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

/// kube-pod-cleanup
///
/// Rationale: In production, dead/evicted pods stick around for eternity.
/// Within a matter of days, thousands of dead pods can clutter the output of `kubectl`,
/// making it operationally difficult to maintain the cluster.
///
/// This tool quickly dispenses of garbage pods. (Though we may still want to keep them
/// for debugging actual issues.)
///
/// To install as a system binary, do the following:
///
///  cargo install --path ./crates/cli/kubectl_pod_cleanup --bin kubectl-pod-cleanup
///
/// (Cargo install seems to currently require the --path argument in a workspace,
/// as tracked by this issue: https://stackoverflow.com/a/76271890 )
///

pub fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  info!("kube-pod-cleanup");

  const POD_STATUSES_TO_KEEP : [&str; 1] = [
    "Running",
  ];

  const POD_STATUSES_TO_ALWAYS_CLEAR : [&str; 11] = [
    "Completed",
    "ContainerStatusUnknown", // TODO: Maybe don't include?
    "ErrImagePull",
    "Error",
    "Evicted",
    "Init:ContainerStatusUnknown", // TODO: Maybe don't include?
    "Init:ErrImagePull",
    "Init:Error",
    "Init:ImagePullBackOff",
    "Init:OOMKilled",
    "OOMKilled",
  ];

  const POD_STATUSES_TO_SOMETIMES_CLEAR : [&str; 2] = [
    "Init:1/2",
    "PodInitializing",
    //"ContainerStatusUnknown",
    //"Init:ContainerStatusUnknown",
  ];

  let all_pods = list_pods()?;

  let pods_to_clear = all_pods.iter()
      .filter(|pod| !POD_STATUSES_TO_KEEP.contains(&pod.status.as_str()))
      .filter(|pod| {
        POD_STATUSES_TO_ALWAYS_CLEAR.contains(&pod.status.as_str()) ||
        POD_STATUSES_TO_SOMETIMES_CLEAR.contains(&pod.status.as_str())
      })
      .collect::<Vec<_>>();

  info!("Clearing {} / {} pods...", pods_to_clear.len(), all_pods.len());

  let wait_duration = Duration::from_secs(10);

  info!("Clearing in {} seconds... (Last chance to cancel!)", wait_duration.as_secs());

  thread::sleep(wait_duration);

  let pod_names_to_clear = pods_to_clear.iter()
      .map(|pod| pod.name.to_string())
      .collect::<Vec<_>>();

  info!("Clearing pods: {:?}", &pod_names_to_clear);

  // TODO(bt,2023-10-10): Delete pods isn't the cleanest code; we can improve this in the future
  // TODO(1): Add multi-threading, make the threads clear different batches.
  delete_pods(pod_names_to_clear, 30)?;

  info!("Done!");
  Ok(())
}
