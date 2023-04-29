use anyhow::anyhow;
use config::is_bad_download_url::is_bad_download_url;
use container_common::anyhow_result::AnyhowResult;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use crate::JobState;
use crate::job_types::dispatch_job_to_handler::{dispatch_job_to_handler, DispatchJobToHandlerArgs};
use jobs_common::redis_job_status_logger::RedisJobStatusLogger;
use log::{info, warn};
use mysql_queries::queries::generic_download::job::list_available_generic_download_jobs::AvailableDownloadJob;
use mysql_queries::queries::generic_download::job::mark_generic_download_job_done::mark_generic_download_job_done;
use mysql_queries::queries::generic_download::job::mark_generic_download_job_pending_and_grab_lock::mark_generic_download_job_pending_and_grab_lock;
use tempdir::TempDir;

pub async fn process_single_job(job_state: &JobState, job: &AvailableDownloadJob) -> AnyhowResult<()> {
  let mut redis = job_state.redis_pool.get()?;
  let mut redis_logger = RedisJobStatusLogger::new_generic_download(&mut redis, job.download_job_token.as_str());

  // ==================== ATTEMPT TO GRAB JOB LOCK ==================== //

  let lock_acquired = mark_generic_download_job_pending_and_grab_lock(
    &job_state.mysql_pool,
    job.id,
    &job_state.container_db,
  ).await?;

  if !lock_acquired {
    warn!("Could not acquire job lock for: {}", &job.id.0);
    return Ok(())
  }

  info!("Beginning work on {:?} = {} | {}", job.download_type, job.download_job_token, job.download_url);

  // ==================== SETUP TEMP DIRS ==================== //

  let temp_dir = format!("temp_{}", job.id.0);
  let temp_dir = TempDir::new(&temp_dir)?;

  // ==================== DOWNLOAD MODEL FILE ==================== //

  info!("Calling downloader...");

  redis_logger.log_status("downloading URL")?;

  if is_bad_download_url(&job.download_url)? {
    warn!("Bad download URL: `{}`", &job.download_url);
    return Err(anyhow!("Bad download URL: `{}`", &job.download_url));
  }

  let download_filename = match job_state.sidecar_configs.google_drive_downloader.download_file(&job.download_url, &temp_dir).await {
    Ok(filename) => filename,
    Err(e) => {
      safe_delete_temp_directory(&temp_dir);
      return Err(e);
    }
  };

  info!("Downloaded filename: {}", &download_filename);

  // ==================== HANDLE DIFFERENT DOWNLOAD TYPES ==================== //

  let result_details = dispatch_job_to_handler(DispatchJobToHandlerArgs {
    job_runner_state: job_state,
    job,
    temp_dir: &temp_dir,
    download_filename: &download_filename,
    redis_logger: &mut redis_logger,
  }).await?;

  let mut entity_token: Option<String> = None;
  let mut entity_type: Option<String> = None;

  if let Some(result_details) = result_details {
    // TODO: Cleanup
    entity_token = Some(result_details.entity_token.clone());
    entity_type = Some(result_details.entity_token.clone());
  }

  // =====================================================

  info!("Marking job complete...");
  mark_generic_download_job_done(
    &job_state.mysql_pool,
    job,
    true,
    entity_token.as_deref(),
    entity_type.as_deref(),
  ).await?;

  info!("Saved model record: {} - {}", job.id.0, &job.download_job_token);

  job_state.firehose_publisher.publish_generic_download_finished(
    &job.creator_user_token,
    entity_token.as_deref())
      .await
      .map_err(|e| {
        warn!("error publishing event: {:?}", e);
        anyhow!("error publishing event")
      })?;

  redis_logger.log_status("done")?;

  info!("Job done: {}", job.id.0);

  Ok(())
}
