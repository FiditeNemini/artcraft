use anyhow::Result as AnyhowResult;
use newrelic::{App, Transaction};

pub struct NewRelicLogger {
  newrelic_api: Option<App>,
}

impl NewRelicLogger {
  pub fn new(app_name: &str, api_key: &str) -> AnyhowResult<Self> {
    let newrelic_api = App::new(app_name, api_key)?;
    Ok(Self {
      newrelic_api: Some(newrelic_api),
    })
  }

  pub fn null_instance() -> Self {
    Self {
      newrelic_api: None,
    }
  }

  pub fn try_new_or_null(app_name: &str, api_key: &str) -> Self {
    match Self::new(app_name, api_key) {
      Ok(instance) => instance,
      Err(_) => Self::null_instance(),
    }
  }

  pub fn web_transaction(&self, transaction_name: &str) -> Option<Transaction> {
    if let Some(ref newrelic_api) = self.newrelic_api {
      info!("Logging request to NewRelic");
      return newrelic_api.web_transaction(transaction_name).ok();
    }
    None
  }
}
