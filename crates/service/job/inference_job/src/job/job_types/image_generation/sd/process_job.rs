use std::time::Duration;
use cloud_storage::remote_file_manager::remote_cloud_bucket_details::RemoteCloudBucketDetails;
use mysql_queries::payloads::generic_inference_args::image_generation_payload::StableDiffusionArgs;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::model_weights::get_weight::get_weight_by_token;
use crate::job::job_loop::job_success_result::{ JobSuccessResult, ResultEntity };
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job_dependencies::JobDependencies;
use anyhow::anyhow;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::PolymorphicInferenceArgs;
use cloud_storage::remote_file_manager::remote_cloud_file_manager::RemoteCloudFileClient;
use enums::by_table::generic_inference_jobs::inference_result_type::InferenceResultType::UploadModel;
use crate::job::job_types::image_generation::sd::validate_inputs::validate_inputs;

pub struct StableDiffusionProcessArgs<'a> {
    pub job_dependencies: &'a JobDependencies,
    pub job: &'a AvailableInferenceJob,
}

// run inference
// upload inference result
// upload model checkpoint or loRA

// create record in db
// if stable_diffusion_args.inference_type == "checkpoint" {
//     // run inference with checkpoint and upload
// } else if stable_diffusion_args.inference_type == "lora" {
//     // run inference with the  lora + random checkpoint
// } else if stable_diffusion_args.inference_type == "inference" {
//     // run inference with or without lora
// } else {
//     return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inference type for job!")));
// }
// run inference
// insert record into the db with the inference job token complete.

pub async fn download_from_google_link() {}

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

pub async fn process_job(
    args: StableDiffusionProcessArgs<'_>
) -> Result<JobSuccessResult, ProcessSingleJobError> {
    let job = args.job;
    let deps = args.job_dependencies;

    // let sd_args = sd_args_from_job(&args).await?;

    // let mut job_progress_reporter = args.job_dependencies.clients.job_progress_reporter
    //     .new_generic_inference(job.inference_job_token.as_str())
    //     .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;
    // //==================== TEMP DIR ==================== //
    // let work_temp_dir = format!("temp_stable_diffusion_inference_{}", job.id.0);

    // //NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
    // let work_temp_dir = args.job_dependencies.fs.scoped_temp_dir_creator_for_work
    //     .new_tempdir(&work_temp_dir)
    //     .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

    // let sd_checkpoint_path = work_temp_dir.path().join("sd_checkpoint");
    // let lora_path = work_temp_dir.path().join("lora");

    // // Unpack loRA and Checkpoint
    // // run inference by downloading from google drive.
    // let lora_token = sd_args.maybe_lora_model_token;
    // let weight_token = sd_args.maybe_sd_model_token;

    // let retrieved_sd_record = match weight_token {
    //     Some(token) => {
    //         let retrieved_sd_record = get_weight_by_token(
    //             &token,
    //             false,
    //             &deps.db.mysql_pool
    //         ).await?;
    //         match retrieved_sd_record {
    //             Some(record) => record,
    //             None => {
    //                 return Err(
    //                     ProcessSingleJobError::from_anyhow_error(anyhow!("no record of model!"))
    //                 );
    //             }
    //         }
    //     }
    //     None => {
    //         return Err(
    //             ProcessSingleJobError::from_anyhow_error(anyhow!("no sd model token for job!"))
    //         );
    //     }
    // };

    // // ignore if no lora token
    // let retrieved_loRA_record = match lora_token {
    //     Some(token) => {
    //         let retrieved_loRA_record = get_weight_by_token(
    //             &token,
    //             false,
    //             &deps.db.mysql_pool
    //         ).await?;
    //         Some(retrieved_loRA_record)
    //     }
    //     None => None,
    // };

    // let details = RemoteCloudBucketDetails::new(
    //     retrieved_sd_record.public_bucket_hash.clone(),
    //     retrieved_sd_record.maybe_public_bucket_prefix.clone().unwrap_or_else(|| "".to_string()),
    //     retrieved_sd_record.maybe_public_bucket_extension.clone().unwrap_or_else(|| "".to_string())
    // );

    // let remote_cloud_file_client = RemoteCloudFileClient::get_remote_cloud_file_client().await?;
    // remote_cloud_file_client.download_file(details, sd_checkpoint_path.to_string()).await?;

    // match retrieved_loRA_record {
    //     Some(record) => {
    //         match record {
    //             Some(model_weight_record) => {
    //                 let lora_details = RemoteCloudBucketDetails::new(
    //                     model_weight_record.public_bucket_hash.clone(),
    //                     model_weight_record.maybe_public_bucket_prefix
    //                         .clone()
    //                         .unwrap_or_else(|| "".to_string()),
    //                     model_weight_record.maybe_public_bucket_extension
    //                         .clone()
    //                         .unwrap_or_else(|| "".to_string())
    //                 );
    //                 remote_cloud_file_client.download_file(
    //                     lora_details,
    //                     lora_path.to_str
    //                 ).await?;
    //             }
    //             None => {}
    //         }
    //     }
    //     None => {}
    // }

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
