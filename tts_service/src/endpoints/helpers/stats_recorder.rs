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

pub fn record_stats(speaker: &str, text: &str, ip_address: &str) {
  let client = Client::new();

  let r = RecordRequest {
    remote_ip_address: "1.1.1.1".to_string(),
    speaker: speaker.to_string(),
    text: text.to_string(),
  };

  actix_rt::spawn(async move {
    thread::sleep(Duration::from_millis(10_000));
    info!("Alerting endpoint");
    let result = client.post("http://localhost:11111/sentence")
        .no_decompress()
        .header(header::CONTENT_TYPE, "application/json")
        .send_json(&r);
    result.await;
  });
}
