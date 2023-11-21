use log::info;
use enums::by_table::generic_inference_jobs::inference_model_type::InferenceModelType;
use errors::AnyhowResult;
use crate::job::job_types::vc::rvc_v2::rvc_v2_dependencies::RvcV2Dependencies;
use crate::util::scoped_execution::ScopedExecution;

pub struct JobSpecificDependencies {
  pub maybe_rvc_v2_dependencies: Option<RvcV2Dependencies>,
}

impl JobSpecificDependencies {

  pub fn setup_for_jobs(scoped_execution: &ScopedExecution) -> AnyhowResult<Self> {
    let mut maybe_rvc_v2_dependencies = None;

    if scoped_execution.can_run_job(InferenceModelType::RvcV2) {
      info!("Setting RVCv2 dependencies...");
      maybe_rvc_v2_dependencies = Some(RvcV2Dependencies::setup()?);
    }

    Ok(JobSpecificDependencies {
      maybe_rvc_v2_dependencies,
    })
  }
}
