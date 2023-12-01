use std::collections::HashMap;

use chrono::NaiveDateTime;

use mysql_queries::queries::stats::get_unified_queue_stats::QueueStatsRow;

#[derive(Serialize, Deserialize, Clone)]
pub struct CacheableQueueStats {
  pub cache_time: NaiveDateTime,
  pub queues: Queues,
}

impl Default for CacheableQueueStats {
  fn default() -> Self {
    Self {
      cache_time: NaiveDateTime::from_timestamp(0, 0),
      queues: Default::default(),
    }
  }
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct Queues {
  pub legacy_tts: u64, // Tacotron2 (as tts_inference_jobs)
  pub total_generic: u64, // Everything except tts_inference_jobs' Tacotron2 summed together
  pub rvc_v2: u64,
  pub sad_talker: u64,
  pub so_vits_svc: u64,
  pub tacotron2: u64, // Tacotron2 (as generic_inference_jobs; NB: included in `total_generic`)
  pub vall_e_x: u64, // Counts both model weight calculation and inference.
}

pub fn database_result_to_cacheable(database_records: Vec<QueueStatsRow>) -> CacheableQueueStats {
  let database_time = database_records.first()
      .map(|record| record.present_time)
      .unwrap_or(NaiveDateTime::from_timestamp(0, 0));

  // Queue lengths
  let mut queue_lengths : HashMap<String, u64> = HashMap::new();

  for record in database_records.into_iter() {
    queue_lengths.insert(record.queue_type, record.pending_job_count);
  }

  let rvc_v2 = unwrap(queue_lengths.get("rvc_v2"));
  let sad_talker = unwrap(queue_lengths.get("sad_talker"));
  let so_vits_svc = unwrap(queue_lengths.get("so_vits_svc"));
  let tacotron2 = unwrap(queue_lengths.get("tacotron2"));
  let vall_e_x = unwrap(queue_lengths.get("vall_e_x"));

  let total_generic = rvc_v2 + so_vits_svc;

  CacheableQueueStats {
    cache_time: database_time,
    queues: Queues {
      legacy_tts: unwrap(queue_lengths.get("legacy_tts")),
      total_generic,
      rvc_v2,
      sad_talker,
      so_vits_svc,
      tacotron2,
      vall_e_x,
    },
  }
}

fn unwrap(inner: Option<&u64>) -> u64 {
  inner.map(|i|*i).unwrap_or(0)
}
