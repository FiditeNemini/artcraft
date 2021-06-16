use anyhow::Error;
use crate::common_queries::list_ip_bans::list_ip_bans;
use crate::threads::ip_banlist_set::IpBanlistSet;
use log::info;
use log::warn;
use sqlx::MySqlPool;
use std::collections::HashSet;
use std::thread;
use std::time::Duration;
use tokio::signal::unix::{SignalKind, Signal};
use tokio::signal::unix::signal;
use tokio::signal::ctrl_c;
use tokio::task::JoinHandle;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tokio::sync::oneshot::{Sender, Receiver};

pub async fn poll_ip_bans(
  name: String,
  ip_banlist_set: IpBanlistSet,
  mysql_pool: MySqlPool,
  shutdown: Arc<AtomicBool>,
//  mut rx: Receiver<bool>,
//  ctrl_c: JoinHandle,
//  sigterm: JoinHandle,
//  sighup: JoinHandle,
//  sigquit: JoinHandle,
) {

  //let mut stream = signal(SignalKind::interrupt()).unwrap();

  loop {
    info!("[{}] Loop start...", &name);
    //let signal = rx.try_recv().unwrap_or(false);
    //info!("[{}] Signal: {}", &name, signal);

    // NB: So we can exit on ctrl-c and other signals.
    //tokio::select! {
    //  _ = background => println!(">>>>>> FOO"),
    //  _ = foreground => println!(">>>>>> BAR"),
    //if shutdown.load(Ordering::Relaxed) {
    //  info!("[{}] Shutdown received", &name);
    //  return;
    //}

    //};
//    tokio::select! {
//      res = ctrl_c => {
//        res??;
//        info!(root_logger, "Received signal, shutting down"; "signal" => "SIGINT");
//      }
//      _ = sigterm => {
//        info!(root_logger, "Received signal, shutting down"; "signal" => "SIGTERM");
//      }
//      _ = sighup => {
//        info!(root_logger, "Received signal, shutting down"; "signal" => "SIGHUP");
//      }
//      _ = sigquit => {
//        info!(root_logger, "Received signal, shutting down"; "signal" => "SIGQUIT");
//      }
//    };

//    signal.poll_recv();

    //info!("tokioselect (ip bans)");
    //tokio::select! {
    //  _ = shutdown_signal() => {
    //    info!("Sigint!!!")
    //  }
    //}

    let bans = match list_ip_bans(&mysql_pool).await {
      Ok(bans) => bans,
      Err(e) => {
        warn!("Error polling IP bans: {:?}", e);
        thread::sleep(Duration::from_millis(30_000));
        continue;
      }
    };

    info!("Job fetching IP Address Bans...");
    let ip_addresses = bans.iter()
        .map(|record| record.ip_address.clone())
        .collect::<HashSet<String>>();

    info!("Job found {} IP Address Bans.", ip_addresses.len());

    match ip_banlist_set.replace_list(ip_addresses) {
      Ok(_) => {}
      Err(e) => {
        warn!("error replacing banlist: {:?}", e);
      }
    }

    info!("[{}] Sleeping...", &name);
    for _ in 0..20 {
      //std::thread::yield_now();
      tokio::task::yield_now().await;

      //let signal = rx.try_recv().unwrap_or(false);
      //info!("[{}] Signal: {}", &name, signal);
      info!("[{}] Sleep.", &name);
      thread::sleep(Duration::from_millis(1_000));
      if shutdown.load(Ordering::Relaxed) {
        info!("[{}], Shutdown received", &name);
        return;
      }
    }

    info!("[{}] Loop end...", &name);
  }
}
