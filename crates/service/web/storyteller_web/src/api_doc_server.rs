// Never allow these
#![forbid(private_in_public)]
#![forbid(unused_must_use)] // NB: It's unsafe to not close/check some things

// Okay to toggle
//#![forbid(warnings)]
#![allow(unreachable_patterns)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]

// Always allow
#![allow(dead_code)]
#![allow(non_snake_case)]

#[macro_use] extern crate lazy_static;
#[macro_use] extern crate magic_crypt;
#[macro_use] extern crate serde_derive;

use utoipa_swagger_ui::SwaggerUi;

use std::sync::Arc;
use std::time::Duration;

use actix_cors::Cors;
use actix_web::{App, HttpResponse, HttpServer, middleware, web};
use actix_web::middleware::{DefaultHeaders, Logger};
use anyhow::anyhow;
use elasticsearch::Elasticsearch;
use elasticsearch::http::transport::Transport;
use futures::Future;
use limitation::Limiter;
use log::{error, info};
use r2d2_redis::r2d2;
use r2d2_redis::redis::Commands;
use r2d2_redis::RedisConnectionManager;
use sqlx::mysql::MySqlPoolOptions;
use sqlx::MySqlPool;
use tokio::runtime::Runtime;



use actix_helpers::middleware::banned_cidr_filter::banned_cidr_filter::BannedCidrFilter;
use actix_helpers::middleware::banned_cidr_filter::banned_cidr_set::BannedCidrSet;
use actix_helpers::middleware::banned_cidr_filter::load_cidr_ban_set_from_file::load_cidr_ban_set_from_file;
use actix_helpers::middleware::banned_ip_filter::banned_ip_filter::BannedIpFilter;
use actix_helpers::middleware::banned_ip_filter::ip_ban_list::ip_ban_list::IpBanList;
use actix_helpers::middleware::banned_ip_filter::ip_ban_list::load_ip_ban_list_from_directory::load_ip_ban_list_from_directory;
use actix_helpers::middleware::disabled_endpoint_filter::disabled_endpoint_filter::DisabledEndpointFilter;
use actix_helpers::middleware::disabled_endpoint_filter::disabled_endpoints::disabled_endpoints::DisabledEndpoints;
use actix_helpers::middleware::disabled_endpoint_filter::disabled_endpoints::exact_match_disabled_endpoints::ExactMatchDisabledEndpoints;
use actix_helpers::middleware::disabled_endpoint_filter::disabled_endpoints::prefix_disabled_endpoints::PrefixDisabledEndpoints;
use billing_component::stripe::stripe_config::{FullUrlOrPath, StripeCheckoutConfigs, StripeConfig, StripeCustomerPortalConfigs, StripeSecrets};
use billing_component::stripe::traits::internal_product_to_stripe_lookup::InternalProductToStripeLookup;
use billing_component::stripe::traits::internal_session_cache_purge::InternalSessionCachePurge;
use billing_component::stripe::traits::internal_subscription_product_lookup::InternalSubscriptionProductLookup;
use billing_component::stripe::traits::internal_user_lookup::InternalUserLookup;
use bootstrap::bootstrap::{bootstrap, BootstrapArgs};
use cloud_storage::bucket_client::BucketClient;
use config::common_env::CommonEnv;
use config::shared_constants::DEFAULT_MYSQL_CONNECTION_STRING;
use config::shared_constants::DEFAULT_RUST_LOG;
use container_common::files::read_toml_file_to_struct::read_toml_file_to_struct;
use email_sender::smtp_email_sender::SmtpEmailSender;
use errors::AnyhowResult;
use http_server_common::cors::{build_cors_config, build_production_cors_config};
use memory_caching::single_item_ttl_cache::SingleItemTtlCache;
use mysql_queries::mediators::badge_granter::BadgeGranter;
use mysql_queries::mediators::firehose_publisher::FirehosePublisher;
use redis_caching::redis_ttl_cache::RedisTtlCache;
use reusable_types::server_environment::ServerEnvironment;
use twitch_common::twitch_secrets::TwitchSecrets;
use url_config::third_party_url_redirector::ThirdPartyUrlRedirector;
use users_component::cookies::anonymous_visitor_tracking::avt_cookie_manager::AvtCookieManager;
use users_component::cookies::session::session_cookie_manager::SessionCookieManager;
use users_component::utils::session_checker::SessionChecker;

use crate::billing::internal_product_to_stripe_lookup_impl::InternalProductToStripeLookupImpl;
use crate::billing::internal_session_cache_purge_impl::InternalSessionCachePurgeImpl;
use crate::billing::stripe_internal_subscription_product_lookup_impl::StripeInternalSubscriptionProductLookupImpl;
use crate::billing::stripe_internal_user_lookup_impl::StripeInternalUserLookupImpl;
use crate::configs::static_api_tokens::{StaticApiTokenConfig, StaticApiTokens, StaticApiTokenSet};
use crate::http_server::middleware::pushback_filter_middleware::PushbackFilter;
use crate::http_server::web_utils::redis_rate_limiter::RedisRateLimiter;
use crate::memory_cache::model_token_to_info_cache::ModelTokenToInfoCache;
use crate::routes::add_routes;
use crate::server_state::{DurableInMemoryCaches, EnvConfig, EphemeralInMemoryCaches, InMemoryCaches, RedisRateLimiters, ServerInfo, ServerState, StaticFeatureFlags, StripeSettings, TrollBans, TwitchOauth, TwitchOauthSecrets};
use crate::threads::db_health_checker_thread::db_health_check_status::HealthCheckStatus;
use crate::threads::db_health_checker_thread::db_health_checker_thread::db_health_checker_thread;
use crate::threads::poll_ip_banlist_thread::poll_ip_bans;
use crate::threads::poll_model_token_info_thread::poll_model_token_info_thread;
use crate::util::encrypted_sort_id::SortKeyCrypto;
use crate::util::troll_user_bans::load_troll_user_ban_list_from_directory::load_user_token_ban_list_from_directory;
use crate::util::troll_user_bans::troll_user_ban_list::TrollUserBanList;

pub const RESERVED_USERNAMES : &str = include_str!("../../../../../includes/binary_includes/reserved_usernames.txt");
pub const RESERVED_SUBSTRINGS : &str = include_str!("../../../../../includes/binary_includes/reserved_usernames_including.txt");

pub mod billing;
pub mod configs;
pub mod cookies;
pub mod http_server;
pub mod memory_cache;
pub mod model;
pub mod routes;
pub mod server_state;
pub mod subscriptions;
pub mod threads;
pub mod user_avatars;
pub mod util;
pub mod validations;

const DEFAULT_BIND_ADDRESS : &str = "0.0.0.0:12345";

// Buckets (shared config)
const ENV_ACCESS_KEY : &str = "ACCESS_KEY";
const ENV_SECRET_KEY : &str = "SECRET_KEY";
const ENV_REGION_NAME : &str = "REGION_NAME";

// Buckets (private data)
const ENV_PRIVATE_BUCKET_NAME : &str = "W2L_PRIVATE_DOWNLOAD_BUCKET_NAME";
// Buckets (public data)
const ENV_PUBLIC_BUCKET_NAME : &str = "W2L_PUBLIC_DOWNLOAD_BUCKET_NAME";

// Various bucket roots
const ENV_AUDIO_UPLOADS_BUCKET_ROOT : &str = "AUDIO_UPLOADS_BUCKET_ROOT";

use std::{
  error::Error,
  future::{self, Ready},
  net::Ipv4Addr,
};

pub mod api_doc;
use api_doc::ApiDoc;

use futures::future::LocalBoxFuture;

use utoipa::OpenApi;
#[actix_web::main]
async fn main() -> Result<(), impl Error> {
  HttpServer::new(move || {
      App::new()
          .service(
              SwaggerUi::new("/{_:.*}")
                  .url("/api-docs/openapi.json", ApiDoc::openapi()),
          )
  })
  .bind(("localhost", 8989)).unwrap()
  .run().await
}