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

  pub fn web_transaction(&self, transaction_name: &str) -> MaybeNewRelicTransaction {
    if let Some(ref newrelic_api) = self.newrelic_api {
      info!("Logging request to NewRelic");
      let maybe_transaction = newrelic_api.web_transaction(transaction_name).ok();
      return MaybeNewRelicTransaction::from_optional(maybe_transaction);
    }
    MaybeNewRelicTransaction::from_optional(None)
  }
}

pub struct MaybeNewRelicTransaction {
  transaction: Option<Transaction>,
}

impl MaybeNewRelicTransaction {
  pub fn from_optional(optional: Option<Transaction>) -> Self {
    Self {
      transaction: optional,
    }
  }

  pub fn add_attribute(&self, name: &str, value: &str) {
    if let Some(ref transaction) = self.transaction {
      info!("Logging attribute to NewRelic");
      let _result = transaction.add_attribute(name, value);
    }
  }
}