use r2d2_redis::{r2d2, RedisConnectionManager};
use sqlx::MySqlPool;

/// State that is injected into every endpoint.
pub struct ServerState {
  pub env_config: EnvConfig,

  pub hostname: String,

  //pub health_check_status: HealthCheckStatus,

  pub mysql_pool: MySqlPool,

  pub redis_pool: r2d2::Pool<RedisConnectionManager>,

  //pub redis_rate_limiters: RedisRateLimiters,

  //pub cookie_manager: CookieManager,

  //pub session_checker: SessionChecker,

  //pub sort_key_crypto: SortKeyCrypto,

  //pub ip_banlist: IpBanlistSet,

  pub caches: InMemoryCaches,
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

/// Different rate limiters for different users
//#[derive(Clone)]
//pub struct RedisRateLimiters {
//  /// Logged out users have stricter limits
//  pub logged_out: RedisRateLimiter,
//
//  /// Logged in users have a little more leeway
//  pub logged_in: RedisRateLimiter,
//
//  /// API consumers have even higher priority
//  /// (Temporary for VidVoice.ai; a long term solution builds an in-memory cache
//  /// of these or finds a better rate limit library that allows on-demand rate
//  /// constructions)
//  pub api_high_priority: RedisRateLimiter,
//}

/// In-memory caches
#[derive(Clone)]
pub struct InMemoryCaches {
}
