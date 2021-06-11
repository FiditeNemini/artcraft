use crate::buckets::bucket_client::BucketClient;
use crate::common_queries::firehose_publisher::FirehosePublisher;
use crate::http_server::web_utils::cookie_manager::CookieManager;
use crate::http_server::web_utils::session_checker::SessionChecker;
use crate::util::encrypted_sort_id::SortKeyCrypto;
use sqlx::MySqlPool;

/// State that is injected into every endpoint.
#[derive(Clone)]
pub struct ServerState {
  /// Configuration from ENV vars.
  pub env_config: EnvConfig,

  pub hostname: String,

  pub mysql_pool: MySqlPool,

  pub cookie_manager: CookieManager,

  pub session_checker: SessionChecker,

  pub firehose_publisher: FirehosePublisher,

  pub private_bucket_client: BucketClient,
  pub public_bucket_client: BucketClient,

  /// Where to store audio uploads for w2l
  pub audio_uploads_bucket_root: String,

  pub sort_key_crypto: SortKeyCrypto,
}

#[derive(Clone)]
pub struct EnvConfig {
  // Number of thread workers.
  pub num_workers: usize,
  pub bind_address: String,
  pub cookie_domain: String,
  pub cookie_secure: bool,
  pub cookie_http_only: bool,
}
