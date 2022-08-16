use std::future::Future;
use log::warn;
use std::time::{Instant, Duration};
use once_cell::sync::Lazy;
use regex::Regex;

static SPACES_REGEX : Lazy<Regex> = Lazy::new(|| {
  Regex::new(r"\s+").unwrap()
});

static INVALID_HEADER_CHARACTER_REGEX : Lazy<Regex> = Lazy::new(|| {
  Regex::new(r"[^A-Za-z0-9\-]+").unwrap()
});

// TODO: Auto inject one of these with each HTTP request and begin with dispatch and end
//  with final result delivery.

/// A simple utility meant to time various segments of an HTTP endpoint so that
/// the timing data can be aggregated and returned.
pub struct MultiBenchmarkingTimer {
  start_timer: Option<Instant>,
  recorded_sections: Vec<SectionTime>,
}

#[derive(Clone, Serialize)]
pub struct SectionTime {
  pub section_name: String,
  pub duration: Duration,
}

impl MultiBenchmarkingTimer {

  pub fn new() -> Self {
    Self {
      start_timer: None,
      recorded_sections: Vec::new(),
    }
  }

  pub fn new_started() -> Self {
    let mut benchmark = Self::new();
    benchmark.mark_begin();
    benchmark
  }

  pub fn iter_section_timings(&self) -> std::slice::Iter<'_, SectionTime> {
    self.recorded_sections.iter()
  }

  pub fn section_timings_as_headers(&self) -> Vec<(String, String)> {
    self.recorded_sections.iter()
        .map(|section| {
          let header_name = format!("x-timing-{}", section.section_name
              .trim()
              .to_lowercase());
          let header_name = SPACES_REGEX.replace_all(&header_name, "-").to_string();
          let header_name = INVALID_HEADER_CHARACTER_REGEX.replace_all(&header_name, "").to_string();
          (header_name, format!("{:?}", &section.duration))
        })
        .collect()
  }

  pub fn mark_begin(&mut self) {
    if self.start_timer.is_some() {
      warn!("Start timer has already been set.");
      return;
    }
    self.start_timer = Some(Instant::now());
  }

  pub fn mark_end(&mut self) {
    match self.start_timer {
      None => {
        warn!("Start timer was never started.");
        return;
      }
      Some(start_time) => {
        let end = Instant::now();

        self.recorded_sections.push(SectionTime {
          section_name: "total duration".to_string(),
          duration: end.duration_since(start_time),
        });
      }
    }
  }

  pub async fn time_async_section<F, Fut, T>(
    &mut self,
    section_name: &str,
    callback: F
  ) -> T
    where F: Fn() -> Fut,
          Fut: Future<Output = T>,
  {
    let before = Instant::now();
    let result = callback().await;
    let after = Instant::now();

    self.recorded_sections.push(SectionTime {
      section_name: section_name.to_string(),
      duration: after.duration_since(before),
    });

    result
  }
}
