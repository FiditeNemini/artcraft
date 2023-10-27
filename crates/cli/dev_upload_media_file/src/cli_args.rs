use std::path::PathBuf;
use clap::{App, Arg};
use errors::{anyhow, AnyhowResult};

pub struct CliArgs {
  pub file_path: PathBuf,
}

pub fn parse_cli_args() -> AnyhowResult<CliArgs> {
  let matches = App::new("dev_upload_media")
      .arg(Arg::with_name("file")
          .short("f")
          .long("file")
          .value_name("FILE")
          .help("File to upload")
          .takes_value(true)
          .required(true))
      .get_matches();

  let file_path = matches.value_of("file")
      .map(|val| val.trim().to_string())
      .ok_or(anyhow!("no file path supplied"))?;

  Ok(CliArgs {
    file_path: PathBuf::from(file_path),
  })
}
