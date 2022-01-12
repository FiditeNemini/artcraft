use sqlx::MySqlPool;
use twitch_oauth2::{ClientId, ClientSecret};

/// State that is injected into every endpoint.
#[derive(Clone)]
pub struct ObsGatewayServerState {
  /// Configuration from ENV vars.
  /// Some of this might not be used.
  pub env_config: EnvConfig,
  pub hostname: String,

  pub twitch_oauth_secrets: TwitchOauthSecrets,
  pub twitch_oauth_temp: TwitchOauthTemp,

  pub backends: BackendsConfig,
}

#[derive(Clone)]
pub struct BackendsConfig {
  pub mysql_pool: MySqlPool,
}

// TODO: Many of these do not need to be passed around past server init.
#[derive(Clone)]
pub struct EnvConfig {
  // Number of thread workers.
  pub num_workers: usize,
  pub bind_address: String,
  pub cookie_domain: String,
  pub cookie_secure: bool,
  pub cookie_http_only: bool,
  pub website_homepage_redirect: String,
}

/// Necessary to run the OAuth flow.
#[derive(Clone)]
pub struct TwitchOauthSecrets {
  pub client_id: String,
  pub client_secret: String,
  pub redirect_url: String,
}

/// TODO: THIS IS JUST FOR FEATURE DEVELOPMENT. KILL THIS.
///  Being lazy here until I have a decent DB model and know what I want to build.
#[deprecated]
#[derive(Clone)]
pub struct TwitchOauthTemp {
  pub temp_oauth_user_id: String,
  pub temp_oauth_access_token: String,
  pub temp_oauth_refresh_token: String,
}
