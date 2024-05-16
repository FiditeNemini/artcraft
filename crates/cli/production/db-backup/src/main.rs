use log::info;

use container_common::anyhow_result::AnyhowResult;
use easyenv::init_all_with_default_logging;

fn main() -> AnyhowResult<()> {
    init_all_with_default_logging(None);

    info!("TODO...");

    Ok(())
}