use anyhow::anyhow;

/// Error from processing a single job
#[derive(Debug)]
pub enum ProcessSingleJobError {
  /// The filesystem is out of space and we need to free it up.
  FilesystemFull,
  /// The job is invalid (bad state, etc.)
  InvalidJob(anyhow::Error),
  /// The job's keepalive signal has elapsed, so the job needs to be killed.
  /// The keepalive signal is typically for non-premium users only and it
  /// makes sure they're still on the website. It kills jobs they leave
  /// running when they bounce so that we can free up their capacity.
  KeepAliveElapsed,
  /// This is any other kind of error.
  /// It might be important, we just haven't special cased it yet.
  Other(anyhow::Error),
  /// We hit a feature or a path for this job that has not yet been implemented.
  /// Permanently fail the job.
  NotYetImplemented,
}

impl ProcessSingleJobError {
  pub fn from_io_error(error: std::io::Error) -> Self {
    match error.raw_os_error() {
      // NB: We can't use err.kind() -> ErrorKind::StorageFull, because it's marked unstable:
      // `io_error_more` is unstable [E0658]
      Some(28) => ProcessSingleJobError::FilesystemFull,
      _ => ProcessSingleJobError::Other(anyhow!(error)),
    }
  }

  pub fn from_anyhow_error(error: anyhow::Error) -> Self {
    match error.downcast_ref::<std::io::Error>() {
      Some(e) => match e.raw_os_error() {
        // NB: We can't use err.kind() -> ErrorKind::StorageFull, because it's marked unstable:
        // `io_error_more` is unstable [E0658]
        Some(28) => ProcessSingleJobError::FilesystemFull,
        _ => ProcessSingleJobError::Other(anyhow!(error)),
      },
      None => ProcessSingleJobError::Other(error),
    }
  }
}
