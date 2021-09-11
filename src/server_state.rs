use crate::database::mediators::badge_granter::BadgeGranter;
use crate::database::mediators::firehose_publisher::FirehosePublisher;
use crate::http_server::web_utils::cookie_manager::CookieManager;
use crate::http_server::web_utils::redis_rate_limiter::RedisRateLimiter;
use crate::http_server::web_utils::session_checker::SessionChecker;
use crate::threads::ip_banlist_set::IpBanlistSet;
use crate::util::buckets::bucket_client::BucketClient;
use crate::util::encrypted_sort_id::SortKeyCrypto;
use r2d2_redis::{r2d2, RedisConnectionManager};
use sqlx::MySqlPool;

/// State that is injected into every endpoint.
#[derive(Clone)]
pub struct ServerState {
  /// Configuration from ENV vars.
  pub env_config: EnvConfig,

  pub hostname: String,

  pub mysql_pool: MySqlPool,

  pub redis_pool: r2d2::Pool<RedisConnectionManager>,

  pub redis_rate_limiter: RedisRateLimiter,

  pub cookie_manager: CookieManager,

  pub session_checker: SessionChecker,

  pub firehose_publisher: FirehosePublisher,
  pub badge_granter: BadgeGranter,

  pub private_bucket_client: BucketClient,
  pub public_bucket_client: BucketClient,

  /// Where to store audio uploads for w2l
  pub audio_uploads_bucket_root: String,

  pub sort_key_crypto: SortKeyCrypto,

  pub ip_banlist: IpBanlistSet,
}

#[derive(Clone)]
pub struct EnvConfig {
  // Number of thread workers.
  pub num_workers: usize,
  pub bind_address: String,
  pub cookie_domain: String,
  pub cookie_secure: bool,
  pub cookie_http_only: bool,
  pub website_homepage_redirect: String,
}
