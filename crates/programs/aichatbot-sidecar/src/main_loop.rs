use errors::AnyhowResult;
use log::info;
use std::thread;
use std::time::Duration;

pub async fn main_loop() -> AnyhowResult<()> {
  loop {
    info!("threaded job iteration");
    thread::sleep(Duration::from_millis(60_000));
  }
}
