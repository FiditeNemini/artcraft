use std::time::Duration;

use log::{error, info};

use errors::AnyhowResult;

use crate::job_state::JobState;
use crate::tasks::calculate_old_model_analytics::calculate_old_model_analytics::calculate_old_model_analytics;

pub async fn main_loop(job_state: JobState) -> AnyhowResult<()> {
  loop {
    info!("Begin analytics job batch.");

    match calculate_old_model_analytics(&job_state).await {
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
