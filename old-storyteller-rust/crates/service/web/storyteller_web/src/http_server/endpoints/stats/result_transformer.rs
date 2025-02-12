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
  // Text to Speech
  pub legacy_tts: u64, // Tacotron2 (as tts_inference_jobs)
  pub total_generic: u64, // Everything except tts_inference_jobs' Tacotron2 summed together
  pub tacotron2: u64, // Tacotron2 (as generic_inference_jobs; NB: included in `total_generic`)
  pub vall_e_x: u64, // Counts both model weight calculation and inference.

  // Voice Conversion
  pub rvc_v2: u64,
  pub so_vits_svc: u64,

  // Image
  pub stable_diffusion: u64,

  // Video
  pub sad_talker: u64,
  pub storyteller_studio: u64,
  pub acting_face: u64,
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

  CacheableQueueStats {
    cache_time: database_time,
    queues: Queues {
      // Statistic rollup.
      total_generic: queue_lengths.iter()
          .filter(|(queue, _count)| !(*queue).eq("legacy_tts"))
          .map(|(_queue, count)| count)
          .sum(),
      // TTS
      legacy_tts: unwrap(queue_lengths.get("legacy_tts")),
      tacotron2: unwrap(queue_lengths.get("tacotron2")),
      vall_e_x: unwrap(queue_lengths.get("vall_e_x")),
      // VC
      rvc_v2: unwrap(queue_lengths.get("rvc_v2")),
      so_vits_svc: unwrap(queue_lengths.get("so_vits_svc")),
      // Image
      stable_diffusion: unwrap(queue_lengths.get("stable_diffusion")),
      // Video
      sad_talker: unwrap(queue_lengths.get("sad_talker")),
      storyteller_studio: unwrap(queue_lengths.get("video_render")),
      acting_face: unwrap(queue_lengths.get("live_portrait")),
    },
  }
}

fn unwrap(inner: Option<&u64>) -> u64 {
  inner.map(|i|*i).unwrap_or(0)
}
