use jobs_common::job_stats::JobStats;

#[derive(Clone)]
pub struct HttpServerSharedState {
  pub job_stats: JobStats,
}
