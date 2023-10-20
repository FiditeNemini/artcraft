use std::path::PathBuf;
use clap::{App, Arg};
use errors::{anyhow, AnyhowResult};

pub struct CliArgs {
  pub file_path: PathBuf,
}

pub fn parse_cli_args() -> AnyhowResult<CliArgs> {
  let matches = App::new("scrape_test")
      .arg(Arg::with_name("file")
          .short("f")
          .long("file")
          .value_name("FILE")
          .help("File to upload")
          .takes_value(true)
          .required(true))
      //.arg(Arg::with_name("print_html")
      //  .long("html")
      //  .help("Print the HTML scraped")
      //  .takes_value(false)
      //  .required(false))
      .get_matches();

  let file_path = matches.value_of("file")
      .map(|val| val.trim().to_string())
      .ok_or(anyhow!("no url supplied"))?;

  //let print_html = matches.is_present("print_html");

  Ok(CliArgs {
    file_path: PathBuf::from(file_path),
  })
}
