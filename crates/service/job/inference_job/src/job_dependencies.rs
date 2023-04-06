use cloud_storage::bucket_client::BucketClient;
use cloud_storage::bucket_path_unifier::BucketPathUnifier;
use crate::job::job_loop::job_stats::JobStats;
use crate::job::job_types::tts::tacotron2_v2_early_fakeyou::tacotron_inference_command::TacotronInferenceCommand;
use crate::util::scoped_temp_dir_creator::ScopedTempDirCreator;
use jobs_common::job_progress_reporter::job_progress_reporter::JobProgressReporterBuilder;
use jobs_common::semi_persistent_cache_dir::SemiPersistentCacheDir;
use memory_caching::multi_item_ttl_cache::MultiItemTtlCache;
use mysql_queries::mediators::firehose_publisher::FirehosePublisher;
use mysql_queries::queries::tts::tts_models::get_tts_model_for_inference::TtsModelForInferenceRecord;
use newrelic_telemetry::Client as NewRelicClient;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use sqlx::MySqlPool;
use std::path::PathBuf;

pub struct JobDependencies {
  pub download_temp_directory: PathBuf,
  pub scoped_temp_dir_creator: ScopedTempDirCreator,

  pub mysql_pool: MySqlPool,

  // TODO(2023-01-11): We don't always connect to a Redis
  //  Typically this is for job status reporting, but we might also report on when users leave the
  //  site to proactively kill their inference jobs and save on worker quota.
  //  On local dev we probably don't care about Redis at all, and on on-prem workers, we cannot
  //  connect to production Redis easily (requires lots of setup - ghosttunnel or something + IP rules)
  pub maybe_redis_pool: Option<r2d2::Pool<RedisConnectionManager>>,

  pub job_progress_reporter: Box<dyn JobProgressReporterBuilder>,

  pub private_bucket_client: BucketClient,
  pub public_bucket_client: BucketClient,

  pub firehose_publisher: FirehosePublisher,

  pub bucket_path_unifier: BucketPathUnifier,
  pub semi_persistent_cache: SemiPersistentCacheDir,

  pub job_stats: JobStats,

  pub tts_inference_command: TacotronInferenceCommand,

  pub newrelic_client: NewRelicClient,

  pub newrelic_disabled: bool,

  pub worker_details: JobWorkerDetails,

  // In-process cache of database lookup records, etc.
  pub caches: JobCaches,

  // Sleep between batches
  pub job_batch_wait_millis: u64,

  // Max job attempts before failure.
  pub job_max_attempts: u16,

  // Number of jobs to dequeue at once.
  pub job_batch_size: u32,

  // How long to wait between log lines
  pub no_op_logger_millis: u64,

  // Maximum number of synthesizer models to hold in memory.
  pub sidecar_max_synthesizer_models: usize,

  // Typically we'll sort jobs by priority. Occasionally we introduce a chance for low
  // priority jobs to run in the order they were enqueued.
  // If this is set to "0", we no longer consider priority
  pub low_priority_starvation_prevention_every_nth: usize,

  // A worker can be configured to only run jobs of a certain priority.
  // This finds jobs of equal or greater priority.
  pub maybe_minimum_priority: Option<u8>,

  // Details for each job type (grouped by the job type)
  pub job_type_details: JobTypeDetails,
}

pub struct JobWorkerDetails {
  // Debug workers only process special debug requests. They're silent otherwise.
  // Non-debug workers ignore debug requests. This is so we can deploy special code
  // to debug nodes (typically just one, perhaps even ephemerally).
  pub is_debug_worker: bool,

  // The worker is "on-premises".
  pub is_on_prem: bool,

  // Hostname, node name, pod name, etc. for the worker.
  // These might have fallback values and aren't guaranteed to be exact.
  pub worker_hostname: String,
  pub k8s_node_name: Option<String>,
  pub k8s_pod_name: Option<String>,
}

pub struct JobCaches {
  pub tts_model_record_cache: MultiItemTtlCache<String, TtsModelForInferenceRecord>,
}

impl JobDependencies {

  /// Get the best name for the worker.
  pub fn get_worker_name(&self) -> String {
    // Default to showing the k8s node (machine) name, if possible, as this benefits
    // debugging on-prem workloads.
    self.worker_details.k8s_node_name.as_deref()
        .or(self.worker_details.k8s_pod_name.as_deref())
        .map(|name| name.to_string())
        .unwrap_or_else(|| self.worker_details.worker_hostname.clone())
  }
}

/// Per-job type details
pub struct JobTypeDetails {
  pub tacotron2_old_vocodes: Tacotron2VocodesDetails,
  pub vits: VitsDetails,
  //pub tacotron2_modern: ...,
  //pub softvc: ...,
  //pub so_vits_svc: ...,
}

/// "Old" TT2 (vocodes-era)
pub struct Tacotron2VocodesDetails {
  pub maybe_docker_image_sha: Option<String>,

  /// Common pretrained waveglow vocoder filename
  pub waveglow_vocoder_model_filename: String,

  /// Common pretrained hifigan vocoder filename
  pub hifigan_vocoder_model_filename: String,

  /// Common pretrained hifigan super resolution vocoder filename
  pub hifigan_superres_vocoder_model_filename: String,
}

pub struct VitsDetails {
  pub maybe_docker_image_sha: Option<String>,
}
