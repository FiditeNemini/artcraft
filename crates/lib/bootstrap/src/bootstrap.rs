use errors::{anyhow, AnyhowResult};
use server_environment::ServerEnvironment;
use std::path::Path;
use log::info;

pub struct BootstrapArgs<'a, P: AsRef<Path>> {
  /// The name of the application or service
  pub app_name: &'a str,

  /// Default rust log level.
  /// If the RUST_LOG env var is set, it will take precedence over this setting.
  pub default_logging_override: Option<&'a str>,

  pub config_search_directories: &'a [P],
}

/// Information about how the application is deployed.
#[derive(Clone)]
pub struct ContainerEnvironment {
  pub server_environment: ServerEnvironment,
  pub hostname: String,
  pub cluster_name: String,
}

/// Environment variable for server environment.
const SERVER_ENVIRONMENT : &'static str = "SERVER_ENVIRONMENT";

pub fn bootstrap<P: AsRef<Path>>(args: BootstrapArgs<'_, P>) -> AnyhowResult<ContainerEnvironment> {
  easyenv::init_all_with_default_logging(args.default_logging_override);

  info!("Bootstrapping application {}", &args.app_name);

  let server_environment = easyenv::get_env_string_optional(SERVER_ENVIRONMENT)
      .map(|environment| ServerEnvironment::from_str(&environment)
          .ok_or(anyhow!("couldn't parse environment: {:?}", &environment)))
      .transpose()?
      .unwrap_or(ServerEnvironment::Development);

  info!("Currently deployed in environment: {:?}",&server_environment);

  let server_hostname = hostname::get()
      .ok()
      .and_then(|h| h.into_string().ok())
      .unwrap_or_else(|| format!("{}-unknown", args.app_name));

  info!("With hostname: {:?}", &server_hostname);

  let env_config_file_names = match server_environment {
    ServerEnvironment::Development => vec![
      format!("{}.common.env", &args.app_name),
      format!("{}.development.env", &args.app_name),
      format!("{}.development-secrets.env", &args.app_name), // NB: .gitignore these files
    ],
    ServerEnvironment::Production => vec![
      format!("{}.common.env", &args.app_name),
      format!("{}.production.env", &args.app_name),
    ],
  };

  for config_file in env_config_file_names.into_iter() {
    info!("Loading environment variable config file: {}", &config_file);

    let was_read = envvar::maybe_read_from_filename_and_paths(
      &config_file,
      args.config_search_directories)?;

    info!("Environment config file {} was read: {}", &config_file, was_read);
  }

  let cluster_name = easyenv::get_env_string_optional("K8S_CLUSTER_NAME")
      .unwrap_or("unknown-cluster".to_string());

  Ok(ContainerEnvironment {
    server_environment,
    hostname: server_hostname,
    cluster_name,
  })
}
