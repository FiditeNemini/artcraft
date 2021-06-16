use anyhow::anyhow;
use crate::AnyhowResult;
use std::collections::HashSet;
use std::collections::hash_map::RandomState;
use std::sync::{RwLock, PoisonError, RwLockWriteGuard, RwLockReadGuard, Arc};

#[derive(Clone)]
pub struct IpBanlistSet {
  pub ip_banlist: Arc<RwLock<HashSet<String>>>,
}

impl IpBanlistSet {

  pub fn new() -> Self {
    Self {
      ip_banlist: Arc::new(RwLock::new(HashSet::new())),
    }
  }

  pub fn replace_list(&self, ip_banlist: HashSet<String>) -> AnyhowResult<()> {
    match self.ip_banlist.write() {
      Err(_) => Err(anyhow!("Can't write lock")),
      Ok(mut lock) => {
        *lock = ip_banlist;
        Ok(())
      },
    }
  }

  pub fn is_banned(&self, ip_address: String) -> AnyhowResult<bool> {
    match self.ip_banlist.read() {
      Err(_) => Err(anyhow!("Can't read lock")),
      Ok(read) => {
        let result = read.contains(&ip_address);
        Ok(result)
      },
    }
  }

  pub fn num_bans(&self) -> AnyhowResult<usize> {
    match self.ip_banlist.read() {
      Err(_) => Err(anyhow!("Can't read lock")),
      Ok(read) => {
        let result = read.len();
        Ok(result)
      },
    }
  }
}