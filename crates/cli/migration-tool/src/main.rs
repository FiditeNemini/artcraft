//! migration-tool
//!
//! Migrate database records.
//!


use config::shared_constants::DEFAULT_RUST_LOG;
use errors::AnyhowResult;

#[tokio::main]
pub async fn main() -> AnyhowResult<()> {
  println!("migration-tool: migrate database records");

  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  // NB: This secrets file differs from the rest because we might actually want to cross
  // development/production boundaries for migration. We don't want to pull in secrets
  // from other sources. (Hopefully this isn't getting out of hand at this point.)
  easyenv::from_filename(".env-migration-tool-secrets")?;


  Ok(())
}
