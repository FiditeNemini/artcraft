use std::path::PathBuf;
use clap::{App, Arg, ArgMatches};
use log::info;
use path_absolutize::Absolutize;
use errors::{anyhow, AnyhowResult};

const DEFAULT_SAVE_DIRECTORY : &'static str = "runtime_data";

#[derive(Clone, Default)]
pub struct StartupArgs {
  /// Where the program stores its state and database
  pub save_directory: String,

  pub openai_secret_key: String,
  pub fakeyou_api_token: String,
}

/// Read in environment and CLI args and output the consolidated startup state
pub fn get_startup_args() -> AnyhowResult<StartupArgs> {
  let matches = App::new("aichatbot-sidecar")
      .arg(Arg::with_name("file")
          .short("d")
          .long("directory")
          .value_name("DIRECTORY")
          .help("The save directory")
          .takes_value(true)
          .required(false))
      .get_matches();

  let openai_secret_key = easyenv::get_env_string_required("OPENAI_SECRET_KEY")?;

  let fakeyou_api_token = easyenv::get_env_string_required("FAKEYOU_API_TOKEN")?;

  let save_directory = get_save_directory(&matches)?;

  Ok(StartupArgs {
    save_directory,
    openai_secret_key,
    fakeyou_api_token,
  })
}


fn get_save_directory(matches: &ArgMatches) -> AnyhowResult<String> {
  let mut maybe_save_directory = matches.value_of("directory")
      .map(|val| val.trim().to_string())
      .map(|val| PathBuf::from(val));

  info!("SA dir(1): {:?}", maybe_save_directory);

  if maybe_save_directory.is_none() {
    // Use the current directory
    maybe_save_directory = std::env::current_dir()
        .ok()
        .map(|pathbuf| pathbuf.join(DEFAULT_SAVE_DIRECTORY));
        //.map(|pathbuf| std::fs::canonicalize(pathbuf).ok())
        //.flatten();

    info!("SA dir(2): {:?}", maybe_save_directory);
  }

  let save_directory = maybe_save_directory
      .unwrap_or_else(|| PathBuf::from(DEFAULT_SAVE_DIRECTORY));

  info!("SA dir(3): {:?}", save_directory);

  let save_directory = save_directory
      .absolutize()
      .ok()
      .map(|inner| inner.to_path_buf())
      .map(|pathbuf| pathbuf.to_str().map(|s| s.to_string()))
      .flatten()
      .ok_or(anyhow!("could not construct path"))?;

  info!("SA dir(4): {:?}", save_directory);

  Ok(save_directory)
}
