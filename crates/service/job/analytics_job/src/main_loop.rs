use crate::job_state::JobState;
use crate::jobs::calculate_model_analytics::calculate_model_analytics;
use errors::AnyhowResult;
use std::time::Duration;
use log::{error, info};

pub async fn main_loop(job_state: JobState) -> AnyhowResult<()> {
  loop {
    info!("Begin analytics job batch.");

    match calculate_model_analytics(&job_state).await {
      Ok(_) => {
        std::thread::sleep(Duration::from_millis(job_state.sleep_config.between_job_batch_wait_millis));
      }
      Err(e) => {
        error!("Error: {:?}", e);
        std::thread::sleep(Duration::from_millis(job_state.sleep_config.between_error_wait_millis));
      }
    }
  }
}
