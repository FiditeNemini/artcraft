use anyhow::anyhow;
use config::bad_urls::is_bad_tts_model_download_url;
use container_common::anyhow_result::AnyhowResult;
use container_common::filesystem::check_file_exists::check_file_exists;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use container_common::filesystem::safe_delete_temp_file::safe_delete_temp_file;
use container_common::hashing::hash_file_sha2::hash_file_sha2;
use crate::JobState;
use database_queries::queries::generic_download::job::list_available_generic_download_jobs::AvailableDownloadJob;
use database_queries::queries::generic_download::job::mark_generic_download_job_pending_and_grab_lock::mark_generic_download_job_pending_and_grab_lock;
use jobs_common::redis_job_status_logger::RedisJobStatusLogger;
use log::{info, warn};
use std::path::PathBuf;
use tempdir::TempDir;
use database_queries::queries::generic_download::job::mark_generic_download_job_done::mark_generic_download_job_done;
use crate::job_steps::process_hifigan_vocoder::process_hifigan_vocoder;

pub async fn process_single_job(job_state: &JobState, job: &AvailableDownloadJob) -> AnyhowResult<()> {
  let mut redis = job_state.redis_pool.get()?;
  let mut redis_logger = RedisJobStatusLogger::new_tts_download(
    &mut redis,
    &job.token);

  // ==================== ATTEMPT TO GRAB JOB LOCK ==================== //

  let lock_acquired = mark_generic_download_job_pending_and_grab_lock(&job_state.mysql_pool, job.id).await?;

  if !lock_acquired {
    warn!("Could not acquire job lock for: {}", &job.id.0);
    return Ok(())
  }

  // ==================== SETUP TEMP DIRS ==================== //

  let temp_dir = format!("temp_{}", job.id.0);
  let temp_dir = TempDir::new(&temp_dir)?;

  // ==================== DOWNLOAD MODEL FILE ==================== //

  info!("Calling downloader...");

  redis_logger.log_status("downloading model")?;

  let download_url = job.download_url.as_ref()
      .map(|c| c.to_string())
      .unwrap_or("".to_string());

  if is_bad_tts_model_download_url(&download_url)? {
    warn!("Bad download URL: `{}`", &download_url);
    return Err(anyhow!("Bad download URL: `{}`", &download_url));
  }

  let download_filename = match job_state.google_drive_downloader.download_file(&download_url, &temp_dir).await {
    Ok(filename) => filename,
    Err(e) => {
      safe_delete_temp_directory(&temp_dir);
      return Err(e);
    }
  };

  // ==================== HANDLE DIFFERENT DOWNLOAD TYPES ==================== //

  match job.download_type {
    GenericDownloadType::HifiGan => {
      process_hifigan_vocoder(job_state, job, &temp_dir).await?;
    }
  }

  // =====================================================

  info!("Marking job complete...");
  mark_generic_download_job_done(
    &job_state.mysql_pool,
    job,
    true,
    Some(&entity_token),
    Some(&entity_type),
  ).await?;

  info!("Saved model record: {}", id);

  job_state.firehose_publisher.publish_generic_download_finished(&job.creator_user_token, &model_token)
      .await
      .map_err(|e| {
        warn!("error publishing event: {:?}", e);
        anyhow!("error publishing event")
      })?;

  redis_logger.log_status("done")?;

  info!("Job done: {}", job.id.0);

  Ok(())
}
