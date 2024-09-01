use log::info;

use easyenv::init_all_with_default_logging;
use errors::AnyhowResult;
use crate::args::{Command, parse_cli_args};
use crate::operations::calculate_model_weights_usages::run_migration::run_migration;

pub mod args;
pub mod operations;

#[tokio::main]
async fn main() -> AnyhowResult<()> {
    println!("db-backfill: run backfill or migration operations");

    init_all_with_default_logging(None);

    let command = parse_cli_args()?;

    match command.sub_command {
        Command::CalculateModelWeightsUsages => run_migration().await?,
        Command::CalculateTtsResultsUsages => {}
    }
    info!("command: {:?}", command);

    info!("TODO...");

    Ok(())
}