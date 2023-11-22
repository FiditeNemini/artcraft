#![forbid(unreachable_patterns)]
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use std::path::PathBuf;

use r2d2_redis::r2d2;
use r2d2_redis::RedisConnectionManager;
use sqlx::MySqlPool;

use bootstrap::bootstrap::ContainerEnvironment;
use cloud_storage::bucket_client::BucketClient;
use cloud_storage::bucket_path_unifier::BucketPathUnifier;
use concurrency::relaxed_atomic_bool::RelaxedAtomicBool;
use jobs_common::job_progress_reporter::job_progress_reporter::JobProgressReporterBuilder;
use jobs_common::job_stats::JobStats;
use jobs_common::semi_persistent_cache_dir::SemiPersistentCacheDir;
use memory_caching::multi_item_ttl_cache::MultiItemTtlCache;
use memory_caching::ttl_key_counter::TtlKeyCounter;
use mysql_queries::common_inputs::container_environment_arg::ContainerEnvironmentArg;
use mysql_queries::mediators::firehose_publisher::FirehosePublisher;
use mysql_queries::queries::tts::tts_models::get_tts_model_for_inference_improved::TtsModelForInferenceRecord;
use mysql_queries::queries::voice_conversion::inference::get_voice_conversion_model_for_inference::VoiceConversionModelForInference;
use newrelic_telemetry::Client as NewRelicClient;

use crate::job::job_types::tts::vall_e_x::model_downloaders::VallEXDownloaders;
use crate::job::job_types::tts::vall_e_x::vall_e_x_inference_command::VallEXCreateEmbeddingCommand;
use crate::job::job_types::tts::vall_e_x::vall_e_x_inference_command::VallEXInferenceCommand;
use crate::job::job_types::tts::vits::vits_inference_command::VitsInferenceCommand;
use crate::job_specific_dependencies::JobSpecificDependencies;
use crate::util::scoped_execution::ScopedExecution;
use crate::util::scoped_temp_dir_creator::ScopedTempDirCreator;

pub struct JobDependencies {
  /// The job should only run on these types of models.
  /// This is provided at job start.
  pub scoped_execution: ScopedExecution,

  /// Specific dependencies for the various job types.
  /// They're only loaded if that type of job is configured to run.
  /// (See "scoped execution")
  pub job_specific_dependencies: JobSpecificDependencies,

  /// Filesystem info and utils
  pub fs: FileSystemDetails,

  pub mysql_pool: MySqlPool,

  // TODO(2023-01-11): We don't always connect to a Redis
  //  Typically this is for job status reporting, but we might also report on when users leave the
  //  site to proactively kill their inference jobs and save on worker quota.
  //  On local dev we probably don't care about Redis at all, and on on-prem workers, we cannot
  //  connect to production Redis easily (requires lots of setup - ghosttunnel or something + IP rules)
  pub maybe_redis_pool: Option<r2d2::Pool<RedisConnectionManager>>,

  pub maybe_keepalive_redis_pool: Option<r2d2::Pool<RedisConnectionManager>>,

  pub job_progress_reporter: Box<dyn JobProgressReporterBuilder>,

  pub private_bucket_client: BucketClient,
  pub public_bucket_client: BucketClient,

  pub firehose_publisher: FirehosePublisher,

  pub bucket_path_unifier: BucketPathUnifier,

  pub job_stats: JobStats,

  pub newrelic_client: NewRelicClient,

  pub newrelic_disabled: bool,

  pub worker_details: JobWorkerDetails,

  // In-process cache of database lookup records, etc.
  pub caches: JobCaches,

  // How many times to skip jobs (on cold filesystem cache) before proceeding with execution.
  pub cold_filesystem_cache_starvation_threshold: u64,

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

  pub container: ContainerEnvironment,
  pub container_db: ContainerEnvironmentArg, // Same info, but for database.

  // The application can be shut down from another thread.
  // Checking this will determine if the application needs to exit (true = exit).
  pub application_shutdown: RelaxedAtomicBool,
}

pub struct FileSystemDetails {
  /// Temporary directory for storing downloads
  /// (In prod, typically model files from GCS / NFS PVC mount)
  pub temp_directory_downloads: PathBuf,

  /// Temporary directory for storing work
  /// (In prod, typically python inference outputs / emptyDir mount)
  pub temp_directory_work: PathBuf,

  /// If the pause file is set and exists on the filesystem,
  /// the job will pause until the file stops existing.
  /// Good for live debugging of production k8s clusters without
  /// redeploying.
  pub maybe_pause_file: Option<PathBuf>,

  // TODO: Rename
  /// Creates temp directories for scratch files
  pub scoped_temp_dir_creator_for_downloads: ScopedTempDirCreator,
  pub scoped_temp_dir_creator_for_work: ScopedTempDirCreator,

  // TODO: Rename
  /// Organizes downloaded files
  pub semi_persistent_cache: SemiPersistentCacheDir,
}

pub struct JobWorkerDetails {
  // Debug workers only process special debug requests. They're silent otherwise.
  // Non-debug workers ignore debug requests. This is so we can deploy special code
  // to debug nodes (typically just one, perhaps even ephemerally).
  pub is_debug_worker: bool,
}

pub struct JobCaches {
  pub tts_model_record_cache: MultiItemTtlCache<String, TtsModelForInferenceRecord>,
  pub vc_model_record_cache: MultiItemTtlCache<String, VoiceConversionModelForInference>,

  /// Skip processing models if they're not on the filesystem.
  /// If the counter elapses a delta, proceed with calculation.
  pub model_cache_counter: TtlKeyCounter,
}

/// Per-job type details
pub struct JobTypeDetails {
  pub vits: VitsDetails,
  pub vall_e_x:  VallEXDetails
}

pub struct VitsDetails {
  pub inference_command: VitsInferenceCommand,
}

// TODO: we will probably want a command type of some kind that implements
// some kind of interface that we can just pass strings to.
pub struct VallEXDetails {
  pub downloaders: VallEXDownloaders,
  pub inference_command: VallEXInferenceCommand,
  pub create_embedding_command: VallEXCreateEmbeddingCommand
}
