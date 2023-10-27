use clap::{App, Arg};

use errors::AnyhowResult;

pub struct CliArgs {
  pub seed_cloud_bucket: bool,
  pub seed_elasticsearch: bool,
}

pub fn parse_cli_args() -> AnyhowResult<CliArgs> {
  let matches = App::new("dev-database-seed")
      .arg(Arg::with_name("seed_cloud_bucket")
          .long("bucket")
          .help("Seed the cloud bucket with files")
          .takes_value(false)
          .required(false))
      .arg(Arg::with_name("seed_elasticsearch")
        .long("elasticsearch")
        .help("Seed the local elasticsearch")
        .takes_value(false)
        .required(false))
      .get_matches();

  Ok(CliArgs {
    seed_cloud_bucket: matches.is_present("seed_cloud_bucket"),
    seed_elasticsearch: matches.is_present("seed_elasticsearch"),
  })
}
