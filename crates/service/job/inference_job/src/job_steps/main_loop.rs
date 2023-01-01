use container_common::anyhow_result::AnyhowResult;
use container_common::collections::multiple_random_from_vec::multiple_random_from_vec;
use crate::caching::cache_miss_strategizer::CacheMissStrategy;
use crate::caching::virtual_lfu_cache::SyncVirtualLfuCache;
use crate::job_steps::job_dependencies::JobDependencies;
use crate::job_steps::job_stats::JobStats;
use crate::job_steps::process_single_job::process_single_job;
use crate::job_steps::process_single_job_error::ProcessSingleJobError;
use crate::job_steps::sidecar_health_check_trap::maybe_block_on_sidecar_health_check;
use database_queries::queries::tts::tts_inference_jobs::list_available_tts_inference_jobs::{AvailableTtsInferenceJob, list_available_tts_inference_jobs, list_available_tts_inference_jobs_with_minimum_priority};
use database_queries::queries::tts::tts_inference_jobs::mark_tts_inference_job_failure::mark_tts_inference_job_failure;
use database_queries::queries::tts::tts_inference_jobs::mark_tts_inference_job_permanently_dead::mark_tts_inference_job_permanently_dead;
use database_queries::queries::tts::tts_models::get_tts_model_for_inference::{get_tts_model_for_inference, TtsModelForInferenceError, TtsModelForInferenceRecord};
use jobs_common::noop_logger::NoOpLogger;
use jobs_common::semi_persistent_cache_dir::SemiPersistentCacheDir;
use log::{error, info, warn};
use memory_caching::multi_item_ttl_cache::MultiItemTtlCache;
use newrelic_telemetry::Span;
use sqlx::MySqlPool;
use std::time::Duration;

// Job runner timeouts (guards MySQL)
const START_TIMEOUT_MILLIS : u64 = 500;
const INCREASE_TIMEOUT_MILLIS : u64 = 1000;

pub async fn main_loop(job_args: JobDependencies) {
  let mut error_timeout_millis = START_TIMEOUT_MILLIS;

  let mut noop_logger = NoOpLogger::new(job_args.no_op_logger_millis as i64);

  let mut span_batch = Vec::new();

  let mut sort_by_priority = true;
  let mut sort_by_priority_count = 0;

  let mut needs_health_check_at_start = true; // Run health check at startup.

  loop {
    let num_records = job_args.job_batch_size;

    // Don't completely starve low-priority jobs
    if sort_by_priority_count >= job_args.low_priority_starvation_prevention_every_nth {
      sort_by_priority_count = 0;
      sort_by_priority = false;
    }

    let maybe_available_jobs =
        if let Some(minimum_priority) = job_args.maybe_minimum_priority {
          // Special high-priority workers
          list_available_tts_inference_jobs_with_minimum_priority(
            &job_args.mysql_pool,
            minimum_priority,
            num_records,
            job_args.worker_details.is_debug_worker
          ).await
        } else {
          // Normal path
          list_available_tts_inference_jobs(
            &job_args.mysql_pool,
            sort_by_priority,
            num_records,
            job_args.worker_details.is_debug_worker
          ).await
        };

    sort_by_priority = true;
    sort_by_priority_count += 1;

    let jobs = match maybe_available_jobs {
      Ok(jobs) => jobs,
      Err(e) => {
        warn!("Error querying jobs: {:?}", e);
        std::thread::sleep(Duration::from_millis(error_timeout_millis));
        error_timeout_millis += INCREASE_TIMEOUT_MILLIS;
        continue;
      }
    };

    if jobs.is_empty() {
      noop_logger.log_message_after_awhile("No TTS jobs picked up from database!");

      std::thread::sleep(Duration::from_millis(job_args.job_batch_wait_millis));
      continue;
    }

    info!("Queried {} jobs from database", jobs.len());

    let batch_result = process_jobs(
      &job_args,
      jobs,
      needs_health_check_at_start,
    ).await;

    if needs_health_check_at_start {
      needs_health_check_at_start = false;
    }

    let mut spans = match batch_result {
      Ok(spans) => spans,
      Err(e) => {
        warn!("Error running job batch: {:?}", e);
        std::thread::sleep(Duration::from_millis(error_timeout_millis));
        error_timeout_millis += INCREASE_TIMEOUT_MILLIS;
        continue;
      }
    };

    if !job_args.newrelic_disabled {
      span_batch.append(&mut spans);

      if span_batch.len() > 50 {
        let spans_to_send = span_batch.split_off(0).into();
        job_args.newrelic_client.send_spans(spans_to_send).await;
      }
    }

    error_timeout_millis = START_TIMEOUT_MILLIS; // reset

    std::thread::sleep(Duration::from_millis(job_args.job_batch_wait_millis));
  }
}

/// Process a batch of jobs, returning the count of cold-cache skipped jobs.
async fn process_jobs(
  inferencer: &JobDependencies,
  jobs: Vec<AvailableTtsInferenceJob>,
  needs_health_check_at_start: bool,
) -> AnyhowResult<Vec<Span>> {

  if needs_health_check_at_start {
    maybe_block_on_sidecar_health_check(&inferencer.http_clients.tts_sidecar_health_check_client).await;
  }

  let mut maybe_sidecar_health_issue = false;

  let mut batch_spans = Vec::new();

  for job in jobs.into_iter() {
    let model_state_result = ModelState::query_model_and_check_filesystem(
      &job,
      &inferencer.mysql_pool,
      &inferencer.caches.tts_model_record_cache,
      &inferencer.semi_persistent_cache,
      &inferencer.virtual_model_lfu,
    ).await;

    let model_state = match model_state_result {
      Ok(model_state) => model_state,
      Err(e) => {
        error!("TTS model fetch and state check error: {}, reason: {:?}", &job.model_token, &e);

        let (failure_reason, permanent_failure) = match e {
          ModelStateError::ModelNotFound => ("model was not found", true),
          ModelStateError::ModelDeleted => ("model has been deleted", true),
          ModelStateError::CacheError { .. } => ("internal cache error", false),
          ModelStateError::DatabaseError { .. } => ("unknown database error", false),
        };

        let internal_debugging_failure_reason = format!("model error: {:?}", e);

        let mut job_progress_reporter = inferencer
            .job_progress_reporter
            .new_tts_inference(&job.inference_job_token)?;

        job_progress_reporter.log_status(failure_reason)?;

        if permanent_failure {
          warn!("Marking job permanently dead: {} because: {:?}", job.inference_job_token, &e);

          let _r = mark_tts_inference_job_permanently_dead(
            &inferencer.mysql_pool,
            job.id,
            failure_reason,
            &internal_debugging_failure_reason,
            &inferencer.get_worker_name(),
          ).await;
        } else {
          let _r = mark_tts_inference_job_failure(
            &inferencer.mysql_pool,
            &job,
            failure_reason,
            &internal_debugging_failure_reason,
            inferencer.job_max_attempts,
            &inferencer.get_worker_name(),
          ).await;
        }

        continue;
      }
    };

    if !model_state.is_downloaded_to_filesystem || !model_state.is_in_memory_cache {
      warn!("Model isn't ready: {} (downloaded = {}), (in memory = {})",
        &model_state.model_record.model_token,
        model_state.is_downloaded_to_filesystem,
        model_state.is_in_memory_cache);

      let maybe_strategy = if !model_state.is_downloaded_to_filesystem {
        inferencer.cache_miss_strategizers.disk_cache_miss(&model_state.model_record.model_token)
      } else {
        inferencer.cache_miss_strategizers.memory_cache_miss(&model_state.model_record.model_token)
      };

      match maybe_strategy {
        Err(err) => {
          warn!("Unable to process job: {:?}", err);

          let failure_reason = "cache error";
          let internal_debugging_failure_reason = format!("cache error: {:?}", err);

          let _r = mark_tts_inference_job_failure(
            &inferencer.mysql_pool,
            &job,
            failure_reason,
            &internal_debugging_failure_reason,
            inferencer.job_max_attempts,
            &inferencer.get_worker_name(),
          ).await;
          continue;
        },
        Ok(CacheMissStrategy::WaitOrSkip) => {
          // We're going to skip this for now.
          // Maybe another worker has a warm cache and can continue.
          warn!("Skipping TTS due to cold cache: {} ({})",
            model_state.model_record.model_token,
            model_state.model_record.title);
          continue;
        },
        Ok(CacheMissStrategy::Proceed) => {}, // We're going to go ahead...
      }
    }

    if maybe_sidecar_health_issue {
      // Since we'll have a signal of the sidecar's health potentially being an issue, we don't
      // need to background health check it from another thread. Instead we can react to the
      // "potentially down" signal and block until it alleviates.
      maybe_block_on_sidecar_health_check(&inferencer.http_clients.tts_sidecar_health_check_client).await;
      maybe_sidecar_health_issue = false;
    }

    let result = process_single_job(inferencer, &job, &model_state.model_record).await;
    match result {
      Ok((span1, span2)) => {
        batch_spans.push(span1);
        batch_spans.push(span2);
      },
      Err(e) => {
        warn!("Failure to process job: {:?}", e);

        record_failure_and_maybe_slow_down(&inferencer.job_stats);

        maybe_sidecar_health_issue = true;

        let failure_reason = "failure processing job";
        let internal_debugging_failure_reason = format!("job error: {:?}", e);

        let _r = mark_tts_inference_job_failure(
          &inferencer.mysql_pool,
          &job,
          failure_reason,
          &internal_debugging_failure_reason,
          inferencer.job_max_attempts,
          &inferencer.get_worker_name(),
        ).await;

        match e {
          ProcessSingleJobError::Other(_) => {} // No-op
          ProcessSingleJobError::FilesystemFull => {
            // TODO: Refactor - we should stop processing all of these jobs as we'll lose out
            //  on this entire batch by attempting to clear the filesystem. This should be handled
            //  in the calling code.
            delete_tts_synthesizers_from_cache(&inferencer.semi_persistent_cache)?;
          }
        }
      }
    }
  }

  Ok(batch_spans)
}

fn record_failure_and_maybe_slow_down(job_stats: &JobStats) {
  let stats = match job_stats.increment_failure_count() {
    Ok(stats) => stats,
    Err(e) => {
      warn!("Error recording stats and reacting to repeated failures: {:?}", e);
      return; // Can't really do anything.
    }
  };

  let seconds_timeout = match stats.consecutive_failure_count {
    t if t > 100 => 180,
    t if t > 50 => 60,
    t if t > 20 => 30,
    t if t > 10 => 10,
    t if t > 5 => 5,
    _ => return, // No timeout
  };

  info!("Slowing down {} seconds due to significant repeated failures: {:?}",
    seconds_timeout,
    stats);

  std::thread::sleep(Duration::from_secs(seconds_timeout));
}

/// Hack to delete locally cached TTS synthesizers to free up space from a full filesystem.
/// This is not intelligent and doesn't use any LRU/LFU mechanic.
/// This also relies on files not being read or written by concurrent workers while deleting.
fn delete_tts_synthesizers_from_cache(cache_dir: &SemiPersistentCacheDir) -> AnyhowResult<()> {
  warn!("Deleting cached TTS synthesizers to free up disk space.");

  let tts_synthesizer_dir = cache_dir.tts_synthesizer_model_directory();

  // TODO: When this is no longer sufficient, delete other types of locally-cached data.
  let paths = std::fs::read_dir(tts_synthesizer_dir)?
      .map(|res| res.map(|e| e.path()))
      .collect::<Result<Vec<_>, std::io::Error>>()?;

  let models_to_delete = multiple_random_from_vec(&paths, 35);

  for model_to_delete in models_to_delete {
    warn!("Deleting cached model file: {:?}", model_to_delete);

    let full_model_path = cache_dir.tts_synthesizer_model_path(model_to_delete);
    std::fs::remove_file(full_model_path)?;
  }

  Ok(())
}

/// We check both of these in one go so that we can reuse the ModelRecord later
/// without another DB query.
struct ModelState {
  pub model_record: TtsModelForInferenceRecord,
  pub is_downloaded_to_filesystem: bool,
  pub is_in_memory_cache: bool,
}

#[derive(Debug, Clone)]
enum ModelStateError {
  ModelNotFound,
  ModelDeleted,
  CacheError { reason: String },
  DatabaseError { reason: String },
}

impl std::fmt::Display for ModelStateError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      ModelStateError::ModelNotFound => write!(f, "ModelNotFound"),
      ModelStateError::ModelDeleted => write!(f, "ModelDeleted"),
      ModelStateError::CacheError { reason} => write!(f, "Cache error: {:?}", reason),
      ModelStateError::DatabaseError { reason} => write!(f, "Database error: {:?}", reason),
    }
  }
}

impl From<TtsModelForInferenceError> for ModelStateError {
  fn from(error: TtsModelForInferenceError) -> Self {
    match error {
      TtsModelForInferenceError::ModelNotFound => ModelStateError::ModelNotFound,
      TtsModelForInferenceError::ModelDeleted => ModelStateError::ModelDeleted,
      TtsModelForInferenceError::DatabaseError { reason } => ModelStateError::DatabaseError { reason }
    }
  }
}

impl std::error::Error for ModelStateError {}

impl ModelState {
  /// Query the model details and see if the model file is on the filesystem in one go.
  pub async fn query_model_and_check_filesystem(
    job: &AvailableTtsInferenceJob,
    mysql_pool: &MySqlPool,
    tts_model_record_cache: &MultiItemTtlCache<String, TtsModelForInferenceRecord>,
    semi_persistent_cache: &SemiPersistentCacheDir,
    virtual_cache: &SyncVirtualLfuCache,
  ) -> Result<Self, ModelStateError> {
    // Many workers will be querying models constantly (n-many per batch).
    // We can save on a lot of DB query volume by caching model records.
    let maybe_cached_tts_model =
        tts_model_record_cache.copy_without_bump_if_unexpired(job.model_token.clone())
            .ok()
            .flatten();

    let tts_model = match maybe_cached_tts_model {
      Some(tts_model) => tts_model,
      None => {
        info!("Looking up TTS model record by token: {}", &job.model_token);

        let tts_model = get_tts_model_for_inference(
          &mysql_pool,
          &job.model_token
        ).await?;

        tts_model_record_cache.store_copy(&job.model_token, &tts_model).ok();

        tts_model
      }
    };

    let tts_synthesizer_fs_path = semi_persistent_cache.tts_synthesizer_model_path(
      &tts_model.model_token);

    let is_downloaded_to_filesystem = tts_synthesizer_fs_path.exists();

    let path = tts_synthesizer_fs_path
        .to_str()
        .ok_or(ModelStateError::CacheError { reason: "could not make path".to_string() })?
        .to_string();

    let is_in_memory_cache = virtual_cache.in_cache(&path)
        .map_err(|e| ModelStateError::CacheError { reason: format!("Model cache error: {:?}", e) })?;

    Ok(Self {
      model_record: tts_model,
      is_downloaded_to_filesystem,
      is_in_memory_cache,
    })
  }
}
