#![forbid(private_in_public)]
#![forbid(unused_must_use)]
//#![forbid(warnings)]

#![allow(dead_code)]
#![allow(non_snake_case)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]

#[macro_use] extern crate lazy_static;
#[macro_use] extern crate magic_crypt;
#[macro_use] extern crate serde_derive;

pub const RESERVED_USERNAMES : &'static str = include_str!("../../../db/reserved_usernames.txt");
pub const RESERVED_SUBSTRINGS : &'static str = include_str!("../../../db/reserved_usernames_including.txt");
pub const BANNED_SLURS : &'static str = include_str!("../../../db/banned_slurs.txt");

pub mod database;
pub mod http_clients;
pub mod http_server;
pub mod server_state;
pub mod threads;
pub mod util;
pub mod validations;

// NB: This is included so sqlx can generate all the queries.
mod job_queries;

use actix_cors::Cors;
use actix_http::http;
use actix_web::middleware::{Logger, DefaultHeaders};
use actix_web::{HttpServer, web, HttpResponse, App};
use config::shared_constants::DEFAULT_MYSQL_CONNECTION_STRING;
use config::shared_constants::DEFAULT_REDIS_CONNECTION_STRING;
use config::shared_constants::DEFAULT_RUST_LOG;
use crate::database::mediators::badge_granter::BadgeGranter;
use crate::database::mediators::firehose_publisher::FirehosePublisher;
use crate::http_server::endpoints::events::list_events::list_events_handler;
use crate::http_server::endpoints::leaderboard::get_leaderboard::leaderboard_handler;
use crate::http_server::endpoints::misc::enable_alpha_easy_handler::enable_alpha_easy_handler;
use crate::http_server::endpoints::misc::enable_alpha_handler::enable_alpha_handler;
use crate::http_server::endpoints::moderation::approval::pending_w2l_templates::get_pending_w2l_templates_handler;
use crate::http_server::endpoints::moderation::ip_bans::add_ip_ban::add_ip_ban_handler;
use crate::http_server::endpoints::moderation::ip_bans::delete_ip_ban::delete_ip_ban_handler;
use crate::http_server::endpoints::moderation::ip_bans::get_ip_ban::get_ip_ban_handler;
use crate::http_server::endpoints::moderation::ip_bans::list_ip_bans::list_ip_bans_handler;
use crate::http_server::endpoints::moderation::jobs::get_tts_inference_queue_count::get_tts_inference_queue_count_handler;
use crate::http_server::endpoints::moderation::jobs::get_w2l_inference_queue_count::get_w2l_inference_queue_count_handler;
use crate::http_server::endpoints::moderation::stats::get_voice_count_stats::get_voice_count_stats_handler;
use crate::http_server::endpoints::moderation::user_bans::ban_user::ban_user_handler;
use crate::http_server::endpoints::moderation::user_bans::list_banned_users::list_banned_users_handler;
use crate::http_server::endpoints::moderation::user_roles::list_roles::list_user_roles_handler;
use crate::http_server::endpoints::moderation::user_roles::list_staff::list_staff_handler;
use crate::http_server::endpoints::moderation::user_roles::set_user_role::set_user_role_handler;
use crate::http_server::endpoints::moderation::users::list_users::list_users_handler;
use crate::http_server::endpoints::tts::delete_tts_model::delete_tts_model_handler;
use crate::http_server::endpoints::tts::delete_tts_result::delete_tts_inference_result_handler;
use crate::http_server::endpoints::tts::edit_tts_model::edit_tts_model_handler;
use crate::http_server::endpoints::tts::edit_tts_result::edit_tts_inference_result_handler;
use crate::http_server::endpoints::tts::enqueue_infer_tts::infer_tts_handler;
use crate::http_server::endpoints::tts::enqueue_upload_tts_model::upload_tts_model_handler;
use crate::http_server::endpoints::tts::get_tts_inference_job_status::get_tts_inference_job_status_handler;
use crate::http_server::endpoints::tts::get_tts_model::get_tts_model_handler;
use crate::http_server::endpoints::tts::get_tts_model_use_count::get_tts_model_use_count_handler;
use crate::http_server::endpoints::tts::get_tts_result::get_tts_inference_result_handler;
use crate::http_server::endpoints::tts::get_tts_upload_model_job_status::get_tts_upload_model_job_status_handler;
use crate::http_server::endpoints::tts::list_tts_models::list_tts_models_handler;
use crate::http_server::endpoints::users::create_account::create_account_handler;
use crate::http_server::endpoints::users::edit_profile::edit_profile_handler;
use crate::http_server::endpoints::users::get_profile::get_profile_handler;
use crate::http_server::endpoints::users::list_user_tts_inference_results::list_user_tts_inference_results_handler;
use crate::http_server::endpoints::users::list_user_tts_models::list_user_tts_models_handler;
use crate::http_server::endpoints::users::list_user_w2l_inference_results::list_user_w2l_inference_results_handler;
use crate::http_server::endpoints::users::list_user_w2l_templates::list_user_w2l_templates_handler;
use crate::http_server::endpoints::users::login::login_handler;
use crate::http_server::endpoints::users::logout::logout_handler;
use crate::http_server::endpoints::users::session_info::session_info_handler;
use crate::http_server::endpoints::w2l::delete_w2l_result::delete_w2l_inference_result_handler;
use crate::http_server::endpoints::w2l::delete_w2l_template::delete_w2l_template_handler;
use crate::http_server::endpoints::w2l::edit_w2l_result::edit_w2l_inference_result_handler;
use crate::http_server::endpoints::w2l::edit_w2l_template::edit_w2l_template_handler;
use crate::http_server::endpoints::w2l::enqueue_infer_w2l::infer_w2l_handler;
use crate::http_server::endpoints::w2l::enqueue_infer_w2l_with_uploads::enqueue_infer_w2l_with_uploads;
use crate::http_server::endpoints::w2l::enqueue_upload_w2l_template::upload_w2l_template_handler;
use crate::http_server::endpoints::w2l::get_w2l_inference_job_status::get_w2l_inference_job_status_handler;
use crate::http_server::endpoints::w2l::get_w2l_result::get_w2l_inference_result_handler;
use crate::http_server::endpoints::w2l::get_w2l_template::get_w2l_template_handler;
use crate::http_server::endpoints::w2l::get_w2l_template_use_count::get_w2l_template_use_count_handler;
use crate::http_server::endpoints::w2l::get_w2l_upload_template_job_status::get_w2l_upload_template_job_status_handler;
use crate::http_server::endpoints::w2l::list_w2l_templates::list_w2l_templates_handler;
use crate::http_server::endpoints::w2l::set_w2l_template_mod_approval::set_w2l_template_mod_approval_handler;
use crate::http_server::middleware::ip_filter_middleware::IpFilter;
use crate::http_server::web_utils::cookie_manager::CookieManager;
use crate::http_server::web_utils::redis_rate_limiter::RedisRateLimiter;
use crate::http_server::web_utils::session_checker::SessionChecker;
use crate::server_state::{ServerState, EnvConfig};
use crate::threads::ip_banlist_set::IpBanlistSet;
use crate::threads::poll_ip_banlist_thread::poll_ip_bans;
use crate::util::buckets::bucket_client::BucketClient;
use crate::util::caching::single_item_ttl_cache::SingleItemTtlCache;
use crate::util::encrypted_sort_id::SortKeyCrypto;
use futures::Future;
use futures::executor::ThreadPool;
//use http_server_common::cors::build_common_cors_config;
use http_server_common::endpoints::default_route_404::default_route_404;
use http_server_common::endpoints::root_index::get_root_index;
use limitation::Limiter;
use log::{info};
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use r2d2_redis::redis::Commands;
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use std::sync::Arc;
use std::time::Duration;

// TODO TODO TODO TODO
// TODO TODO TODO TODO
// TODO TODO TODO TODO
// https://github.com/TensorSpeech/TensorFlowTTS (MAYBE USE THIS)
// TODO TODO TODO TODO
// TODO TODO TODO TODO
// TODO TODO TODO TODO

// TODO TODO TODO -- ON signup, add an "early adopter" badge. And a tool for making it easy to add badges.
// TODO - badge for uploading template, badge for uploading model, etc.

// TODO TODO -- also this: https://material-ui.com


const DEFAULT_BIND_ADDRESS : &'static str = "0.0.0.0:12345";

// Buckets (shared config)
const ENV_ACCESS_KEY : &'static str = "ACCESS_KEY";
const ENV_SECRET_KEY : &'static str = "SECRET_KEY";
const ENV_REGION_NAME : &'static str = "REGION_NAME";

// Buckets (private data)
const ENV_PRIVATE_BUCKET_NAME : &'static str = "W2L_PRIVATE_DOWNLOAD_BUCKET_NAME";
// Buckets (public data)
const ENV_PUBLIC_BUCKET_NAME : &'static str = "W2L_PUBLIC_DOWNLOAD_BUCKET_NAME";

// Various bucket roots
const ENV_AUDIO_UPLOADS_BUCKET_ROOT : &'static str = "AUDIO_UPLOADS_BUCKET_ROOT";

pub type AnyhowResult<T> = anyhow::Result<T>;

#[actix_web::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  // NB: Do not check this secrets-containing dotenv file into VCS.
  // This file should only contain *development* secrets, never production.
  let _ = dotenv::from_filename(".env-secrets").ok();

  info!("Obtaining hostname...");

  let server_hostname = hostname::get()
    .ok()
    .and_then(|h| h.into_string().ok())
    .unwrap_or("storyteller-web-unknown".to_string());

  info!("Hostname: {}", &server_hostname);

  info!("Connecting to database...");

  let db_connection_string =
    easyenv::get_env_string_or_default(
      "MYSQL_URL",
      DEFAULT_MYSQL_CONNECTION_STRING);

  let redis_connection_string =
      easyenv::get_env_string_or_default(
        "REDIS_URL",
        DEFAULT_REDIS_CONNECTION_STRING);

  let pool = MySqlPoolOptions::new()
    .max_connections(5)
    .connect(&db_connection_string)
    .await?;

  let firehose_publisher = FirehosePublisher {
    mysql_pool: pool.clone(), // NB: Pool is clone/sync/send-safe
  };

  let badge_granter = BadgeGranter {
    mysql_pool: pool.clone(), // NB: Pool is clone/sync/send-safe
    firehose_publisher: firehose_publisher.clone(), // NB: Also safe
  };

  let redis_manager = RedisConnectionManager::new(redis_connection_string.clone())?;

  let redis_pool = r2d2::Pool::builder()
      .build(redis_manager)?;

  let limiter_enabled = easyenv::get_env_bool_or_default("LIMITER_ENABLED", true);
  let limiter_max_requests = easyenv::get_env_num("LIMITER_MAX_REQUESTS", 3)?;
  let limiter_window_seconds = easyenv::get_env_num("LIMITER_WINDOW_SECONDS", 10)?;

  let limiter = Limiter::build(&redis_connection_string)
      .limit(limiter_max_requests)
      .period(Duration::from_secs(limiter_window_seconds))
      .finish()?;

  let redis_rate_limiter = RedisRateLimiter::new(limiter, limiter_enabled);

  info!("Reading env vars and setting up utils...");

  let bind_address = easyenv::get_env_string_or_default("BIND_ADDRESS", DEFAULT_BIND_ADDRESS);
  let num_workers = easyenv::get_env_num("NUM_WORKERS", 8)?;
  let hmac_secret = easyenv::get_env_string_or_default("COOKIE_SECRET", "notsecret");
  let cookie_domain = easyenv::get_env_string_or_default("COOKIE_DOMAIN", ".vo.codes");
  let cookie_secure = easyenv::get_env_bool_or_default("COOKIE_SECURE", true);
  let cookie_http_only = easyenv::get_env_bool_or_default("COOKIE_HTTP_ONLY", true);
  let website_homepage_redirect =
      easyenv::get_env_string_or_default("WEBSITE_HOMEPAGE_REDIRECT", "https://vo.codes/");

  let cookie_manager = CookieManager::new(&cookie_domain, &hmac_secret);
  let session_checker = SessionChecker::new(&cookie_manager);

  let access_key = easyenv::get_env_string_required(ENV_ACCESS_KEY)?;
  let secret_key = easyenv::get_env_string_required(ENV_SECRET_KEY)?;
  let region_name = easyenv::get_env_string_required(ENV_REGION_NAME)?;

  // Private and Public Buckets
  let private_bucket_name = easyenv::get_env_string_required(ENV_PRIVATE_BUCKET_NAME)?;
  let public_bucket_name = easyenv::get_env_string_required(ENV_PUBLIC_BUCKET_NAME)?;

  // Bucket roots
  let audio_uploads_bucket_root= easyenv::get_env_string_required(ENV_AUDIO_UPLOADS_BUCKET_ROOT)?;

  let private_bucket_client = BucketClient::create(
    &access_key,
    &secret_key,
    &region_name,
    &private_bucket_name,
    None,
  )?;

  let public_bucket_client = BucketClient::create(
    &access_key,
    &secret_key,
    &region_name,
    &public_bucket_name,
    None,
  )?;

  // In-Memory Cache
  let cache_ttl = easyenv::get_env_duration_seconds_or_default("VOICE_LIST_CACHE_TTL_SECONDS", Duration::from_secs(60));
  let voice_list_cache = SingleItemTtlCache::create_with_duration(cache_ttl);

  // NB: This secret really isn't too important.
  // We can even rotate it without too much impact to users.
  let sort_key_crypto_secret =
      easyenv::get_env_string_or_default("SORT_KEY_SECRET", "webscale");
  let sort_key_crypto = SortKeyCrypto::new(&sort_key_crypto_secret);

  let ip_banlist = IpBanlistSet::new();
  let ip_banlist2 = ip_banlist.clone();
  let mysql_pool3 = pool.clone();

  // Necessary to run our background work.
  // I tried getting this running with actix, tokio, by other means,
  // but didn't have much luck. The task didn't respond to ctrl-c
  // interrupts.
  let thread_pool = ThreadPool::new()?;

  thread_pool.spawn_ok(async {
    poll_ip_bans(ip_banlist2, mysql_pool3).await;
  });

  let server_state = ServerState {
    env_config: EnvConfig {
      num_workers,
      bind_address,
      cookie_domain,
      cookie_secure,
      cookie_http_only,
      website_homepage_redirect,
    },
    hostname: server_hostname,
    mysql_pool: pool,
    redis_pool,
    redis_rate_limiter,
    firehose_publisher,
    badge_granter,
    cookie_manager,
    session_checker,
    private_bucket_client,
    public_bucket_client,
    audio_uploads_bucket_root,
    sort_key_crypto,
    ip_banlist,
    voice_list_cache,
  };

  serve(server_state)
    .await?;
  Ok(())
}

pub async fn serve(server_state: ServerState) -> AnyhowResult<()>
{
  let bind_address = server_state.env_config.bind_address.clone();
  let num_workers = server_state.env_config.num_workers.clone();
  let hostname = server_state.hostname.clone();

  let server_state_arc = web::Data::new(Arc::new(server_state));

  info!("Starting HTTP service.");

  let log_format = "[%{HOSTNAME}e] %a \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\" %T";

  HttpServer::new(move || {
    // NB: Safe to clone due to internal arc
    let ip_banlist = server_state_arc.ip_banlist.clone();

    App::new()
      .app_data(server_state_arc.clone())
      //.wrap(build_common_cors_config())
      .wrap(Logger::new(&log_format)
        .exclude("/liveness")
        .exclude("/readiness"))
      .wrap(DefaultHeaders::new()
        .header("X-Backend-Hostname", &hostname)
        .header("X-Build-Sha", ""))
      .wrap(IpFilter::new(ip_banlist))
      // ==================== ACCOUNT CREATION / SESSION MANAGEMENT ====================
      .service(
        web::resource("/create_account")
          .route(web::post().to(create_account_handler))
          .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/login")
          .route(web::post().to(login_handler))
          .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/logout")
          .route(web::post().to(logout_handler))
          .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/session")
          .route(web::get().to(session_info_handler))
          .route(web::head().to(|| HttpResponse::Ok()))
      )
      // ==================== MODERATOR ====================
      .service(
        web::scope("/moderation")
            .service(
              web::resource("/staff")
                  .route(web::get().to(list_staff_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
            .service(
            web::scope("/ip_bans")
                .service(
                  web::resource("/list")
                      .route(web::get().to(list_ip_bans_handler))
                      .route(web::head().to(|| HttpResponse::Ok()))
                )
                .service(
                  web::resource("/add")
                      .route(web::post().to(add_ip_ban_handler))
                      .route(web::head().to(|| HttpResponse::Ok()))
                )
                .service(
                  web::resource("/{ip_address}")
                      .route(web::get().to(get_ip_ban_handler))
                      .route(web::head().to(|| HttpResponse::Ok()))
                )
                .service(
                  web::resource("/{ip_address}/delete")
                      .route(web::post().to(delete_ip_ban_handler))
                      .route(web::head().to(|| HttpResponse::Ok()))
                )
          )
            .service(
              web::scope("/user")
                  .service(
                    web::resource("/list")
                        .route(web::get().to(list_users_handler))
                        .route(web::head().to(|| HttpResponse::Ok()))
                  )
            )
          .service(
            web::scope("/user_bans")
                .service(
                  web::resource("/list")
                      .route(web::get().to(list_banned_users_handler))
                      .route(web::head().to(|| HttpResponse::Ok()))
                )
                .service(
                  web::resource("/manage_ban")
                      .route(web::post().to(ban_user_handler))
                      .route(web::head().to(|| HttpResponse::Ok()))
                )
            )
          .service(
            web::scope("/roles")
                .service(
                  web::resource("/list")
                      .route(web::get().to(list_user_roles_handler))
                      .route(web::head().to(|| HttpResponse::Ok()))
                )
                .service(
                  web::resource("/{username}/edit")
                      .route(web::post().to(set_user_role_handler))
                      .route(web::head().to(|| HttpResponse::Ok()))
                )
          )
          .service(
            web::scope("/jobs")
                .service(
                  web::resource("/tts_inference_queue_stats")
                      .route(web::get().to(get_tts_inference_queue_count_handler))
                      .route(web::head().to(|| HttpResponse::Ok()))
                )
                .service(
                  web::resource("/w2l_inference_queue_stats")
                      .route(web::get().to(get_w2l_inference_queue_count_handler))
                      .route(web::head().to(|| HttpResponse::Ok()))
                )
          )
          .service(
            web::scope("/pending")
                .service(
                  web::resource("/w2l_templates")
                      .route(web::get().to(get_pending_w2l_templates_handler))
                      .route(web::head().to(|| HttpResponse::Ok()))
                )
                .service(
                  web::resource("/w2l_inference_queue_stats")
                      .route(web::get().to(get_w2l_inference_queue_count_handler))
                      .route(web::head().to(|| HttpResponse::Ok()))
                )
          )
          .service(
            web::scope("/stats")
                .service(
                  web::resource("/tts_voices")
                      .route(web::get().to(get_voice_count_stats_handler))
                      .route(web::head().to(|| HttpResponse::Ok()))
                )
          )
      )
      // ==================== TTS ====================
      .service(
        web::scope("/tts")
          .service(
            web::resource("/upload")
              .route(web::post().to(upload_tts_model_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/inference")
              .route(web::post().to(infer_tts_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/list")
              .route(web::get().to(list_tts_models_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/model/{token}")
              .route(web::get().to(get_tts_model_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/model/{token}/delete")
              .route(web::post().to(delete_tts_model_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/model/{model_token}/count")
              .route(web::get().to(get_tts_model_use_count_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/model/{model_token}/edit")
              .route(web::post().to(edit_tts_model_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
          web::resource("/result/{token}")
              .route(web::get().to(get_tts_inference_result_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
          web::resource("/result/{token}/edit")
              .route(web::post().to(edit_tts_inference_result_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/result/{token}/delete")
              .route(web::post().to(delete_tts_inference_result_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
          web::resource("/job/{token}")
              .route(web::get().to(get_tts_inference_job_status_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
          web::resource("/upload_model_job/{token}")
              .route(web::get().to(get_tts_upload_model_job_status_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
      )
      // ==================== WAV2LIP ====================
      .service(
        web::scope("/w2l")
          .service(
            web::resource("/upload")
              .route(web::post().to(upload_w2l_template_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/inference")
              .route(web::post().to(enqueue_infer_w2l_with_uploads))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/list")
              .route(web::get().to(list_w2l_templates_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/template/{token}")
              .route(web::get().to(get_w2l_template_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/template/{template_token}/count")
              .route(web::get().to(get_w2l_template_use_count_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
           web::resource("/template/{template_token}/edit")
              .route(web::post().to(edit_w2l_template_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
          web::resource("/template/{token}/moderate")
              .route(web::post().to(set_w2l_template_mod_approval_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/template/{token}/delete")
              .route(web::post().to(delete_w2l_template_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/result/{token}")
              .route(web::get().to(get_w2l_inference_result_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
          web::resource("/result/{token}/edit")
              .route(web::post().to(edit_w2l_inference_result_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/result/{token}/delete")
              .route(web::post().to(delete_w2l_inference_result_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
         .service(
            web::resource("/job/{token}")
              .route(web::get().to(get_w2l_inference_job_status_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/upload_template_job/{token}")
              .route(web::get().to(get_w2l_upload_template_job_status_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
      )
      // ==================== USER DATA ====================
      .service(
        web::scope("/user")
          .service(
            web::resource("/{username}/profile")
              .route(web::get().to(get_profile_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/{username}/edit_profile")
              .route(web::post().to(edit_profile_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/{username}/tts_models")
              .route(web::get().to(list_user_tts_models_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/{username}/tts_results")
              .route(web::get().to(list_user_tts_inference_results_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/{username}/w2l_templates")
                .route(web::get().to(list_user_w2l_templates_handler))
                .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/{username}/w2l_results")
                .route(web::get().to(list_user_w2l_inference_results_handler))
                .route(web::head().to(|| HttpResponse::Ok()))
          )
      )
      .service(
        web::resource("/events")
          .route(web::get().to(list_events_handler))
          .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/leaderboard")
            .route(web::get().to(leaderboard_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      //.service(get_root_index)
      .service(enable_alpha_handler)
      .service(enable_alpha_easy_handler)
      //.default_service( web::route().to(default_route_404))
  })
  .bind(bind_address)?
  .workers(num_workers)
  .run()
  .await?;

  Ok(())
}
