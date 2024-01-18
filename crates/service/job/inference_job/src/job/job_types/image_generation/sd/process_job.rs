use std::env::temp_dir;
use std::ops::Deref;
use std::path::PathBuf;
use std::thread;
use std::thread::Thread;
use std::time::{Duration, Instant};
use cloud_storage::remote_file_manager::remote_cloud_bucket_details::RemoteCloudBucketDetails;
use mysql_queries::payloads::generic_inference_args::image_generation_payload::StableDiffusionArgs;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::model_weights::get_weight::get_weight_by_token;
use crate::job::job_loop::job_success_result::{ JobSuccessResult, ResultEntity };
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job_dependencies::JobDependencies;
use anyhow::anyhow;
use log::info;
use sqlx::MySqlPool;
use cloud_storage::remote_file_manager::media_descriptor::MediaImagePngDescriptor;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::PolymorphicInferenceArgs;

use cloud_storage::remote_file_manager::remote_cloud_file_manager::RemoteCloudFileClient;
use cloud_storage::remote_file_manager::weights_descriptor::WeightsLoRADescriptor;
use enums::by_table::generic_inference_jobs::inference_result_type::InferenceResultType::UploadModel;
use enums::by_table::generic_synthetic_ids::id_category::IdCategory::MediaFile;
use enums::by_table::media_files::media_file_type::MediaFileType;
use enums::by_table::media_uploads::media_upload_source::MediaUploadSource;
use enums::by_table::media_uploads::media_upload_type::MediaUploadType;
use enums::by_table::model_weights::weights_category::WeightsCategory;
use enums::by_table::model_weights::weights_types::WeightsType;
use enums::common::visibility::Visibility;
use filesys::path_to_string::path_to_string;
use filesys::safe_delete_temp_directory::safe_delete_temp_directory;
use mysql_queries::payloads::media_upload_modification_details::MediaUploadModificationDetails;
use mysql_queries::queries::media_files::create::insert_media_file_from_file_upload::{insert_media_file_from_file_upload, InsertMediaFileFromUploadArgs, UploadType};
use mysql_queries::queries::media_uploads::insert_media_upload::{Args, insert_media_upload};
use tokens::tokens::anonymous_visitor_tracking::AnonymousVisitorTrackingToken;
use tokens::tokens::model_weights::ModelWeightToken;
use tokens::tokens::users::UserToken;
use crate::job::job_types::image_generation::sd::sd_inference_command::InferenceArgs;
use crate::job::job_types::image_generation::sd::stable_diffusion_dependencies::StableDiffusionDependencies;
use crate::job::job_types::image_generation::sd::validate_inputs::validate_inputs;

use google_drive_common::google_drive_download_command::GoogleDriveDownloadCommand;
use mysql_queries::queries::model_weights::create::create_weight::{create_weight, CreateModelWeightsArgs};

pub struct StableDiffusionProcessArgs<'a> {
    pub job_dependencies: &'a JobDependencies,
    pub job: &'a AvailableInferenceJob,
}


// run inference
// insert record into the db with the inference job token complete.

pub async fn sd_args_from_job(
    args: &StableDiffusionProcessArgs<'_>
) -> Result<StableDiffusionArgs, ProcessSingleJobError> {
    let inference_args = args.job.maybe_inference_args
        .as_ref()
        .map(|args| args.args.as_ref())
        .flatten();
    let polymorphic_args = match inference_args {
        Some(args) => args,
        None => {
            return Err(
                ProcessSingleJobError::from_anyhow_error(anyhow!("no inference args for job!"))
            );
        }
    };
    let sd_args = match polymorphic_args {
        PolymorphicInferenceArgs::Ig(args) => args,
        _ => {
            return Err(
                ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inner args for job!"))
            );
        }
    };
    let stable_diffusion_args: StableDiffusionArgs = StableDiffusionArgs::from(sd_args.clone());
    Ok(stable_diffusion_args)
}

// store the prompt and cluster them today.

pub async fn process_job_selection (args: StableDiffusionProcessArgs<'_>
) -> Result<JobSuccessResult, ProcessSingleJobError> {
    let job = args.job;
    let sd_args = sd_args_from_job(&args).await?;
    if sd_args.type_of_inference == "inference" {
        process_job_inference(&args).await
    }
    else if sd_args.type_of_inference == "lora" {
        process_job_lora(&args).await
    }
    else if sd_args.type_of_inference == "checkpoint"{
        process_job_inference(&args).await
    }
    else {
        Err(ProcessSingleJobError::Other(anyhow!("inference type doesn't exist!")))
    }
}

pub async fn process_job_checkpoint(args: &StableDiffusionProcessArgs<'_>) -> Result<JobSuccessResult, ProcessSingleJobError> {

    // insert model record in create model record

    // let maybe_result_entity = ResultEntity {
    //     entity_type: InferenceResultType::UploadModel,
    //     entity_token:
    // };
    Ok(JobSuccessResult {
        maybe_result_entity: None,
        inference_duration: Duration::from_secs(0),
    })
}
pub async fn process_job_lora(args: &StableDiffusionProcessArgs<'_>) -> Result<JobSuccessResult, ProcessSingleJobError> {
    Ok(JobSuccessResult {
        maybe_result_entity: None,
        inference_duration: Duration::from_secs(0),
    })
}

pub async fn process_job_inference(
    args: &StableDiffusionProcessArgs<'_>
) -> Result<JobSuccessResult, ProcessSingleJobError> {
    let job = args.job;
    let deps = args.job_dependencies;
    let mysql_pool = &deps.db.mysql_pool;


    let sd_args = sd_args_from_job(&args).await?;
    let sd_deps = match &args.job_dependencies.job.job_specific_dependencies.maybe_stable_diffusion_dependencies {
        None => {
            return Err(ProcessSingleJobError::Other(anyhow!("Missing Job Specific Dependencies")));
        }
        Some(val) => {
            val
        }
    };

    let creator_user_token:UserToken;
    match &job.maybe_creator_user_token {
        Some(token) => {
            creator_user_token = UserToken::new_from_str(token);
        },
        None => {
            return Err(ProcessSingleJobError::InvalidJob(anyhow!("Missing Creator User Token")));
        }
    }


    let mut job_progress_reporter = args.job_dependencies.clients.job_progress_reporter
        .new_generic_inference(job.inference_job_token.as_str())
        .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;
    //==================== TEMP DIR ==================== //

    let work_temp_dir = format!("temp_stable_diffusion_inference_{}", job.id.0);

    // thread::sleep(seconds) to check the directory

    //NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
    let mut work_temp_dir = args.job_dependencies.fs.scoped_temp_dir_creator_for_work
        .new_tempdir(&work_temp_dir)
        .map_err(|e| ProcessSingleJobError::from_io_error(e))?;


    let sd_checkpoint_path = work_temp_dir.path().join("sd_checkpoint.safetensors");
    let lora_path = work_temp_dir.path().join("lora.safetensors");
    let vae_path = work_temp_dir.path().join("vae.safetensors");
    let output_path = work_temp_dir.path().join("output");
    let g_drive_path = work_temp_dir.path().join("gdrive");

    info!("Paths to download to:");
    info!("sd_checkpoint_path:{}",sd_checkpoint_path.display());
    info!("lora_path:{}",lora_path.display());
    info!("vae_path:{}",vae_path.display());
    info!("output_path:{}",output_path.display());
    info!("tmp_google_drive_path:{}",g_drive_path.display());

    // If it is not inference then it must be loRA or checkpoint downloading
    if sd_args.type_of_inference != "inference" {
        let mut download_url= String::from("");

        if sd_args.type_of_inference == "lora" {
            download_url = match sd_args.maybe_lora_upload_path {
                Some(val) => { val },
                None => { "".to_string() }
            };
        }
        else if sd_args.type_of_inference == "checkpoint" {
            download_url = match sd_args.maybe_upload_path {
                Some(val) => { val },
                None => { "".to_string() }
            }
        }

        if download_url.len() <= 0 {
            return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("Failed to Download URL Missing")));
        }
        let file_name = "download.safetensors";
        let download_script = easyenv::get_env_string_or_default(
            "DOWNLOAD_SCRIPT",
            "./scripts/download_internet_file.py");
        let google_drive_downloader =
            GoogleDriveDownloadCommand::new_production(&download_script);
        info!("Downloading {}",download_url);
        let download_filename = match google_drive_downloader.download_file_with_file_name(&download_url, &work_temp_dir,file_name).await {
            Ok(filename) => filename,
            Err(e) => {
                return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("Failed to Download")));
            }
        };
        let download_file_path = work_temp_dir.path().join(file_name);
        info!("File Retrieved at {}",download_file_path.display());
    }

    // // Unpack loRA and Checkpoint
    // // run inference by downloading from google drive.
    let lora_token = sd_args.maybe_lora_model_token;
    let weight_token = sd_args.maybe_sd_model_token;

    let retrieved_sd_record = match weight_token {
        Some(token) => {
            let retrieved_sd_record = get_weight_by_token(
                &token,
                false,
                &deps.db.mysql_pool
            ).await?;
            match retrieved_sd_record {
                Some(record) => record,
                None => {
                    return Err(
                        ProcessSingleJobError::from_anyhow_error(anyhow!("no record of model!"))
                    );
                }
            }
        }
        None => {
            return Err(
                ProcessSingleJobError::from_anyhow_error(anyhow!("no sd model token for job!"))
            );
        }
    };

    // ignore if no lora token
    let retrieved_loRA_record = match lora_token {
        Some(token) => {
            let retrieved_loRA_record = get_weight_by_token(
                &token,
                false,
                &deps.db.mysql_pool
            ).await?;
            Some(retrieved_loRA_record)
        }
        None => None,
    };

    let remote_cloud_file_client = RemoteCloudFileClient::get_remote_cloud_file_client().await?;

    // Details for SD checkpoint
    let details = RemoteCloudBucketDetails::new(
        retrieved_sd_record.public_bucket_hash.clone(),
        retrieved_sd_record.maybe_public_bucket_prefix.clone().unwrap_or_else(|| "".to_string()),
        retrieved_sd_record.maybe_public_bucket_extension.clone().unwrap_or_else(|| "".to_string())
    );
    remote_cloud_file_client.download_file(details, path_to_string(sd_checkpoint_path.clone())).await?;

    match retrieved_loRA_record {
        Some(record) => {
            match record {
                Some(model_weight_record) => {

                    let lora_details = RemoteCloudBucketDetails::new(
                        model_weight_record.public_bucket_hash.clone(),
                        model_weight_record.maybe_public_bucket_prefix
                            .clone()
                            .unwrap_or_else(|| "".to_string()),
                        model_weight_record.maybe_public_bucket_extension
                            .clone()
                            .unwrap_or_else(|| "".to_string())
                    );
                    remote_cloud_file_client.download_file(
                        lora_details,
                        path_to_string(lora_path.clone())
                    ).await?;

                }
                None => {}
            }
        }
        None => {}
    }

    // VAE token for now
    let vae_token = String::from("weight_rb0959wfzjhk3d1k93hr3s0qw");
    let model_weight_vae = ModelWeightToken(vae_token);

    let vae_weight_record =  get_weight_by_token(
        &model_weight_vae,
        false,
        &deps.db.mysql_pool
    ).await?;

    let vae_weight_record = match vae_weight_record {
        Some(val) => {
            val
        },
        None => {
            return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no VAE? thats a problem.")))
        }
    };


    let vae_details = RemoteCloudBucketDetails::new(
        vae_weight_record.public_bucket_hash.clone(),
        vae_weight_record.maybe_public_bucket_prefix
            .clone()
            .unwrap_or_else(|| "".to_string()),
        vae_weight_record.maybe_public_bucket_extension
            .clone()
            .unwrap_or_else(|| "".to_string())
    );

    remote_cloud_file_client.download_file(
        vae_details,
        path_to_string(vae_path.clone())
    ).await?;

    let prompt = match sd_args.maybe_prompt {
        Some(val) => {
            val
        }
        None => return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("No Prompt provided!")))
    };

    let stderr_output_file = work_temp_dir.path().join("sd_err.txt");

    let number_of_samples = match sd_args.maybe_number_of_samples {
        Some(val) => {
            val
        },
        None => {
            20
        }
    };
    let inference_start_time = Instant::now();

    sd_deps.inference_command.execute_inference(InferenceArgs {
        work_dir: work_temp_dir.path().to_path_buf(),
        output_file: output_path.clone(),
        stderr_output_file: stderr_output_file,
        prompt: prompt,
        negative_prompt:sd_args.maybe_n_prompt.unwrap_or_default(),
        number_of_samples: number_of_samples,
        samplers: sd_args.maybe_sampler.unwrap_or(String::from("Euler a")),
        width: sd_args.maybe_width.unwrap_or(512),
        height: sd_args.maybe_height.unwrap_or(512),
        cfg_scale: sd_args.maybe_cfg_scale.unwrap_or(7),
        seed: sd_args.maybe_seed.unwrap_or(1),
        lora_path: lora_path.clone(),
        checkpoint_path: sd_checkpoint_path.clone(),
        vae: vae_path.clone(),
        batch_count: sd_args.maybe_batch_count.unwrap_or(1),
    });

    let inference_duration = Instant::now().duration_since(inference_start_time);
    let creator_ip_address = &job.creator_ip_address;
    // run a for loop for output images output_0 in the folder then use upload media.
    // pngs

    if sd_args.type_of_inference == "inference" {
        // gather all the images into a single batch


        for i in 0..sd_args.maybe_batch_count.unwrap_or(1) {
            let path = output_path.clone();
            let file_path = format!("{}_{}.png", path_to_string(path), i);
            println!("Upload File Path:{}", file_path);
            let metadata = remote_cloud_file_client.upload_file(Box::new(MediaImagePngDescriptor {}), file_path.as_ref()).await?;

            let bucket_details = match metadata.bucket_details {
                Some(val) => { val }
                None => return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no VAE? thats a problem.")))
            };

            // TODO: Generic Insert with batch id.
            // insert media file generic should run here.
            insert_media_file_from_file_upload(InsertMediaFileFromUploadArgs {
                pool: mysql_pool,
                maybe_creator_user_token: Some(&creator_user_token),
                maybe_creator_anonymous_visitor_token: None,
                creator_ip_address: creator_ip_address,
                creator_set_visibility: Default::default(),
                upload_type: UploadType::Filesystem,
                media_file_type: MediaFileType::Image,
                maybe_mime_type: Some(metadata.mimetype.as_ref()),
                file_size_bytes: metadata.file_size_bytes,
                duration_millis: inference_duration.as_secs() * 1000,
                sha256_checksum: metadata.sha256_checksum.as_str(),
                public_bucket_directory_hash: bucket_details.object_hash.as_str(),
                maybe_public_bucket_prefix: Some(bucket_details.prefix.as_str()),
                maybe_public_bucket_extension: Some(bucket_details.suffix.as_str()),
            }).await?;
        }

        // hack to check the directory before clean up.
        let thirtyMinutes = 1800;
        thread::sleep(Duration::from_secs(thirtyMinutes));
        // upload media and create a record.

        Ok(JobSuccessResult {// TODO: batch token needs to go here
            maybe_result_entity: None,
            inference_duration: Duration::from_secs(0),
        })
    }
    else { // must be an upload and need upload token


        // The parameters will be updated on another screen perhaps?
        // so right now it will fill with the availible  values.
        create_weight(CreateModelWeightsArgs {
            token: &ModelWeightToken::generate(),
            weights_type: WeightsType::StableDiffusion15,
            weights_category: WeightsCategory::ImageGeneration,
            title: "".to_string(),
            maybe_description_markdown: None,
            maybe_description_rendered_html: None,
            creator_user_token: Some(&creator_user_token),
            creator_ip_address: creator_ip_address,
            creator_set_visibility: Default::default(),
            maybe_last_update_user_token: None,
            original_download_url: None,
            original_filename: None,
            file_size_bytes: 0,
            file_checksum_sha2: "".to_string(),
            public_bucket_hash: "".to_string(),
            maybe_public_bucket_prefix: None,
            maybe_public_bucket_extension: None,
            version: 0,
            mysql_pool,
        }).await?;

        Ok(JobSuccessResult {// TODO: batch token needs to go here
            maybe_result_entity: None,
            inference_duration: Duration::from_secs(0),
        })
    }



}

#[cfg(test)]
mod tests {
use anyhow::anyhow;
use std::path::PathBuf;
use cloud_storage::remote_file_manager::{
remote_cloud_file_manager::{RemoteCloudFileClient, self},
remote_cloud_bucket_details::RemoteCloudBucketDetails,
};
use errors::{AnyhowError, AnyhowResult};
#[tokio::test]
    async fn test_seed_weights_files() -> AnyhowResult<()> {
        let seed_path = PathBuf::from("/storyteller/root/custom-seed-tool-data");
        let remote_cloud_file_client = RemoteCloudFileClient::get_remote_cloud_file_client().await;
        let remote_cloud_file_client = match remote_cloud_file_client {
            Ok(res) => {
                res
            }
            Err(_) => {
                return Err(anyhow!("failed to get remote cloud file client"));
            }
        };

        let mut path_dl1 = seed_path.clone();
        path_dl1.push("downloads/loRA");
        let mut path_dl2 = seed_path.clone();
        path_dl2.push("downloads/checkpoint");

        let bucket_details1 = RemoteCloudBucketDetails {
            object_hash: String::from("apa0ej6es8d3ss2gwtf1cghge35qn9tn"),
            prefix: String::from("sd15"),
            suffix: String::from("safetensors"),
        };

        let bucket_details2 = RemoteCloudBucketDetails {
            object_hash: String::from("27kz11et18fargyyxbj66ntfn621k9d3"),
            prefix: String::from("loRA"),
            suffix: String::from("safetensors"),
        };

        remote_cloud_file_client.download_file(bucket_details1, String::from("./checkpoint")).await?;
        remote_cloud_file_client.download_file(bucket_details2, String::from("./loRA")).await?;

        Ok(())
    }
}
