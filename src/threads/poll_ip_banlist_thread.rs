use anyhow::Error;
use crate::common_queries::list_ip_bans::list_ip_bans;
use crate::threads::ip_banlist_set::IpBanlistSet;
use log::info;
use log::warn;
use sqlx::MySqlPool;
use std::collections::HashSet;
use std::thread;
use std::time::Duration;

pub async fn poll_ip_bans(
  ip_banlist_set: IpBanlistSet,
  mysql_pool: MySqlPool,
) {
  loop {
    info!("Job fetching IP Address Bans...");

    let bans = match list_ip_bans(&mysql_pool).await {
      Ok(bans) => bans,
      Err(e) => {
        warn!("Error polling IP bans: {:?}", e);
        thread::sleep(Duration::from_millis(30_000));
        continue;
      }
    };

    let ip_addresses = bans.iter()
        .map(|record| record.ip_address.clone())
        .collect::<HashSet<String>>();

    info!("Job found {} IP Address Bans.", ip_addresses.len());

    match ip_banlist_set.replace_list(ip_addresses) {
      Ok(_) => info!("internal banlist updated!"),
      Err(e) => {
        warn!("error replacing banlist: {:?}", e);
      },
    }

    thread::sleep(Duration::from_millis(20_000));
  }
}
