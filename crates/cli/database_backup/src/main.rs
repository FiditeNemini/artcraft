use easyenv::init_all_with_default_logging;
use log::info;
use stripe::BillingPortalConfiguration;
use container_common::anyhow_result::AnyhowResult;

fn main() -> AnyhowResult<()> {
    init_all_with_default_logging(None);

    info!("Running...");

    Ok(())
}

fn create_billing_portal() {

    BillingPortalConfiguration::new();
}