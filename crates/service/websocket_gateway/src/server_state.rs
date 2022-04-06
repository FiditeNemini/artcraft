use r2d2_redis::{r2d2, RedisConnectionManager};
use sqlx::MySqlPool;
use std::sync::Arc;
use tokio::runtime::Runtime;
use twitch_oauth2::{ClientId, ClientSecret};

/// State that is injected into every endpoint.
#[derive(Clone)]
pub struct ObsGatewayServerState {
  pub hostname: String,

  /// Configuration from ENV vars.
  /// Some of this might not be used.
  pub env_config: EnvConfig,

  pub twitch_oauth_secrets: TwitchOauthSecrets,

  pub backends: BackendsConfig,

  pub multithreading: MultithreadingConfig,
}

#[derive(Clone)]
pub struct BackendsConfig {
  pub mysql_pool: MySqlPool,
  pub redis_pool: r2d2::Pool<RedisConnectionManager>,
  /// We need the connection string to launch new PubSub threads from WebSocket connections.
  pub redis_pubsub_connection_string: String,
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
}

#[derive(Clone)]
pub struct MultithreadingConfig {
  /// So our WebSockets can launch new PubSub threads.
  /// These threads are 1:1 with websockets.
  pub redis_pubsub_runtime: Arc<Runtime>,
}
