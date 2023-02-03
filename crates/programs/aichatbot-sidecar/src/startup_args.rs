use clap::{App, Arg};
use errors::AnyhowResult;

const DEFAULT_SAVE_DIRECTORY : &'static str = "./data";

#[derive(Clone, Default)]
pub struct StartupArgs {
  /// Where the program stores its state and database
  pub save_directory: String,

  pub openai_secret_key: String,
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

  let mut maybe_save_directory = matches.value_of("directory")
      .map(|val| val.trim().to_string());

  if maybe_save_directory.is_none() {
    maybe_save_directory = std::env::current_dir()
        .ok()
        .map(|pathbuf| pathbuf.join(DEFAULT_SAVE_DIRECTORY))
        .map(|pathbuf| std::fs::canonicalize(pathbuf).ok())
        .flatten()
        .map(|pathbuf| pathbuf.to_str().map(|s| s.to_string()))
        .flatten();
  }

  let openai_secret_key = easyenv::get_env_string_required("OPENAI_SECRET_KEY")?;

  let save_directory = maybe_save_directory.unwrap_or_else(|| DEFAULT_SAVE_DIRECTORY.to_string());

  Ok(StartupArgs {
    save_directory,
    openai_secret_key,
  })
}
