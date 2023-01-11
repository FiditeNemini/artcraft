use crate::job_steps::job_dependencies::JobDependencies;
use database_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use errors::AnyhowResult;

pub async fn handle_tts_inference(
  _job_dependencies: &JobDependencies,
  _job: &AvailableInferenceJob,
) -> AnyhowResult<()> {

  /*
  TODO(bt, 2023-01-11): This was just copied verbatim from tts-inference-job.
   It's not ready to run from inference-job yet as it needs adjustments to the new schema.

  let mut job_progress_reporter = job_dependencies
      .job_progress_reporter
      .new_tts_inference(job.inference_job_token.as_str())
      .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

  // ==================== CONFIRM OR DOWNLOAD WAVEGLOW VOCODER MODEL ==================== //

  let waveglow_vocoder_model_fs_path = {
    let waveglow_vocoder_model_filename = job_dependencies.waveglow_vocoder_model_filename.clone();
    let waveglow_vocoder_model_fs_path = job_dependencies.semi_persistent_cache.tts_pretrained_vocoder_model_path(&waveglow_vocoder_model_filename);
    let waveglow_vocoder_model_object_path = job_dependencies.bucket_path_unifier.tts_pretrained_vocoders_path(&waveglow_vocoder_model_filename);

    maybe_download_file_from_bucket(
      "waveglow vocoder model",
      &waveglow_vocoder_model_fs_path,
      &waveglow_vocoder_model_object_path,
      &job_dependencies.private_bucket_client,
      &mut job_progress_reporter,
      "downloading vocoder (1 of 3)",
      job.id.0,
      &job_dependencies.scoped_temp_dir_creator,
    ).await?;

    waveglow_vocoder_model_fs_path
  };

  // ==================== CONFIRM OR DOWNLOAD HIFIGAN (NORMAL) VOCODER MODEL ==================== //

  let pretrained_hifigan_vocoder_model_fs_path = {
    let hifigan_vocoder_model_filename = job_dependencies.hifigan_vocoder_model_filename.clone();
    let hifigan_vocoder_model_fs_path = job_dependencies.semi_persistent_cache.tts_pretrained_vocoder_model_path(&hifigan_vocoder_model_filename);
    let hifigan_vocoder_model_object_path = job_dependencies.bucket_path_unifier.tts_pretrained_vocoders_path(&hifigan_vocoder_model_filename);

    maybe_download_file_from_bucket(
      "hifigan vocoder model",
      &hifigan_vocoder_model_fs_path,
      &hifigan_vocoder_model_object_path,
      &job_dependencies.private_bucket_client,
      &mut job_progress_reporter,
      "downloading vocoder (2 of 3)",
      job.id.0,
      &job_dependencies.scoped_temp_dir_creator,
    ).await?;

    hifigan_vocoder_model_fs_path
  };

  // ==================== CONFIRM OR DOWNLOAD HIFIGAN (SUPERRES) VOCODER MODEL ==================== //

  let hifigan_superres_vocoder_model_fs_path = {
    let hifigan_superres_vocoder_model_filename = job_dependencies.hifigan_superres_vocoder_model_filename.clone();
    let hifigan_superres_vocoder_model_fs_path = job_dependencies.semi_persistent_cache.tts_pretrained_vocoder_model_path(&hifigan_superres_vocoder_model_filename);
    let hifigan_superres_vocoder_model_object_path = job_dependencies.bucket_path_unifier.tts_pretrained_vocoders_path(&hifigan_superres_vocoder_model_filename);

    maybe_download_file_from_bucket(
      "hifigan superres vocoder model",
      &hifigan_superres_vocoder_model_fs_path,
      &hifigan_superres_vocoder_model_object_path,
      &job_dependencies.private_bucket_client,
      &mut job_progress_reporter,
      "downloading vocoder (3 of 3)",
      job.id.0,
      &job_dependencies.scoped_temp_dir_creator,
    ).await?;

    hifigan_superres_vocoder_model_fs_path
  };

//  // ==================== CONFIRM OR DOWNLOAD OPTIONAL CUSTOM VOCODER MODEL ==================== //

  let custom_vocoder_fs_path = match &model_record.maybe_custom_vocoder {
    None => None,
    Some(vocoder) => {
      let custom_vocoder_fs_path = job_dependencies.semi_persistent_cache.custom_vocoder_model_path(&vocoder.vocoder_token);
      let custom_vocoder_object_path  = job_dependencies.bucket_path_unifier.vocoder_path(&vocoder.vocoder_private_bucket_hash);

      maybe_download_file_from_bucket(
        "custom vocoder",
        &custom_vocoder_fs_path,
        &custom_vocoder_object_path,
        &job_dependencies.private_bucket_client,
        &mut job_progress_reporter,
        "downloading user vocoder",
        job.id.0,
        &job_dependencies.scoped_temp_dir_creator,
      ).await?;

      Some(custom_vocoder_fs_path)
    }
  };

  // ==================== CONFIRM OR DOWNLOAD TTS SYNTHESIZER MODEL ==================== //

  let tts_synthesizer_fs_path = {
    let tts_synthesizer_fs_path = job_dependencies.semi_persistent_cache.tts_synthesizer_model_path(&model_record.model_token);
    let tts_synthesizer_object_path  = job_dependencies.bucket_path_unifier.tts_synthesizer_path(&model_record.private_bucket_hash);

    maybe_download_file_from_bucket(
      "synthesizer",
      &tts_synthesizer_fs_path,
      &tts_synthesizer_object_path,
      &job_dependencies.private_bucket_client,
      &mut job_progress_reporter,
      "downloading synthesizer",
      job.id.0,
      &job_dependencies.scoped_temp_dir_creator,
    ).await?;

    tts_synthesizer_fs_path
  };

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

  job_progress_reporter.log_status("running inference")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  // TODO: Fix this.
  let maybe_unload_model_path = job_dependencies
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

  let hifigan_vocoder_model_fs_path_to_use = match custom_vocoder_fs_path {
    None => {
      info!("using pretrained HiFi-GAN vocoder");
      pretrained_hifigan_vocoder_model_fs_path
    },
    Some(custom_vocoder_fs_path) => {
      info!("using custom user-trained HiFi-GAN vocoder: {:?}", custom_vocoder_fs_path);
      custom_vocoder_fs_path
    },
  };

  // NB: Tacotron operates on decoder steps. 1000 steps is the default and correlates to
  //  roughly 12 seconds max. Here we map seconds to decoder steps.
  let max_decoder_steps = seconds_to_decoder_steps(job.max_duration_seconds);

  job_dependencies.http_clients.tts_inference_sidecar_client.request_inference(
    &cleaned_inference_text,
    max_decoder_steps,
    &tts_synthesizer_fs_path,
    pretrained_vocoder,
    &text_pipeline_type_or_guess.to_str(),
    &hifigan_vocoder_model_fs_path_to_use,
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

  job_progress_reporter.log_status("uploading result")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  let audio_result_object_path = job_dependencies.bucket_path_unifier.tts_inference_wav_audio_output_path(
    &job.uuid_idempotency_token); // TODO: Don't use this!

  info!("Audio destination bucket path: {:?}", &audio_result_object_path);

  info!("Uploading audio...");

  job_dependencies.public_bucket_client.upload_filename_with_content_type(
    &audio_result_object_path,
    &output_audio_fs_path,
    "audio/wav")
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  safe_delete_temp_file(&output_audio_fs_path);

  // ==================== UPLOAD SPECTROGRAM TO BUCKETS ==================== //

  let spectrogram_result_object_path = job_dependencies.bucket_path_unifier.tts_inference_spectrogram_output_path(
    &job.uuid_idempotency_token); // TODO: Don't use this!

  info!("Spectrogram destination bucket path: {:?}", &spectrogram_result_object_path);

  info!("Uploading spectrogram...");

  job_dependencies.public_bucket_client.upload_filename_with_content_type(
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

  let worker_name = job_dependencies.get_worker_name();

  info!("Saving tts inference record...");

  let (id, inference_result_token) = insert_tts_result(
    &job_dependencies.mysql_pool,
    job,
    &text_hash,
    pretrained_vocoder,
    &audio_result_object_path,
    &spectrogram_result_object_path,
    file_metadata.file_size_bytes,
    file_metadata.duration_millis.unwrap_or(0),
    job_dependencies.worker_details.is_on_prem,
    &worker_name,
    job_dependencies.worker_details.is_debug_worker)
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Marking job complete...");
  mark_tts_inference_job_done(
    &job_dependencies.mysql_pool,
    job.id,
    true,
    Some(&inference_result_token),
    &worker_name)
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("TTS Done. Original text was: {}", &job.raw_inference_text);

  job_dependencies.firehose_publisher.tts_inference_finished(
    job.maybe_creator_user_token.as_deref(),
    &model_record.model_token,
    &inference_result_token)
      .await
      .map_err(|e| {
        error!("error publishing event: {:?}", e);
        ProcessSingleJobError::Other(anyhow!("error publishing event"))
      })?;

  job_progress_reporter.log_status("done")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Job {:?} complete success! Downloaded, ran inference, and uploaded. Saved model record: {}, Result Token: {}",
        job.id, id, &inference_result_token);

  let duration = start.elapsed();

  since_creation_span.set_attribute("status", "success");
  since_creation_span.set_duration(duration);

  job_iteration_span.set_attribute("status", "success");
  job_iteration_span.set_duration(duration);

   */
  Ok(())
}