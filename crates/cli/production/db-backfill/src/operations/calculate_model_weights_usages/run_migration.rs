use log::info;
use errors::AnyhowResult;

use crate::operations::calculate_model_weights_usages::sub_args::parse_cli_sub_args;

pub async fn run_migration() -> AnyhowResult<()> {
  let args = parse_cli_sub_args()?;

  info!("args: {:?}", args);

  println!("calculate_model_weights_usages: run migration");

  Ok(())
}
