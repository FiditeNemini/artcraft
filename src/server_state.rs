use sqlx::MySqlPool;

/// State that is injected into every endpoint.
#[derive(Clone)]
pub struct ServerState {
  pub env_config: EnvConfig,

  pub hostname: String,

  pub mysql_pool: MySqlPool,
}

#[derive(Clone)]
pub struct EnvConfig {
  // Number of thread workers.
  pub num_workers: usize,
  pub bind_address: String,
}
