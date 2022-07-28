use crate::caching::cache_miss_strategizer_multi::SyncMultiCacheMissStrategizer;
use crate::caching::virtual_lfu_cache::SyncVirtualLfuCache;
use crate::http_clients::tts_inference_sidecar_client::TtsInferenceSidecarClient;
use crate::script_execution::tacotron_inference_command::TacotronInferenceCommand;
use database_queries::mediators::firehose_publisher::FirehosePublisher;
use jobs_common::semi_persistent_cache_dir::SemiPersistentCacheDir;
use newrelic_telemetry::Client as NewRelicClient;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use sqlx::MySqlPool;
use std::path::PathBuf;
use database_queries::queries::tts::tts_models::get_tts_model_for_inference::TtsModelForInferenceRecord;
use memory_caching::multi_item_ttl_cache::MultiItemTtlCache;
use storage_buckets_common::bucket_client::BucketClient;
use storage_buckets_common::bucket_path_unifier::BucketPathUnifier;
use crate::http_clients::tts_sidecar_health_check_client::TtsSidecarHealthCheckClient;
use crate::util::scoped_temp_dir_creator::ScopedTempDirCreator;

pub struct JobArgs {
  pub download_temp_directory: PathBuf,
  pub scoped_temp_dir_creator: ScopedTempDirCreator,

  pub mysql_pool: MySqlPool,

  pub redis_pool: r2d2::Pool<RedisConnectionManager>,

  pub private_bucket_client: BucketClient,
  pub public_bucket_client: BucketClient,

  pub firehose_publisher: FirehosePublisher,

  pub bucket_path_unifier: BucketPathUnifier,
  pub semi_persistent_cache: SemiPersistentCacheDir,

  pub http_clients: JobHttpClients,

  pub tts_inference_command: TacotronInferenceCommand,

  pub newrelic_client: NewRelicClient,

  pub newrelic_disabled: bool,

  pub worker_details: JobWorkerDetails,

  // Keep tabs of which models to hold in the sidecar memory with this virtual LRU cache
  pub virtual_model_lfu: SyncVirtualLfuCache,
  pub cache_miss_strategizers: SyncMultiCacheMissStrategizer,

  // In-process cache of database lookup records, etc.
  pub caches: JobCaches,

  // Waveglow vocoder filename
  pub waveglow_vocoder_model_filename: String,

  // Hifigan vocoder filename
  pub hifigan_vocoder_model_filename: String,

  // Hifigan super resolution vocoder filename
  pub hifigan_superres_vocoder_model_filename: String,

  // Sleep between batches
  pub job_batch_wait_millis: u64,

  // Max job attempts before failure.
  // NB: This is an i32 so we don't need to convert to db column type.
  pub job_max_attempts: i32,

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
}

pub struct JobWorkerDetails {
  // Debug workers only process special debug requests. They're silent otherwise.
  // Non-debug workers ignore debug requests. This is so we can deploy special code
  // to debug nodes (typically just one, perhaps even ephemerally).
  pub is_debug_worker: bool,

  // The worker is "on-premises".
  pub is_on_prem: bool,

  // Hostname of the worker.
  pub worker_hostname: String,
}

pub struct JobCaches {
  pub tts_model_record_cache: MultiItemTtlCache<String, TtsModelForInferenceRecord>,
}

pub struct JobHttpClients {
  pub tts_inference_sidecar_client: TtsInferenceSidecarClient,
  pub tts_sidecar_health_check_client: TtsSidecarHealthCheckClient,
}