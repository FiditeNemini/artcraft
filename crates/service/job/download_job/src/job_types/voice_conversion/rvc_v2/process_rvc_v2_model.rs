use anyhow::anyhow;
use container_common::filesystem::check_file_exists::check_file_exists;
use container_common::filesystem::safe_delete_possible_temp_file::safe_delete_possible_temp_file;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use container_common::filesystem::safe_delete_temp_file::safe_delete_temp_file;
use crate::JobState;
use crate::job_loop::job_results::JobResults;
use crate::job_types::voice_conversion::rvc_v2::rvc_v2_model_check_command::CheckArgs;
use crockford::crockford_entropy_lower;
use enums::by_table::voice_conversion_models::voice_conversion_model_type::VoiceConversionModelType;
use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use filesys::file_size::file_size;
use jobs_common::redis_job_status_logger::RedisJobStatusLogger;
use log::{error, info, warn};
use mimetypes::mimetype_for_file::get_mimetype_for_file;
use mysql_queries::queries::generic_download::job::list_available_generic_download_jobs::AvailableDownloadJob;
use mysql_queries::queries::voice_conversion::models::insert_voice_conversion_model_from_download_job::{insert_voice_conversion_model_from_download_job, InsertVoiceConversionModelArgs};
use std::path::PathBuf;
use tempdir::TempDir;

/// Returns the token of the entity.
pub async fn process_rvc_v2_model<'a, 'b>(
  job_state: &JobState,
  job: &AvailableDownloadJob,
  temp_dir: &TempDir,
  download_filename: &str,
  redis_logger: &'a mut RedisJobStatusLogger<'b>,
) -> AnyhowResult<JobResults> {

  // ==================== DETERMINE FILE CONTENTS ==================== //

  let original_download_file_path = PathBuf::from(download_filename.clone());

  let maybe_mimetype = get_mimetype_for_file(&original_download_file_path)?;

  for _ in 0..20 {
    info!("Mimetype: {:?}", &maybe_mimetype);
  }

  // The mimetype MUST be application/zip!
  // There are two cases we support here:
  //   1. If it's a .pth file (pytorch pickle), it's zip compressed, but it's 100% model data
  //      (hundreds of files for weights)
  //   2. If it's a .zip file, it should have a .pt file and possibly an optional .index file
  //      we'll allow up to one extra file (txt or readme)
  if maybe_mimetype == Some("application/zip") {

    info!("\n========================================\n");

    let file = std::fs::File::open(&original_download_file_path)?;
    let reader = std::io::BufReader::new(file);
    let mut archive = zip::ZipArchive::new(reader)?;

    // https://drive.google.com/file/d/1YP8_OSBrtwz1Sf9gCw-9daizpyBVMtGS/view?usp=drive_link
    // Entry 0 is a file with name "added_IVF293_Flat_nprobe_1_TwilightSparkle_v2.index" (36187059 bytes)
    // Entry 1 is a file with name "TwilightSparkle.pth" (55226951 bytes)

    // https://drive.google.com/file/d/1TThj37azqeNRfnQdNN0XrzCHg03xrbhN/view?usp=sharing
    // (so-vits-svc) checkpoint_best_legacy_500.pt
    // Entry 0 is a file with name "archive/data.pkl" (71294 bytes)
    // Entry 1 is a file with name "archive/data/0" (3072 bytes)
    // Entry 2 is a file with name "archive/data/1" (516096 bytes)                                                                                                                             Entry 3 is a file with name "archive/data/10" (2097152 bytes)                                                                                                                           Entry 4 is a file with name "archive/data/100" (2359296 bytes)
    // Entry 5 is a file with name "archive/data/101" (3072 bytes)
    // Entry 6 is a file with name "archive/data/102" (2359296 bytes)
    // Entry 7 is a file with name "archive/data/103" (3072 bytes)
    // ...
    // Entry 222 is a file with name "archive/data/97" (3072 bytes)
    // Entry 223 is a file with name "archive/data/98" (2359296 bytes)
    // Entry 224 is a file with name "archive/data/99" (3072 bytes)
    // Entry 225 is a file with name "archive/version" (2 bytes)

    // https://drive.google.com/file/d/13Jo5wxCogcOM_qB5j2_lnNrnoPbNziJM/view?usp=sharing
    // AnneBoonchuy.pth
    // Entry 0 is a file with name "AnneBoonchuy/data.pkl" (61476 bytes)
    // Entry 1 is a file with name "AnneBoonchuy/data/0" (294912 bytes)
    // Entry 2 is a file with name "AnneBoonchuy/data/1" (384 bytes)
    // Entry 3 is a file with name "AnneBoonchuy/data/10" (384 bytes)
    // Entry 4 is a file with name "AnneBoonchuy/data/100" (384 bytes)
    // Entry 5 is a file with name "AnneBoonchuy/data/101" (384 bytes)
    // ...

    // https://drive.google.com/file/d/1EuUgaYFsSO-CVrEg-CeN5nN6lIb7S9UR/view?usp=sharing
    // AnneBoonchuy.index
    //


    for i in 0..archive.len() {
      let file = archive.by_index(i).unwrap();

      let outpath = match file.enclosed_name() {
        Some(path) => path,
        None => {
          println!("Entry {} has a suspicious path", file.name());
          continue;
        }
      };

      {
        let comment = file.comment();
        if !comment.is_empty() {
          println!("Entry {i} comment: {comment}");
        }
      }

      if (*file.name()).ends_with('/') {
        println!(
          "Entry {} is a directory with name \"{}\"",
          i,
          outpath.display()
        );
      } else {
        println!(
          "Entry {} is a file with name \"{}\" ({} bytes)",
          i,
          outpath.display(),
          file.size()
        );
      }
    }

    info!("\n========================================\n");
  }

  // 1) Tom_Petty_TalkNet.zip
  // https://drive.google.com/file/d/1hlCZ2BJJWVEd_9Fb9JPhrHX9IyeGOckK/view?usp=drive_link
  // Some("application/zip")

  // 2) BartSimpson.pth
  // https://drive.google.com/file/d/1oShUemIvi8h8KOxqgB0R2umNbCC8Y3rn/view?usp=drive_link
  // Some("application/zip") -- ugh
  //
  //

  // ==================== RUN MODEL CHECK ==================== //

  // TODO: Unzip bundled index files.
  // TODO: Handle models without an index file!? (Maybe we'll be lazy and _not_.)

  info!("Checking that model is valid...");

  redis_logger.log_status("checking rvc (v2) model")?;

  let original_model_file_path = PathBuf::from("/home/bt/models/rvc_v2/AnneBoonchuy.pth");
  //let original_model_index_file_path = PathBuf::from("/home/bt/models/rvc_v2/added_IVF119_Flat_nprobe_1_AnneBoonchuy_v2.index");
  let original_model_index_file_path : Option<PathBuf> = None;

  //let input_wav_path = PathBuf::from("input.wav"); // NB: Bundled with repo
  let output_wav_path = temp_dir.path().join("output.wav");

  let model_check_result = job_state.sidecar_configs.rvc_v2_model_check_command.execute_check(CheckArgs {
    model_path: &original_model_file_path,
    maybe_model_index_path: original_model_index_file_path.as_deref(),
    maybe_input_path: None, //Some(&input_wav_path),
    output_path: &output_wav_path,
    //device: Device::Cuda,
  });

  if let Err(e) = model_check_result {
    safe_delete_temp_file(&original_model_file_path);
    safe_delete_possible_temp_file(original_model_index_file_path.as_deref());
    safe_delete_temp_file(&output_wav_path);
    safe_delete_temp_directory(&temp_dir);
    return Err(anyhow!("model check error: {:?}", e));
  }

  // ==================== CHECK ALL FILES EXIST AND GET METADATA ==================== //

  info!("Checking that output wav file exists...");

  check_file_exists(&output_wav_path)?;

  let file_size_bytes = file_size(&original_model_file_path)?;

  // ==================== UPLOAD ORIGINAL MODEL FILE ==================== //

  info!("Uploading rvc (v2) voice conversion model to GCS...");

  let private_bucket_hash = crockford_entropy_lower(64);

  info!("Entropic bucket hash: {}", private_bucket_hash);

  let model_bucket_path = job_state.bucket_path_unifier.rvc_v2_model_path(&private_bucket_hash);

  info!("Destination bucket path (model): {:?}", &model_bucket_path);

  redis_logger.log_status("uploading rvc (v2) TTS model")?;

  if let Err(err) = job_state.bucket_client.upload_filename(&model_bucket_path, &original_model_file_path).await {
    error!("Problem uploading model file: {:?}", err);
    safe_delete_temp_file(&original_model_file_path);
    safe_delete_possible_temp_file(original_model_index_file_path.as_deref());
    safe_delete_temp_file(&output_wav_path);
    safe_delete_temp_directory(&temp_dir);
    return Err(err);
  }

  // ==================== UPLOAD ORIGINAL MODEL INDEX FILE ==================== //

  if let Some(original_index_file_path) = original_model_index_file_path.as_deref() {
    let model_index_bucket_path = job_state.bucket_path_unifier.rvc_v2_model_index_path(&private_bucket_hash);

    info!("Destination bucket path (index): {:?}", &model_index_bucket_path);

    if let Err(err) = job_state.bucket_client.upload_filename(&model_index_bucket_path, &original_index_file_path).await {
      error!("Problem uploading index file: {:?}", err);
      safe_delete_temp_file(&original_model_file_path);
      safe_delete_temp_file(&original_index_file_path);
      safe_delete_temp_file(&output_wav_path);
      safe_delete_temp_directory(&temp_dir);
      return Err(err);
    }
  }

  // ==================== DELETE DOWNLOADED FILE ==================== //

  // NB: We should be using a tempdir, but to make absolutely certain we don't overflow the disk...
  info!("Done uploading; deleting temporary files and paths...");
  safe_delete_temp_file(&original_model_file_path);
  safe_delete_possible_temp_file(original_model_index_file_path.as_deref());
  safe_delete_temp_file(&output_wav_path);
  safe_delete_temp_directory(&temp_dir);

  // ==================== SAVE RECORDS ==================== //

  info!("Saving Voice Conversion model record...");

  let (_id, model_token) = insert_voice_conversion_model_from_download_job(InsertVoiceConversionModelArgs {
    model_type: VoiceConversionModelType::RvcV2,
    title: &job.title,
    original_download_url: &job.download_url,
    original_filename: &download_filename,
    file_size_bytes,
    creator_user_token: &job.creator_user_token,
    creator_ip_address: &job.creator_ip_address,
    creator_set_visibility: Visibility::Public, // TODO: All models default to public at start
    has_index_file: original_model_index_file_path.is_some(),
    private_bucket_hash: &private_bucket_hash,
    private_bucket_object_name: "", // TODO: This should go away.
    mysql_pool: &job_state.mysql_pool,
  }).await?;

  job_state.badge_granter.maybe_grant_voice_conversion_model_uploads_badge(&job.creator_user_token)
      .await
      .map_err(|e| {
        warn!("error maybe awarding badge: {:?}", e);
        anyhow!("error maybe awarding badge")
      })?;

  Ok(JobResults {
    entity_token: Some(model_token.to_string()),
    entity_type: Some(VoiceConversionModelType::RvcV2.to_string()), // NB: This may be different from `GenericDownloadType` in the future!
  })
}
