
#[derive(Copy, Clone)]
pub enum ProcessSingleJobSuccessCase {
  /// Job was successfully completed.
  JobCompleted,

  /// Processing the job was temporarily skipped over due to model file dependencies
  /// not being present on the filesystem of this worker. Another worker might pick
  /// up the job, or we might return to it later ourselves.
  JobTemporarilySkippedFilesAbsent,
}
