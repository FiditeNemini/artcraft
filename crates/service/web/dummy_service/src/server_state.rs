use crate::env_args::EnvArgs;

#[derive(Clone)]
pub struct ServerState {
  pub flags: StaticFeatureFlags,
}

#[derive(Clone)]
pub struct StaticFeatureFlags {
  /// If we're suffering an outage, set the alert category to display a predefined message to users.
  pub maybe_status_alert_category: Option<String>,

  /// If we're suffering an outage, set custom text for the alert message.
  pub maybe_status_alert_custom_message: Option<String>,
}

impl ServerState {
  pub fn build(args: &EnvArgs) -> Self {
    Self {
      flags: StaticFeatureFlags {
        maybe_status_alert_category: args.maybe_status_alert_category.clone(),
        maybe_status_alert_custom_message: args.maybe_status_alert_custom_message.clone(),
      },
    }
  }
}
