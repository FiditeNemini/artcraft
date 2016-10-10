// Copyright (c) 2015-2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use config::Config;
use log::LogLevel;
use log::LogLevelFilter;
use log::LogMetadata;
use log::LogRecord;
use log::SetLoggerError;
use log;
use time::now;

/// Simple logger example taken from rust-lang.org docs.
pub struct SimpleLogger {
  config: Config,
}

impl SimpleLogger {
  pub fn new(config: Config) -> SimpleLogger {
    SimpleLogger { config : config }
  }

  /// Install the logger.
  pub fn init(&self) -> Result<(), SetLoggerError> {
    log::set_logger(|max_log_level| {
      max_log_level.set(LogLevelFilter::Info);
      // TODO: This is ridiculous. Figure out trait objects, vtables, etc.
      Box::new(SimpleLogger::new(self.config.clone()))
    })
  }
}

impl log::Log for SimpleLogger {
  fn enabled(&self, metadata: &LogMetadata) -> bool {
    match metadata.target() {
      "handler" => self.config.log_handler.unwrap_or(false),
      "parsing" => self.config.log_parsing.unwrap_or(false),
      "synthesis" => self.config.log_synthesis.unwrap_or(false),
      "timing" => self.config.log_timing.unwrap_or(false),
      _ => metadata.level() <= LogLevel::Info,
    }
  }

  fn log(&self, record: &LogRecord) {
    if self.enabled(record.metadata()) {
      let time = now();
      let timestamp = time.rfc3339();
      println!("[{}] {} - {}", timestamp, record.level(), record.args());
    }
  }
}

