use std::thread;
use std::time::Duration;
use actix_http::http::header;
use actix_web::client::Client;

#[derive(Serialize,Debug)]
struct RecordRequest {
  remote_ip_address: String,
  text: String,
  speaker: String,
}

/// This is a stupid name for a microservice that just records
/// sentences and speakers.
pub struct StatsRecorder {
  endpoint: String,
  enabled: bool,
}

impl StatsRecorder {
  pub fn new(endpoint: &str, enabled: bool) -> Self {
    Self {
      endpoint: endpoint.to_string(),
      enabled,
    }
  }

  pub fn record_stats(&self, speaker: &str, text: &str, ip_address: &str) {
    if !self.enabled {
      info!("StatsRecorder is disabled.");
      return;
    }

    let endpoint = self.endpoint.clone();
    let client = Client::new();

    let request = RecordRequest {
      remote_ip_address: ip_address.to_string(),
      speaker: speaker.to_string(),
      text: text.to_string(),
    };

    actix_rt::spawn(async move {
      let result = client.post(&endpoint)
          .no_decompress()
          .header(header::CONTENT_TYPE, "application/json")
          .send_json(&request);
      result.await;
    });
  }
}
