use sqlx::MySqlPool;
use crate::util::cookies::CookieManager;

/// State that is injected into every endpoint.
#[derive(Clone)]
pub struct ServerState {
  /// Configuration from ENV vars.
  pub env_config: EnvConfig,

  pub hostname: String,

  pub mysql_pool: MySqlPool,

  pub cookie_manager: CookieManager,
}

#[derive(Clone)]
pub struct EnvConfig {
  // Number of thread workers.
  pub num_workers: usize,
  pub bind_address: String,
}
