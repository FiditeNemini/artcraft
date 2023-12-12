use anyhow::anyhow;
use log::{error, info};

use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::media_uploads::get_media_upload_for_inference::get_media_upload_for_inference;
use tokens::tokens::media_uploads::MediaUploadToken;

use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::videofilter::rerender_a_video;
use crate::job_dependencies::JobDependencies;

pub async fn process_single_rr_job(job_dependencies: &JobDependencies, job: &AvailableInferenceJob) -> Result<JobSuccessResult, ProcessSingleJobError> {
    let maybe_media_upload_token = job.maybe_input_source_token
        .as_deref()
        .map(|token| MediaUploadToken::new_from_str(token));

    let media_upload_token = match maybe_media_upload_token {
        None => return Err(ProcessSingleJobError::Other(anyhow!("no associated media upload for vc job: {:?}", job.inference_job_token))),
        Some(token) => token,
    };

    let maybe_media_upload_result =
        get_media_upload_for_inference(&media_upload_token, &job_dependencies.db.mysql_pool).await;

    let media_upload = match maybe_media_upload_result {
        Ok(Some(media_upload)) => media_upload,
        Ok(None) => {
            error!("no media upload record found for token: {:?}", media_upload_token);
            return Err(ProcessSingleJobError::Other(anyhow!("no media upload record found for token: {:?}", media_upload_token)));
        },
        Err(err) => {
            error!("error fetching media upload record from db: {:?}", err);
            return Err(ProcessSingleJobError::Other(err));
        },
    };

    info!("Source media upload file size (bytes): {}", &media_upload.original_file_size_bytes);
    info!("Source media upload duration (millis): {}", &media_upload.original_duration_millis);
    info!("Source media upload duration (seconds): {}", (media_upload.original_duration_millis as f32 / 1000.0));



    // let job_success_result = match vc_model.model_type {
    //     VoiceConversionModelType::RvcV2 => {
    //         rvc_v2::process_job::process_job(RvcV2ProcessJobArgs {
    //             job_dependencies,
    //             job,
    //             vc_model: &vc_model,
    //             media_upload_token: &media_upload_token,
    //             media_upload: &media_upload,
    //         }).await?
    //     }
    // };

    let job_success_result = rerender_a_video::process_job::process_job(
        rerender_a_video::process_job::RerenderProcessJobArgs {
            job_dependencies,
            job
        }
    ).await?;

    Ok(job_success_result)
}
