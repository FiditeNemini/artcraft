use std::env;

/// Name of the environment variable Rust's env logger uses
pub const ENV_RUST_LOG : &str = "RUST_LOG";

/// The default logging level
pub const DEFAULT_LOG_LEVEL: &str = "info";



/// Initialize Rust's env logger.
///
/// The Rust logger reads the desired log level from the `RUST_LOG` environment variable. If this
/// isn't set, the provided default is used. If a default fallback isn't provided to this function,
/// we fall back to `"info"`.
///
/// A more robust logging config might configure on a per-component basis, eg.
/// `"tokio_reactor=warn,hyper=info,debug"`. You can read more in the `log` and `env_logger` crate
/// docs.
pub fn init_env_logger(default_if_absent: Option<&str>) {
  if env::var(ENV_RUST_LOG)
      .as_ref()
      .ok()
      .is_none()
  {
    let default_log_level = default_if_absent.unwrap_or(DEFAULT_LOG_LEVEL);
    println!("Setting default logging level to \"{}\", override with env var {}.",
             default_log_level, ENV_RUST_LOG);
    env::set_var(ENV_RUST_LOG, default_log_level);
  }

  env_logger::init();
}

