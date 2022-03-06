use crate::http_server::endpoints::tts::list_tts_models::TtsModelRecordForResponse;
use crate::http_server::web_utils::cookie_manager::CookieManager;
use crate::http_server::web_utils::redis_rate_limiter::RedisRateLimiter;
use crate::http_server::web_utils::session_checker::SessionChecker;
use crate::threads::ip_banlist_set::IpBanlistSet;
use crate::util::buckets::bucket_client::BucketClient;
use crate::util::caching::single_item_ttl_cache::SingleItemTtlCache;
use crate::util::encrypted_sort_id::SortKeyCrypto;
use database_queries::mediators::badge_granter::BadgeGranter;
use database_queries::mediators::firehose_publisher::FirehosePublisher;
use r2d2_redis::{r2d2, RedisConnectionManager};
use sqlx::MySqlPool;
use crate::threads::db_health_checker_thread::db_health_check_status::HealthCheckStatus;

/// State that is injected into every endpoint.
#[derive(Clone)]
pub struct ServerState {
  /// Configuration from ENV vars.
  pub env_config: EnvConfig,

  pub hostname: String,

  pub health_check_status: HealthCheckStatus,

  pub mysql_pool: MySqlPool,

  pub redis_pool: r2d2::Pool<RedisConnectionManager>,

  pub redis_rate_limiters: RedisRateLimiters,

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

  /// In-memory caches with TTL-based eviction. Contains a list of all voices.
  pub voice_list_cache: SingleItemTtlCache<Vec<TtsModelRecordForResponse>>,

  pub twitch_oauth: TwitchOauth,
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

/// Necessary to run the OAuth flow.
#[derive(Clone)]
pub struct TwitchOauth {
  pub secrets: TwitchOauthSecrets,
  pub redirect_landing_url: String,
  pub redirect_landing_finished_url: String,
}

/// Necessary to run the OAuth flow.
#[derive(Clone)]
pub struct TwitchOauthSecrets {
  pub client_id: String,
  pub client_secret: String,
}

/// Different rate limiters for different users
#[derive(Clone)]
pub struct RedisRateLimiters {
  /// Logged out users have stricter limits
  pub logged_out: RedisRateLimiter,

  /// Logged in users have a little more leeway
  pub logged_in: RedisRateLimiter,

  /// A rate limiter for TTS and W2L uploads
  pub model_upload: RedisRateLimiter,
}
