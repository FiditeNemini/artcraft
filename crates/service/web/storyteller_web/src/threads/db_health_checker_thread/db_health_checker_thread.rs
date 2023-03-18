use anyhow::Error;
use crate::threads::db_health_checker_thread::db_health_check_status::HealthCheckStatus;
use mysql_queries::queries::health_check::health_check_query::{health_check_db, HealthCheckResult};
use log::debug;
use log::error;
use log::info;
use log::warn;
use sqlx::MySqlPool;
use std::thread;
use std::time::Duration;

pub async fn db_health_checker_thread(
  health_check_status: HealthCheckStatus,
  mysql_pool: MySqlPool,
  check_duration: Duration,
) {
  loop {
    debug!("Checking DB health...");

    match health_check_db(&mysql_pool).await {
      Ok(result) => {
        match health_check_status.record_ping_success(result.present_time) {
          Err(e) => error!("Problem updating application health checks!"),
          Ok(_) => {},
        }
      }
      Err(e) => {
        error!("Problem health checking database: {:?}", e);
        match health_check_status.record_ping_failure() {
          Err(e) => error!("Problem updating application health checks!"),
          Ok(_) => {},
        }
      }
    }

    thread::sleep(check_duration);
  }

  warn!("Should never happen: Health Checker Exits");
}
