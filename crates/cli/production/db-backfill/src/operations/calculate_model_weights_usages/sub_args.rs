use clap::Parser;
use serde_derive::Deserialize;

use errors::AnyhowResult;

use crate::args::remaining_args;

#[derive(Parser, Debug, Deserialize)]
#[command(name="calculate-model-weights-usages")]
#[serde(rename_all = "snake_case")]
pub struct SubArgs {
  #[arg(name="model-token", long="model-token", help="scope to a model", required=false)]
  pub model_token: Option<String>,

  #[arg(name="start-date", long="start-date", help="the starting date", required=false)]
  pub start_date: Option<String>,

  #[arg(name="end-date", long="end-date", help="the ending date", required=false)]
  pub end_date: Option<String>,
}

pub fn parse_cli_sub_args() -> AnyhowResult<SubArgs> {
  let args = SubArgs::parse_from(remaining_args());
  Ok(args)
}
