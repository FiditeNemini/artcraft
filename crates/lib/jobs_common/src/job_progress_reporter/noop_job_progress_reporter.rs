use container_common::anyhow_result::AnyhowResult;
use crate::job_progress_reporter::job_progress_reporter::{JobProgressReporter, JobProgressReporterBuilder};

/// A job progress reporter that does no work and has zero database dependencies.
pub struct NoOpJobProgressReporterBuilder {}

/// A job progress reporter that does no work and has zero database dependencies.
pub struct NoOpJobProgressReporter {}

impl NoOpJobProgressReporterBuilder {
  fn create_instance() -> AnyhowResult<Box<dyn JobProgressReporter>> {
    Ok(Box::new(NoOpJobProgressReporter {}))
  }
}

impl JobProgressReporterBuilder for NoOpJobProgressReporterBuilder {
  fn new_generic_download(&self, job_token: &str) -> AnyhowResult<Box<dyn JobProgressReporter>> {
    NoOpJobProgressReporterBuilder::create_instance()
  }

  fn new_tts_download(&self, tts_job_token: &str) -> AnyhowResult<Box<dyn JobProgressReporter>> {
    NoOpJobProgressReporterBuilder::create_instance()
  }

  fn new_tts_inference(&self, tts_job_token: &str) -> AnyhowResult<Box<dyn JobProgressReporter>> {
    NoOpJobProgressReporterBuilder::create_instance()
  }

  fn new_w2l_download(&self, w2l_job_token: &str) -> AnyhowResult<Box<dyn JobProgressReporter>> {
    NoOpJobProgressReporterBuilder::create_instance()
  }

  fn new_w2l_inference(&self, w2l_job_token: &str) -> AnyhowResult<Box<dyn JobProgressReporter>> {
    NoOpJobProgressReporterBuilder::create_instance()
  }
}

impl JobProgressReporter for NoOpJobProgressReporter {
  fn log_status(&mut self, logging_details: &str) -> AnyhowResult<()> {
    Ok(()) // No-op
  }
}
