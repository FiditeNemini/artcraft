use std::future::Future;
use std::time::{Instant, Duration};

pub struct MultiBenchmarkingTimer {
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
      recorded_sections: Vec::new(),
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
