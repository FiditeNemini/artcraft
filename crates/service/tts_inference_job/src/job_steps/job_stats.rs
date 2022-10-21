use std::sync::{Arc, LockResult, RwLock};
use log::error;
use container_common::anyhow_result::AnyhowResult;

/// Job stats uses interior mutability to be easy to copy around.
#[derive(Clone)]
pub struct JobStats {
   inner: Arc<RwLock<JobStatsInner>>,
}

/// Private inner implementation that may grow additional stats in the future.
#[derive(Default)]
struct JobStatsInner {
   pub total_success_count: u64,
   pub total_failure_count: u64,
   pub consecutive_success_count: u64,
   pub consecutive_failure_count: u64,
}

/// Public result type.
#[derive(Default, Debug, Clone)]
pub struct SuccessAndFailureStats {
   pub total_success_count: u64,
   pub total_failure_count: u64,
   pub consecutive_success_count: u64,
   pub consecutive_failure_count: u64,
}

impl JobStats {
   pub fn new() -> Self {
      Self {
         inner: Arc::new(RwLock::new(JobStatsInner::default())),
      }
   }
   
   pub fn increment_failure_count(&self) -> AnyhowResult<SuccessAndFailureStats> {
      let mut lock = self.inner.write()?;

      lock.total_failure_count = lock.total_failure_count.saturating_add(1);
      lock.consecutive_success_count = 0;
      lock.consecutive_failure_count = lock.consecutive_failure_count.saturating_add(1);

      Ok(SuccessAndFailureStats {
         total_success_count: lock.total_success_count,
         total_failure_count: lock.total_failure_count,
         consecutive_success_count: lock.consecutive_success_count,
         consecutive_failure_count: lock.consecutive_failure_count,
      })
   }

   pub fn increment_success_count(&self) -> AnyhowResult<SuccessAndFailureStats> {
      let mut lock = self.inner.write()?;

      lock.total_success_count = lock.total_success_count.saturating_add(1);
      lock.consecutive_success_count = lock.consecutive_success_count.saturating_add(1);
      lock.consecutive_failure_count = 0;

      Ok(SuccessAndFailureStats {
         total_success_count: lock.total_success_count,
         total_failure_count: lock.total_failure_count,
         consecutive_success_count: lock.consecutive_success_count,
         consecutive_failure_count: lock.consecutive_failure_count,
      })
   }
}
