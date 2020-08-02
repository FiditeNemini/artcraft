use actix::{Message, Actor, SyncContext, Handler};
use std::thread;
use std::time::Duration;
use actix_web::client::Client;
use actix_http::http::header;

#[derive(Serialize,Debug)]
struct RecordRequest {
  remote_ip_address: String,
  text: String,
  speaker: String,
}

pub struct BackgroundTask {}

impl Message for BackgroundTask {
  type Result = ();
}

#[derive(Default)]
pub struct StatsRecorderActor;

impl Actor for StatsRecorderActor {
  type Context = SyncContext<Self>;

  fn started(&mut self, _: &mut SyncContext<Self>) {
    info!("Background task actor started up")
  }
}

impl Handler<BackgroundTask> for StatsRecorderActor {
  type Result = ();

  fn handle(&mut self, task: BackgroundTask, context: &mut SyncContext<Self>) {
    info!("Starting background task");

    let client = Client::new();

    let r = RecordRequest {
      remote_ip_address: "1.1.1.1".to_string(),
      speaker: "test_speaker".to_string(),
      text: "some text".to_string(),
    };

    let result = client.post("http://localhost:11111/sentence")
        .no_decompress()
        .header(header::CONTENT_TYPE, "application/json")
        .send_json(&r);


    info!("Finished background task");
  }
}
