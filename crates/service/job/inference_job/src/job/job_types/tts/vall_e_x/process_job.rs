use anyhow::anyhow;
use buckets::public::media_files::original_file::MediaFileBucketPath;
use cloud_storage::bucket_client::BucketClient;
use hashing::sha256::sha256_hash_file::sha256_hash_file;
use filesys::file_size::file_size;
use enums::by_table::generic_inference_jobs::inference_result_type::InferenceResultType;

use log::{ error, info, warn };
use mysql_queries::queries::media_files::get_media_file::MediaFile;
use mysql_queries::queries::media_files::insert_media_file_from_zero_shot_tts::InsertArgs;
use mysql_queries::queries::media_files::insert_media_file_from_zero_shot_tts::insert_media_file_from_face_zero_shot;
use mysql_queries::queries::voice_designer::datasets::get_dataset::get_dataset_by_token;
use mysql_queries::queries::voice_designer::datasets::list_datasets::DatasetRecordForList;
use mysql_queries::queries::voice_designer::voice_samples::list_dataset_samples_for_dataset_token::DatasetSampleRecordForList;

use mysql_queries::queries::voice_designer::voice_samples::get_dataset_sample;
use mysql_queries::queries::voice_designer::voice_samples::get_dataset_sample::get_dataset_sample_by_token;
use mysql_queries::queries::voice_designer::voice_samples::list_dataset_samples_for_dataset_token::list_dataset_samples_for_dataset_token;
use mysql_queries::queries::voice_designer::voices::get_voice::get_voice_by_token;
use std::path::PathBuf;
use std::time::Instant;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;

use crate::job;
use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::job_success_result::ResultEntity;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::tts::vall_e_x::validate_job::validate_job;

use crate::job::job_types::tts::vall_e_x::vall_e_x_inference_command::CreateVoiceArgs;
use crate::job_dependencies::JobDependencies;
use crate::job::job_types::tts::vall_e_x::vall_e_x_inference_command::InferenceArgs;
use cloud_storage::bucket_path_unifier::BucketPathUnifier;

use super::validate_job::JobType;

const BUCKET_FILE_PREFIX: &str = "fakeyou_";
const BUCKET_FILE_EXTENSION: &str = ".wav";
const MIME_TYPE: &str = "audio/wav";
pub struct VoiceFile {
    pub filesystem_path: PathBuf,
}

pub struct AudioFile {
    pub filesystem_path: PathBuf,
}


pub async fn download_voice_embedding_from_hash(
    bucket_hash: &str,
    name: &str,
    private_bucket_client: &BucketClient,
    path: &PathBuf
) -> Result<VoiceFile, ProcessSingleJobError> {
    let unifer = BucketPathUnifier::default_paths();
    let object_path = unifer.zero_shot_tts_speaker_encoding(bucket_hash, 0);

    let mut path = path.clone();

    let file_name = format!("{}", name);
    path.push(&file_name);

    let result = private_bucket_client.download_file_to_disk(object_path, &path).await;

    let voice_file = VoiceFile {
        filesystem_path: PathBuf::from(&path.clone()),
    };
  

    Ok(voice_file)
}

pub async fn download_audio_from_hash( 
    bucket_hash: &str,
    name: &str,
    private_bucket_client: &BucketClient,
    path: &PathBuf
)-> Result<AudioFile, ProcessSingleJobError> {
    let unifer = BucketPathUnifier::default_paths();
    let object_path = unifer.zero_shot_tts_speaker_encoding(bucket_hash, 0);

    let mut path = path.clone();

    let file_name = format!("{}", name);
    path.push(&file_name);

    let result = private_bucket_client.download_file_to_disk(object_path, &path).await;

    let audio_file = AudioFile {
        filesystem_path: PathBuf::from(&path.clone()),
    };

    Ok(audio_file)
}


// This will download everything get into the root host OS then ... will invoke inference using the pathes from the files invoked
pub struct VALLEXProcessJobArgs<'a> {
    pub job_dependencies: &'a JobDependencies,
    pub job: &'a AvailableInferenceJob,
}

pub async fn process_create_voice(
    args: VALLEXProcessJobArgs<'_>,
    dataset_token: String
) -> Result<JobSuccessResult, ProcessSingleJobError> {

    let deps = args.job_dependencies;
    let job = args.job;
    let mysql_pool = &deps.mysql_pool;
    // get some globals
    let mut job_progress_reporter = deps.job_progress_reporter
        .new_generic_inference(job.inference_job_token.as_str())
        .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

        let voice_dataset_token = tokens::tokens::zs_voice_datasets::ZsVoiceDatasetToken(dataset_token);

        // download data set files into a temp directory
        let work_temp_dir = format!("/tmp/temp_zeroshot_create_voice_{}", job.id.0);
        // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
        let work_temp_dir = args.job_dependencies.fs.scoped_temp_dir_creator_for_work
            .new_tempdir(&work_temp_dir)
            .map_err(|e| ProcessSingleJobError::from_io_error(e))?;
    
        let workdir = work_temp_dir.path().to_path_buf();

        let dataset = list_dataset_samples_for_dataset_token(&voice_dataset_token, false, &mysql_pool).await?;
        
        let downloaded_dataset:Vec<PathBuf> = Vec::new();

        for (index,record) in dataset.iter().enumerate() {
            
            let audio_media_file = MediaFileBucketPath::from_object_hash(
                &record.public_bucket_directory_hash,
                record.maybe_public_bucket_prefix,
                record.maybe_public_bucket_extension);

            let file_name_wav = format!("{}.wav", index);
            let file_path = PathBuf::new();
            file_path.push(workdir);
            file_path.push(file_path);
                
             // TODO we might want to catch the error and not include the pathes into download dataset
            deps.public_bucket_client.download_file_to_disk(audio_media_file.to_full_object_pathbuf(), file_path);

            downloaded_dataset.push(file_path);
        }

        // Need to download the models
        info!("Download models (if not present)...");

        for downloader in deps.job_type_details.vall_e_x.downloaders.all_downloaders() {
            let result = downloader.download_if_not_on_filesystem(
                &args.job_dependencies.private_bucket_client,
                &args.job_dependencies.fs.scoped_temp_dir_creator_for_downloads
            ).await;

            if let Err(e) = result {
                error!("could not download: {:?}", e);
                return Err(ProcessSingleJobError::from_anyhow_error(e));
            }
        }


    job_progress_reporter
    .log_status("running inference")
    .map_err(|e| ProcessSingleJobError::Other(e))?;

    let inference_start_time = Instant::now();

    let output_file_name = String::from("output.wav");

    // Run Inference
    let command_exit_status = args.job_dependencies.job_type_details.vall_e_x.create_embedding_command.execute_inference(
            CreateVoiceArgs {
                output_embedding_path: &workdir,
                output_embedding_name: file_name,
                audio_files: String::from(""), // " "
                stderr_output_file: String::from("zero_shot_create_voice.txt"),
            }
        );

    let inference_duration = Instant::now().duration_since(inference_start_time);


    Err(ProcessSingleJobError::Other(anyhow!("Error")))
}

pub async fn process_inference_voice(
    args: VALLEXProcessJobArgs<'_>,
    voice_token: String
) -> Result<JobSuccessResult, ProcessSingleJobError> {
    let deps = args.job_dependencies;
    let job = args.job;
    let mysql_pool = &deps.mysql_pool;
    // get some globals
    let mut job_progress_reporter = deps.job_progress_reporter
        .new_generic_inference(job.inference_job_token.as_str())
        .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

    // get job args
    let text = match job.maybe_raw_inference_text.clone() {
        Some(value) => { value }
        None => {
            return Err(ProcessSingleJobError::InvalidJob(anyhow!("Missing Text for Inference")));
        }
    };

    let voice_token = tokens::tokens::zs_voices::ZsVoiceToken(voice_token);

    // Get voice bucket hash - from voice token
    let voice_lookup_result = get_voice_by_token(&voice_token, false, &mysql_pool).await;

    let voice = match voice_lookup_result {
        Ok(Some(voice)) => voice,
        Ok(None) => {
            warn!("Voice not found: {:?}", voice_token);
            return Err(ProcessSingleJobError::Other(anyhow!("Voice not found: {:?}", voice_token)));
        }
        Err(err) => {
            warn!("Error looking up voice: {:?}", err);
            return Err(ProcessSingleJobError::Other(anyhow!("Error looking up voice: {:?}", err)));
        }
    };

    // Need to download the models
    info!("Download models (if not present)...");

    for downloader in deps.job_type_details.vall_e_x.downloaders.all_downloaders() {
        let result = downloader.download_if_not_on_filesystem(
            &args.job_dependencies.private_bucket_client,
            &args.job_dependencies.fs.scoped_temp_dir_creator_for_downloads
        ).await;

        if let Err(e) = result {
            error!("could not download: {:?}", e);
            return Err(ProcessSingleJobError::from_anyhow_error(e));
        }
    }

    // run inference
    let work_temp_dir = format!("/tmp/temp_zeroshot_inference_{}", job.id.0);

    // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
    let work_temp_dir = args.job_dependencies.fs.scoped_temp_dir_creator_for_work
        .new_tempdir(&work_temp_dir)
        .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

    let workdir = work_temp_dir.path().to_path_buf();

    let file_name = format!("{}_weights.npz", &voice.title);

    // USE THIS LATER SINCE it requires specific typing ...
    let voiceFile = download_voice_embedding_from_hash(
        &voice.bucket_hash,
        &file_name,
        &deps.private_bucket_client,
        &workdir
    ).await?;

    println!("voicefile path! {}", voiceFile.filesystem_path.to_string_lossy());

    // Download embeddings file using embedding token
    // Create a temp dir to download things to
    job_progress_reporter
        .log_status("running inference")
        .map_err(|e| ProcessSingleJobError::Other(e))?;

    let inference_start_time = Instant::now();

    let output_file_name = String::from("output.wav");

    // Run Inference
    let command_exit_status =
        args.job_dependencies.job_type_details.vall_e_x.inference_command.execute_inference(
            InferenceArgs {
                input_embedding_path: &workdir,
                input_embedding_name: file_name,
                input_text: String::from(text), // text
                output_file_name: output_file_name.clone(), // output file name in the output folder
                stderr_output_file: String::from("zero_shot_inference.txt"),
            }
        );
    let inference_duration = Instant::now().duration_since(inference_start_time);

    // upload audio to bucket
    info!("Uploading media ...");

    let result_bucket_location = MediaFileBucketPath::generate_new(
        Some(BUCKET_FILE_PREFIX),
        Some(BUCKET_FILE_EXTENSION)
    );

    let result_bucket_object_pathbuf = result_bucket_location.to_full_object_pathbuf();

    let mut finished_file = work_temp_dir.path().to_path_buf();
    finished_file.push(&output_file_name);

    args.job_dependencies.public_bucket_client
        .upload_filename_with_content_type(
            &result_bucket_object_pathbuf,
            &finished_file,
            &MIME_TYPE
        )
        .await // TODO: We should check the mimetype to make sure bad payloads can't get uploaded
        .map_err(|e| ProcessSingleJobError::Other(e))?;

    // ==================== UPLOAD AUDIO TO BUCKET ====================
    info!("Calculating sha256...");

    let file_checksum = sha256_hash_file(&finished_file).map_err(|err| {
        ProcessSingleJobError::Other(anyhow!("Error hashing file: {:?}", err))
    })?;

    let file_size_bytes = file_size(&finished_file).map_err(|err|
        ProcessSingleJobError::Other(err)
    )?;

    job_progress_reporter.log_status("done").map_err(|e| ProcessSingleJobError::Other(e))?;

    // insert into db the record
    let (media_file_token, id) = insert_media_file_from_face_zero_shot(InsertArgs {
        pool: &args.job_dependencies.mysql_pool,
        job: &job,
        maybe_mime_type: Some(&MIME_TYPE),
        file_size_bytes,
        sha256_checksum: &file_checksum,
        public_bucket_directory_hash: result_bucket_location.get_object_hash(),
        maybe_public_bucket_prefix: Some(BUCKET_FILE_PREFIX),
        maybe_public_bucket_extension: Some(BUCKET_FILE_EXTENSION),
        is_on_prem: args.job_dependencies.container.is_on_prem,
        worker_hostname: &args.job_dependencies.container.hostname,
        worker_cluster: &args.job_dependencies.container.cluster_name,
    }).await.map_err(|e| ProcessSingleJobError::Other(e))?;

    info!(
        "Job {:?} complete success! Downloaded, ran inference, and uploaded. Saved model record: {}, Result Token: {}",
        job.id,
        id,
        &media_file_token
    );

    Ok(JobSuccessResult {
        maybe_result_entity: Some(ResultEntity {
            entity_type: InferenceResultType::MediaFile,
            entity_token: media_file_token.to_string(),
        }),
        inference_duration,
    })
}
// query using the token then grab the bucket hash
pub async fn process_job(
    args: VALLEXProcessJobArgs<'_>
) -> Result<JobSuccessResult, ProcessSingleJobError> {
    let job = args.job;
    let deps = args.job_dependencies;

    // get args token
    let jobArgs = validate_job(&job)?; // bubbles error up

    match jobArgs.job_type {
        JobType::Create => {
            if let Some(voice_dataset_token) = jobArgs.voice_dataset_token {
                process_create_voice(args, voice_dataset_token).await
            } else {
                Err(ProcessSingleJobError::Other(anyhow!("Missing Dataset Token?")))
            }
        }
        JobType::Inference => {
            if let Some(voice_token) = jobArgs.voice_token {
                process_inference_voice(args, voice_token).await
            } else {
                Err(ProcessSingleJobError::Other(anyhow!("Missing Voice Token?")))
            }
        }
    }
}

fn join_paths(paths: Vec<PathBuf>)-> String {
    paths.into_iter()
    .map(|p| format!("\"{}\"",p.display()))
    .collect::<Vec<String>>()
    .join(" ")
}
mod tests {

    use super::*;
    #[test]
    fn test_length_zero() {
       let paths = vec![
        PathBuf::from("/home/tensor/code/TTSDockerContainer/Vall-E-mount/input/20.wav"),
        PathBuf::from("/home/tensor/code/TTSDockerContainer/Vall-E-mount/input/21.wav")
       ];

       let value = join_paths(paths);
       let expected = "\"/home/tensor/code/TTSDockerContainer/Vall-E-mount/input/20.wav\" \"/home/tensor/code/TTSDockerContainer/Vall-E-mount/input/21.wav\"";
       assert_eq!(value,expected );
    }
}
