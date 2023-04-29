use anyhow::anyhow;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::tts::process_single_tts_job::process_single_tts_job;
use crate::job::job_types::vc::process_single_vc_job::process_single_vc_job;
use crate::job_dependencies::JobDependencies;
use enums::by_table::generic_inference_jobs::inference_category::InferenceCategory;
use errors::AnyhowResult;
use log::{info, warn};
use enums::by_table::generic_inference_jobs::inference_result_type::InferenceResultType;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::generic_inference::job::mark_generic_inference_job_pending_and_grab_lock::mark_generic_inference_job_pending_and_grab_lock;
use mysql_queries::queries::generic_inference::job::mark_generic_inference_job_successfully_done::mark_generic_inference_job_successfully_done;
use crate::job::job_loop::job_success_result::ResultEntity;

pub async fn process_single_job(job_dependencies: &JobDependencies, job: &AvailableInferenceJob) -> Result<(), ProcessSingleJobError> {
  // TODO(bt, 2023-01-11): Restore an optional status logger
  //let mut redis = job_dependencies.redis_pool.get()?;
  //let mut redis_logger = RedisJobStatusLogger::new_generic_download(&mut redis, job.download_job_token.as_str());

  // ==================== ATTEMPT TO GRAB JOB LOCK ==================== //

  let lock_acquired = mark_generic_inference_job_pending_and_grab_lock(
    &job_dependencies.mysql_pool,
    job.id,
    &job_dependencies.container_db,
  ).await
      .map_err(|err| ProcessSingleJobError::Other(anyhow!("database error: {:?}", err)))?;

  if !lock_acquired {
    warn!("Could not acquire job lock for: {}", &job.id.0);
    return Ok(())
  }

  info!("Beginning work on {:?} = {}", job.inference_category, job.inference_job_token);

  // ==================== SETUP TEMP DIRS ==================== //

  let temp_dir = format!("temp_{}", job.id.0);
  let temp_dir = job_dependencies.scoped_temp_dir_creator.new_tempdir(&temp_dir)
      .map_err(|err| ProcessSingleJobError::Other(anyhow!("filesystem error: {:?}", err)))?;

  let _p = temp_dir.path(); // TODO: Just so the build doesn't complain about unused. Remove.

  // ==================== HANDLE DIFFERENT INFERENCE TYPES ==================== //

  let mut maybe_result_entity : Option<ResultEntity>;

  let job_success_result = match job.inference_category {
    InferenceCategory::TextToSpeech => {
      process_single_tts_job(job_dependencies, job).await?
    }
    InferenceCategory::VoiceConversion => {
      process_single_vc_job(job_dependencies, job).await?
    }
  };

  let maybe_entity_type = job_success_result.maybe_result_entity
      .as_ref()
      .map(|result_entity| result_entity.entity_type);

  let maybe_entity_token = job_success_result.maybe_result_entity
      .as_ref()
      .map(|result_entity| result_entity.entity_token.as_str());

  // =====================================================

  info!("Marking job complete...");

  mark_generic_inference_job_successfully_done(
    &job_dependencies.mysql_pool,
    job,
    maybe_entity_type,
    maybe_entity_token,
  ).await
      .map_err(|err| ProcessSingleJobError::Other(anyhow!("database error: {:?}", err)))?;

  info!("Saved model record: {} - {}", job.id.0, &job.inference_job_token);

  // TODO(bt, 2023-01-11): Need to publish that the job finished.
  //  Publish the *correct type* of event.
  //job_dependencies.firehose_publisher.publish_generic_download_finished(
  //  &job.maybe_creator_user_token,
  //  entity_token.as_deref())
  //    .await
  //    .map_err(|e| {
  //      warn!("error publishing event: {:?}", e);
  //      anyhow!("error publishing event")
  //    })?;

  // TODO(bt, 2023-01-11): Restore optional Redis logging
  //redis_logger.log_status("done")?;

  info!("Job done: {}", job.id.0);

  Ok(())
}
