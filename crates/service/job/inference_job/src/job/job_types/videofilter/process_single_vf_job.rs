use anyhow::anyhow;
use log::info;

use mysql_queries::payloads::generic_inference_args::generic_inference_args::PolymorphicInferenceArgs::Rr;
use mysql_queries::payloads::generic_inference_args::videofilter_payload::VideofilterVideoSource;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::media_files::get_media_file::get_media_file;
use tokens::tokens::media_files::MediaFileToken;

use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::videofilter::rerender_a_video;
use crate::job::job_types::videofilter::rerender_a_video::process_job::RerenderProcessJobArgs;
use crate::job_dependencies::JobDependencies;

pub async fn process_single_rr_job(job_dependencies: &JobDependencies, job: &AvailableInferenceJob) -> Result<JobSuccessResult, ProcessSingleJobError> {
    // let maybe_inference_args = job.maybe_inference_args.as_ref().ok_or(ProcessSingleJobError::Other(anyhow!("Inference args not found")))?;
    //
    // let maybe_rerender_args = maybe_inference_args.args.as_ref().map(|args| match args {
    //     Rr(args) => Some(args),
    //     _ => None,
    // }).flatten();
    //
    // let rerender_args = match maybe_rerender_args {
    //     None => return Err(ProcessSingleJobError::Other(anyhow!("Rerender args not found"))),
    //     Some(args) => args,
    // };
    //
    // let videofilter_source = rerender_args.maybe_video_source.as_ref().ok_or(ProcessSingleJobError::Other(anyhow!("Video source not found")))?;
    //
    // let media_file_token = match videofilter_source {
    //     VideofilterVideoSource::F(token) => token,
    //     _ => return Err(ProcessSingleJobError::Other(anyhow!("Video source not found"))),
    // };
    //
    // let media_file_token = MediaFileToken::new_from_str(media_file_token);
    //
    // info!("media_file_token: {:?}", media_file_token);
    //
    //
    // let media_file = match media_file_result {
    //     Ok(Some(result)) => result,
    //     Ok(None) => {
    //         return Err(ProcessSingleJobError::Other(anyhow!("Media file not found")));
    //     }
    //     Err(e) => {
    //         return Err(ProcessSingleJobError::Other(anyhow!("Media file not found")));
    //     }
    // };

    // info!("Source media upload file size (bytes): {}", &media_upload.original_file_size_bytes);
    // info!("Source media upload duration (millis): {}", &media_upload.original_duration_millis);
    // info!("Source media upload duration (seconds): {}", (media_upload.original_duration_millis as f32 / 1000.0));



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
        RerenderProcessJobArgs {
            job_dependencies,
            job,
            // media_file
        }
    ).await?;

    Ok(job_success_result)
}
