use database_queries::queries::generic_inference::job::list_available_generic_inference_jobs::{list_available_generic_inference_jobs, ListAvailableGenericInferenceJobArgs};
use enums::workers::generic_inference_type::GenericInferenceType;
use sqlx::MySqlPool;
use std::collections::BTreeSet;

pub struct SelectJobBatchArgs <'a> {
  pub num_records: u32,
  pub is_debug_worker: bool,
  pub sort_by_priority: bool,
  pub maybe_scope_by_job_type: Option<BTreeSet<GenericInferenceType>>,
  pub mysql_pool: &'a MySqlPool,
}

pub async fn select_job_batch(args: SelectJobBatchArgs<'_>) {
  let _results = list_available_generic_inference_jobs(ListAvailableGenericInferenceJobArgs {
    num_records: args.num_records,
    is_debug_worker: args.is_debug_worker,
    sort_by_priority: args.sort_by_priority,
    maybe_scope_by_job_type: args.maybe_scope_by_job_type,
    mysql_pool: args.mysql_pool,
  }).await;

}
