use errors::AnyhowResult;
use log::info;
use std::thread;
use std::time::Duration;

pub async fn main_loop() -> AnyhowResult<()> {
  loop {
    info!("iter");
    thread::sleep(Duration::from_millis(5000));
  }

  Ok(())
}