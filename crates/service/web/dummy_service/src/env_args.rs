use errors::{anyhow, AnyhowResult};
use reusable_types::server_environment::ServerEnvironment;

pub struct EnvArgs {
  // Actix server parameters
  pub bind_address: String,
  pub num_workers: usize,
  pub enable_gzip: bool,
  pub server_environment: ServerEnvironment,
}

pub fn env_args() -> AnyhowResult<EnvArgs> {
  let bind_address = easyenv::get_env_string_or_default("BIND_ADDRESS", "0.0.0.0:12345");
  let num_workers = easyenv::get_env_num("NUM_WORKERS", 8)?;

  let enable_gzip = easyenv::get_env_num("ENABLE_GZIP", false)?;

  let server_environment = ServerEnvironment::from_str(
    &easyenv::get_env_string_required("SERVER_ENVIRONMENT")?)
      .ok_or(anyhow!("invalid server environment"))?;

  Ok(EnvArgs {
    bind_address,
    num_workers,
    enable_gzip,
    server_environment,
  })
}
