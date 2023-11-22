use log::info;

use enums::by_table::generic_inference_jobs::inference_model_type::InferenceModelType;
use errors::AnyhowResult;

use crate::job::job_types::lipsync::sad_talker::sad_talker_dependencies::SadTalkerDependencies;
use crate::job::job_types::vc::rvc_v2::rvc_v2_dependencies::RvcV2Dependencies;
use crate::job::job_types::vc::so_vits_svc::svc_dependencies::SvcDependencies;
use crate::util::scoped_execution::ScopedExecution;

pub struct JobSpecificDependencies {
  pub maybe_rvc_v2_dependencies: Option<RvcV2Dependencies>,
  pub maybe_sad_talker_dependencies: Option<SadTalkerDependencies>,
  pub maybe_svc_dependencies: Option<SvcDependencies>,
}

impl JobSpecificDependencies {

  pub fn setup_for_jobs(scoped_execution: &ScopedExecution) -> AnyhowResult<Self> {
    let mut maybe_rvc_v2_dependencies = None;
    let mut maybe_sad_talker_dependencies = None;
    let mut maybe_svc_dependencies = None;

    if scoped_execution.can_run_job(InferenceModelType::RvcV2) {
      info!("Setting RVCv2 dependencies...");
      maybe_rvc_v2_dependencies = Some(RvcV2Dependencies::setup()?);
    }

    if scoped_execution.can_run_job(InferenceModelType::SadTalker) {
      info!("Setting SadTalker dependencies...");
      maybe_sad_talker_dependencies = Some(SadTalkerDependencies::setup()?);
    }

    if scoped_execution.can_run_job(InferenceModelType::SoVitsSvc) {
      info!("Setting SVC dependencies...");
      maybe_svc_dependencies = Some(SvcDependencies::setup()?);
    }

    Ok(JobSpecificDependencies {
      maybe_rvc_v2_dependencies,
      maybe_sad_talker_dependencies,
      maybe_svc_dependencies
    })
  }
}
