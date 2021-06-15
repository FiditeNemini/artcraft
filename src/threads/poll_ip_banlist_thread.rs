use crate::common_queries::list_ip_bans::list_ip_bans;
use crate::threads::ip_banlist_set::IpBanlistSet;
use log::warn;
use sqlx::MySqlPool;
use std::collections::HashSet;
use std::thread;
use std::time::Duration;
use anyhow::Error;

pub async fn poll_ip_bans(ip_banlist_set: IpBanlistSet, mysql_pool: &MySqlPool) {

  loop {
    let bans = match list_ip_bans(mysql_pool).await {
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

    match ip_banlist_set.replace_list(ip_addresses) {
      Ok(_) => {}
      Err(e) => {
        warn!("error replacing banlist: {:?}", e);
      }
    }
  }
}
