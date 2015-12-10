// Copyright (c) 2015 Brandon Thomas <bt@brand.io>

use log::LogLevel;
use log::LogLevelFilter;
use log::LogMetadata;
use log::LogRecord;
use log::SetLoggerError;
use log;
use time::now;

/// Simple logger example taken from rust-lang.org docs.
pub struct SimpleLogger;

impl SimpleLogger {
  /// Install the logger.
  pub fn init() -> Result<(), SetLoggerError> {
    log::set_logger(|max_log_level| {
      max_log_level.set(LogLevelFilter::Info);
      Box::new(SimpleLogger)
    })
  }
}

impl log::Log for SimpleLogger {
  fn enabled(&self, metadata: &LogMetadata) -> bool {
    metadata.level() <= LogLevel::Info
  }

  fn log(&self, record: &LogRecord) {
    if self.enabled(record.metadata()) {
      let time = now();
      let timestamp = time.rfc3339();
      println!("[{}] {} - {}", timestamp, record.level(), record.args());
    }
  }
}

