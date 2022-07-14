use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use container_common::filesystem::check_file_exists::check_file_exists;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use container_common::filesystem::safe_delete_temp_file::safe_delete_temp_file;
use container_common::hashing::hash_string_sha2::hash_string_sha2;
use container_common::token::random_uuid::generate_random_uuid;
use crate::job_steps::job_args::JobArgs;
use crate::job_steps::process_single_job_error::ProcessSingleJobError;
use database_queries::column_types::vocoder_type::VocoderType;
use database_queries::queries::tts::tts_inference_jobs::list_available_tts_inference_jobs::AvailableTtsInferenceJob;
use database_queries::queries::tts::tts_inference_jobs::mark_tts_inference_job_done::mark_tts_inference_job_done;
use database_queries::queries::tts::tts_inference_jobs::mark_tts_inference_job_pending_and_grab_lock::mark_tts_inference_job_pending_and_grab_lock;
use database_queries::queries::tts::tts_models::get_tts_model_for_inference::TtsModelForInferenceRecord;
use database_queries::queries::tts::tts_results::insert_tts_result::insert_tts_result;
use jobs_common::redis_job_status_logger::RedisJobStatusLogger;
use log::{warn, info, error};
use newrelic_telemetry::Span;
use std::fs::File;
use std::io::Read;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH, Instant};
use tempdir::TempDir;
use tts_common::clean_symbols::clean_symbols;
use tts_common::text_pipelines::guess_pipeline::guess_text_pipeline_heuristic;
use tts_common::text_pipelines::text_pipeline_type::TextPipelineType;

#[derive(Deserialize, Default)]
struct FileMetadata {
  pub duration_millis: Option<u64>,
  pub mimetype: Option<String>,
  pub file_size_bytes: u64,
}

fn read_metadata_file(filename: &PathBuf) -> AnyhowResult<FileMetadata> {
  let mut file = File::open(filename)?;
  let mut buffer = String::new();
  file.read_to_string(&mut buffer)?;
  Ok(serde_json::from_str(&buffer)?)
}

pub async fn process_single_job(
  inferencer: &JobArgs,
  job: &AvailableTtsInferenceJob,
  model_record: &TtsModelForInferenceRecord,
) -> Result<(Span, Span), ProcessSingleJobError> {

  let start = Instant::now();

  let span_id = generate_random_uuid();
  let trace_id = generate_random_uuid();
  let maybe_user_token = job.maybe_creator_user_token.as_deref().unwrap_or("");

  let mut job_iteration_span = Span::new(&span_id, &trace_id, get_timestamp_millis())
      .name("single job execution")
      .attribute("user_token", maybe_user_token)
      .service_name("tts-inference-job");

  let span_id = generate_random_uuid();
  let trace_id = generate_random_uuid();

  let created_at_timestamp = (job.created_at.timestamp() as u64) * 1000;

  let mut since_creation_span = Span::new(&span_id, &trace_id, created_at_timestamp)
      .name("job since creation")
      .attribute("user_token", maybe_user_token)
      .service_name("tts-inference-job");

  let mut redis = inferencer.redis_pool.get()
      .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

  let mut redis_logger = RedisJobStatusLogger::new_tts_inference(
    &mut redis,
    &job.inference_job_token);

  // ==================== ATTEMPT TO GRAB JOB LOCK ==================== //

  info!("Attempting to grab lock for job: {}", job.inference_job_token);

  let lock_acquired =
      mark_tts_inference_job_pending_and_grab_lock(&inferencer.mysql_pool, job.id)
          .await
          .map_err(|e| ProcessSingleJobError::Other(e))?;

  if !lock_acquired {
    warn!("Could not acquire job lock for: {:?}", &job.id);
    let duration = start.elapsed();

    since_creation_span.set_attribute("status", "failure");
    since_creation_span.set_duration(duration);

    job_iteration_span.set_attribute("status", "failure");
    job_iteration_span.set_duration(duration);

    return Ok((since_creation_span, job_iteration_span));
  }

  info!("Lock acquired for job: {}", job.inference_job_token);

  // ==================== CONFIRM OR DOWNLOAD WAVEGLOW VOCODER MODEL ==================== //

  let waveglow_vocoder_model_filename = inferencer.waveglow_vocoder_model_filename.clone();
  let waveglow_vocoder_model_fs_path = inferencer.semi_persistent_cache.tts_pretrained_vocoder_model_path(&waveglow_vocoder_model_filename);

  if !waveglow_vocoder_model_fs_path.exists() {
    warn!("Waveglow vocoder model file does not exist: {:?}", &waveglow_vocoder_model_fs_path);

    redis_logger.log_status("downloading vocoder (1 of 3)")
        .map_err(|e| ProcessSingleJobError::Other(e))?;

    let waveglow_vocoder_model_object_path = inferencer.bucket_path_unifier
        .tts_pretrained_vocoders_path(&waveglow_vocoder_model_filename);

    info!("Download waveglow vocoder from bucket path: {:?}", &waveglow_vocoder_model_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &waveglow_vocoder_model_object_path,
      &waveglow_vocoder_model_fs_path)
        .await
        .map_err(|e| ProcessSingleJobError::Other(e))?;

    info!("Downloaded waveglow vocoder model from bucket!");
  }

  // ==================== CONFIRM OR DOWNLOAD HIFIGAN (NORMAL) VOCODER MODEL ==================== //

  let hifigan_vocoder_model_filename = inferencer.hifigan_vocoder_model_filename.clone();
  let hifigan_vocoder_model_fs_path = inferencer.semi_persistent_cache.tts_pretrained_vocoder_model_path(&hifigan_vocoder_model_filename);

  if !hifigan_vocoder_model_fs_path.exists() {
    warn!("Hifigan vocoder model file does not exist: {:?}", &hifigan_vocoder_model_fs_path);

    redis_logger.log_status("downloading vocoder (2 of 3)")
        .map_err(|e| ProcessSingleJobError::Other(e))?;

    let hifigan_vocoder_model_object_path = inferencer.bucket_path_unifier
        .tts_pretrained_vocoders_path(&hifigan_vocoder_model_filename);

    info!("Download hifigan vocoder from bucket path: {:?}", &hifigan_vocoder_model_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &hifigan_vocoder_model_object_path,
      &hifigan_vocoder_model_fs_path)
        .await
        .map_err(|e| ProcessSingleJobError::Other(e))?;

    info!("Downloaded hifigan vocoder model from bucket!");
  }

  // ==================== CONFIRM OR DOWNLOAD HIFIGAN (SUPERRES) VOCODER MODEL ==================== //

  let hifigan_superres_vocoder_model_filename = inferencer.hifigan_superres_vocoder_model_filename.clone();
  let hifigan_superres_vocoder_model_fs_path = inferencer.semi_persistent_cache.tts_pretrained_vocoder_model_path(&hifigan_superres_vocoder_model_filename);

  if !hifigan_superres_vocoder_model_fs_path.exists() {
    warn!("Hifigan superres vocoder model file does not exist: {:?}", &hifigan_superres_vocoder_model_fs_path);

    redis_logger.log_status("downloading vocoder (3 of 3)")
        .map_err(|e| ProcessSingleJobError::Other(e))?;

    let hifigan_superres_vocoder_model_object_path = inferencer.bucket_path_unifier
        .tts_pretrained_vocoders_path(&hifigan_superres_vocoder_model_filename);

    info!("Download hifigan superres vocoder from bucket path: {:?}", &hifigan_superres_vocoder_model_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &hifigan_superres_vocoder_model_object_path,
      &hifigan_superres_vocoder_model_fs_path)
        .await
        .map_err(|e| ProcessSingleJobError::Other(e))?;

    info!("Downloaded hifigan superres vocoder model from bucket!");
  }

//  // ==================== LOOK UP TTS SYNTHESIZER RECORD (WHICH CONTAINS ITS BUCKET PATH) ==================== //
//
//  info!("Looking up TTS model by token: {}", &job.model_token);
//
//  let query_result = get_tts_model_by_token(
//    &inferencer.mysql_pool,
//    &job.model_token).await?;
//
//  let tts_model = match query_result {
//    Some(model) => model,
//    None => {
//      warn!("TTS model not found: {}", &job.model_token);
//      return Err(anyhow!("Model not found!"))
//    },
//  };

  // ==================== CONFIRM OR DOWNLOAD TTS SYNTHESIZER MODEL ==================== //

  // TODO: Let's just put paths in the db
  // TODO: We'll probably need to LRU cache these.

  let tts_synthesizer_fs_path = inferencer.semi_persistent_cache.tts_synthesizer_model_path(
    &model_record.model_token);

  if !tts_synthesizer_fs_path.exists() {
    info!("TTS synthesizer model file does not exist: {:?}", &tts_synthesizer_fs_path);

    redis_logger.log_status("downloading synthesizer")
        .map_err(|e| ProcessSingleJobError::Other(e))?;

    let tts_synthesizer_object_path  = inferencer.bucket_path_unifier
        .tts_synthesizer_path(&model_record.private_bucket_hash);

    info!("Download from template media path: {:?}", &tts_synthesizer_object_path);

    inferencer.private_bucket_client.download_file_to_disk(
      &tts_synthesizer_object_path,
      &tts_synthesizer_fs_path)
        .await
        .map_err(|e| ProcessSingleJobError::from_anyhow_error(e))?;

    info!("Downloaded template media from bucket!");
  }

  // ==================== Preprocess text ==================== //

  let cleaned_inference_text = clean_symbols(&job.raw_inference_text);

  // ==================== WRITE TEXT TO FILE ==================== //

  info!("Creating tempdir for inference results.");

  let temp_dir = format!("temp_tts_inference_{}", job.id.0);

  // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
  let temp_dir = TempDir::new(&temp_dir)
      .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

  let text_input_fs_path = temp_dir.path().join("inference_input.txt");

  std::fs::write(&text_input_fs_path, &cleaned_inference_text)
      .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

  // ==================== RUN INFERENCE ==================== //

  redis_logger.log_status("running inference")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  // TODO: Fix this.
  let maybe_unload_model_path = inferencer
      .virtual_model_lfu
      .insert_returning_replaced(tts_synthesizer_fs_path.to_str().unwrap_or(""))
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  if let Some(model_path) = maybe_unload_model_path.as_deref() {
    warn!("Remove model from LFU cache: {:?}", model_path);
  }

  let output_audio_fs_path = temp_dir.path().join("output.wav");
  let output_metadata_fs_path = temp_dir.path().join("metadata.json");
  let output_spectrogram_fs_path = temp_dir.path().join("spectrogram.json");

  info!("Running TTS inference...");

  info!("Expected output audio filename: {:?}", &output_audio_fs_path);
  info!("Expected output spectrogram filename: {:?}", &output_spectrogram_fs_path);
  info!("Expected output metadata filename: {:?}", &output_metadata_fs_path);

  if let Some(model_path) = maybe_unload_model_path.as_deref() {
    warn!("Unload model from sidecar: {:?}", &model_path);
  }

  //inferencer.tts_inference_command.execute(
  //  &tts_synthesizer_fs_path,
  //  &tts_vocoder_model_fs_path,
  //  &text_input_fs_path,
  //  &output_audio_fs_path,
  //  &output_spectrogram_fs_path,
  //  &output_metadata_fs_path,
  //  false,
  //)?;

  let mut pretrained_vocoder = VocoderType::HifiGanSuperResolution;
  if let Some(default_vocoder) = model_record.maybe_default_pretrained_vocoder.as_deref() {
    pretrained_vocoder = VocoderType::from_str(default_vocoder)
        .map_err(|e| ProcessSingleJobError::Other(e))?;
  }

  info!("With pretrained vocoder: {:?}", pretrained_vocoder);

  let text_pipeline_type_or_guess = model_record.text_pipeline_type
      .as_deref()
      .and_then(|pipeline_type|
          TextPipelineType::from_str(pipeline_type).ok())// NB: If there's an error deserializing, turn it to None.
      .unwrap_or_else(||
          guess_text_pipeline_heuristic(Some(model_record.created_at)));

  info!("With text pipeline type `{:?} ` (or guess: {:?})",
    &model_record.text_pipeline_type,
    &text_pipeline_type_or_guess);

  inferencer.tts_inference_sidecar_client.request_inference(
    &cleaned_inference_text,
    &tts_synthesizer_fs_path,
    pretrained_vocoder,
    &text_pipeline_type_or_guess.to_str(),
    &hifigan_vocoder_model_fs_path,
    &hifigan_superres_vocoder_model_fs_path,
    &waveglow_vocoder_model_fs_path,
    &output_audio_fs_path,
    &output_spectrogram_fs_path,
    &output_metadata_fs_path,
    maybe_unload_model_path)
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  // ==================== CHECK ALL FILES EXIST AND GET METADATA ==================== //

  info!("Checking that output files exist...");

  check_file_exists(&output_audio_fs_path).map_err(|e| ProcessSingleJobError::Other(e))?;
  check_file_exists(&output_spectrogram_fs_path).map_err(|e| ProcessSingleJobError::Other(e))?;
  check_file_exists(&output_metadata_fs_path).map_err(|e| ProcessSingleJobError::Other(e))?;

  let file_metadata = read_metadata_file(&output_metadata_fs_path)
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  safe_delete_temp_file(&output_metadata_fs_path);

  // ==================== UPLOAD AUDIO TO BUCKET ==================== //

  redis_logger.log_status("uploading result")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  let audio_result_object_path = inferencer.bucket_path_unifier.tts_inference_wav_audio_output_path(
    &job.uuid_idempotency_token); // TODO: Don't use this!

  info!("Audio destination bucket path: {:?}", &audio_result_object_path);

  info!("Uploading audio...");

  inferencer.public_bucket_client.upload_filename_with_content_type(
    &audio_result_object_path,
    &output_audio_fs_path,
    "audio/wav")
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  safe_delete_temp_file(&output_audio_fs_path);

  // ==================== UPLOAD SPECTROGRAM TO BUCKETS ==================== //

  let spectrogram_result_object_path = inferencer.bucket_path_unifier.tts_inference_spectrogram_output_path(
    &job.uuid_idempotency_token); // TODO: Don't use this!

  info!("Spectrogram destination bucket path: {:?}", &spectrogram_result_object_path);

  info!("Uploading spectrogram...");

  inferencer.public_bucket_client.upload_filename_with_content_type(
    &spectrogram_result_object_path,
    &output_spectrogram_fs_path,
    "application/json")
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  safe_delete_temp_file(&output_spectrogram_fs_path);

  // ==================== DELETE DOWNLOADED FILE ==================== //

  // NB: We should be using a tempdir, but to make absolutely certain we don't overflow the disk...
  safe_delete_temp_directory(&temp_dir);

  // ==================== SAVE RECORDS ==================== //

  let text_hash = hash_string_sha2(&cleaned_inference_text)
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Saving tts inference record...");
  let (id, inference_result_token) = insert_tts_result(
    &inferencer.mysql_pool,
    job,
    &text_hash,
    pretrained_vocoder,
    &audio_result_object_path,
    &spectrogram_result_object_path,
    file_metadata.file_size_bytes,
    file_metadata.duration_millis.unwrap_or(0),
    inferencer.worker_details.is_on_prem,
    &inferencer.worker_details.worker_hostname,
    inferencer.worker_details.is_debug_worker)
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Marking job complete...");
  mark_tts_inference_job_done(
    &inferencer.mysql_pool,
    job.id,
    true,
    Some(&inference_result_token))
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("TTS Done. Original text was: {}", &job.raw_inference_text);

  inferencer.firehose_publisher.tts_inference_finished(
    job.maybe_creator_user_token.as_deref(),
    &model_record.model_token,
    &inference_result_token)
      .await
      .map_err(|e| {
        error!("error publishing event: {:?}", e);
        ProcessSingleJobError::Other(anyhow!("error publishing event"))
      })?;

  redis_logger.log_status("done")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Job {:?} complete success! Downloaded, ran inference, and uploaded. Saved model record: {}, Result Token: {}",
        job.id, id, &inference_result_token);

  let duration = start.elapsed();

  since_creation_span.set_attribute("status", "success");
  since_creation_span.set_duration(duration);

  job_iteration_span.set_attribute("status", "success");
  job_iteration_span.set_duration(duration);

  Ok((since_creation_span, job_iteration_span))
}

fn get_timestamp_millis() -> u64 {
  SystemTime::now()
      .duration_since(UNIX_EPOCH)
      .map(|d| d.as_millis() as u64)
      .unwrap_or(0)
}
