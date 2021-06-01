#![deny(unused_must_use)]
#![allow(dead_code)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]
//#![allow(warnings)]

#[macro_use] extern crate lazy_static;
#[macro_use] extern crate serde_derive;

pub const RESERVED_USERNAMES : &'static str = include_str!("../db/reserved_usernames.txt");
pub const RESERVED_SUBSTRINGS : &'static str = include_str!("../db/reserved_usernames_including.txt");

pub mod buckets;
pub mod common_queries;
pub mod database_helpers;
pub mod http_server;
pub mod server_state;
pub mod shared_constants;
pub mod util;
pub mod validations;

// NB: This is included so sqlx can generate all the queries.
mod job_queries;

use actix_cors::Cors;
use actix_http::http;
use actix_web::middleware::{Logger, DefaultHeaders};
use actix_web::{HttpServer, web, HttpResponse, App};
use crate::buckets::bucket_client::BucketClient;
use crate::common_queries::firehose_publisher::FirehosePublisher;
use crate::http_server::endpoints::default_route_404::default_route_404;
use crate::http_server::endpoints::events::list_events::list_events_handler;
use crate::http_server::endpoints::misc::enable_alpha::enable_alpha;
use crate::http_server::endpoints::root_index::get_root_index;
use crate::http_server::endpoints::tts::enqueue_infer_tts::infer_tts_handler;
use crate::http_server::endpoints::tts::enqueue_upload_tts_model::upload_tts_model_handler;
use crate::http_server::endpoints::tts::list_tts_models::list_tts_models_handler;
use crate::http_server::endpoints::users::create_account::create_account_handler;
use crate::http_server::endpoints::users::get_profile::get_profile_handler;
use crate::http_server::endpoints::users::list_user_w2l_inference_results::list_user_w2l_inference_results_handler;
use crate::http_server::endpoints::users::list_user_w2l_templates::list_user_w2l_templates_handler;
use crate::http_server::endpoints::users::login::login_handler;
use crate::http_server::endpoints::users::logout::logout_handler;
use crate::http_server::endpoints::users::session_info::session_info_handler;
use crate::http_server::endpoints::w2l::enqueue_infer_w2l::infer_w2l_handler;
use crate::http_server::endpoints::w2l::enqueue_infer_w2l_with_uploads::enqueue_infer_w2l_with_uploads;
use crate::http_server::endpoints::w2l::enqueue_upload_w2l_template::upload_w2l_template_handler;
use crate::http_server::endpoints::w2l::get_w2l_result::get_w2l_inference_result_handler;
use crate::http_server::endpoints::w2l::get_w2l_template::get_w2l_template_handler;
use crate::http_server::endpoints::w2l::list_w2l_templates::list_w2l_templates_handler;
use crate::http_server::web_utils::cookie_manager::CookieManager;
use crate::http_server::web_utils::session_checker::SessionChecker;
use crate::server_state::{ServerState, EnvConfig};
use crate::shared_constants::{DEFAULT_RUST_LOG, DEFAULT_MYSQL_PASSWORD};
use log::{info};
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use std::sync::Arc;

// TODO TODO TODO TODO
// TODO TODO TODO TODO
// TODO TODO TODO TODO
// https://github.com/TensorSpeech/TensorFlowTTS (MAYBE USE THIS)
// TODO TODO TODO TODO
// TODO TODO TODO TODO
// TODO TODO TODO TODO



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
      DEFAULT_MYSQL_PASSWORD);

  let pool = MySqlPoolOptions::new()
    .max_connections(5)
    .connect(&db_connection_string)
    .await?;

  let firehose_publisher = FirehosePublisher {
    mysql_pool: pool.clone(), // NB: Pool is clone/sync/send-safe
  };

  info!("Reading env vars and setting up utils...");

  let bind_address = easyenv::get_env_string_or_default("BIND_ADDRESS", DEFAULT_BIND_ADDRESS);
  let num_workers = easyenv::get_env_num("NUM_WORKERS", 4)?;
  let hmac_secret = easyenv::get_env_string_or_default("COOKIE_SECRET", "notsecret");
  let cookie_domain = easyenv::get_env_string_or_default("COOKIE_DOMAIN", ".vo.codes");
  let cookie_secure = easyenv::get_env_bool_or_default("COOKIE_SECURE", true);
  let cookie_http_only = easyenv::get_env_bool_or_default("COOKIE_HTTP_ONLY", true);

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

  let server_state = ServerState {
    env_config: EnvConfig {
      num_workers,
      bind_address,
      cookie_domain,
      cookie_secure,
      cookie_http_only,
    },
    hostname: server_hostname,
    mysql_pool: pool,
    firehose_publisher,
    cookie_manager,
    session_checker,
    private_bucket_client,
    public_bucket_client,
    audio_uploads_bucket_root,
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
    App::new()
      .app_data(server_state_arc.clone())
      .wrap(Cors::default()
        .allowed_origin("http://api.jungle.horse")
        .allowed_origin("http://api.vo.codes")
        .allowed_origin("http://jungle.horse")
        .allowed_origin("http://jungle.horse:12345")
        .allowed_origin("http://jungle.horse:7000")
        .allowed_origin("http://localhost:12345")
        .allowed_origin("http://localhost:3000")
        .allowed_origin("http://localhost:5555")
        .allowed_origin("http://localhost:7000")
        .allowed_origin("http://localhost:8000")
        .allowed_origin("http://localhost:8080")
        .allowed_origin("http://mumble.stream")
        .allowed_origin("http://trumped.com")
        .allowed_origin("http://vo.codes")
        .allowed_origin("http://vocodes.com")
        .allowed_origin("https://jungle.horse")
        .allowed_origin("https://api.jungle.horse")
        .allowed_origin("https://mumble.stream")
        .allowed_origin("https://trumped.com")
        .allowed_origin("https://vo.codes")
        .allowed_origin("https://vocodes.com")
        .allowed_methods(vec!["GET", "POST", "OPTIONS"])
        .supports_credentials()
        .allowed_headers(vec![
          http::header::ACCEPT,
          http::header::ACCESS_CONTROL_ALLOW_ORIGIN, // Tabulator Ajax
          http::header::CONTENT_TYPE,
          http::header::ACCESS_CONTROL_ALLOW_CREDENTIALS, // https://stackoverflow.com/a/46412839
          http::header::HeaderName::from_static("x-requested-with") // Tabulator Ajax sends
        ])
        .max_age(3600))
      .wrap(Logger::new(&log_format)
        .exclude("/liveness")
        .exclude("/readiness"))
      .wrap(DefaultHeaders::new()
        .header("X-Backend-Hostname", &hostname)
        .header("X-Build-Sha", ""))
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
      )
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
            web::resource("/template/{slug}")
              .route(web::get().to(get_w2l_template_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/result/{token}")
              .route(web::get().to(get_w2l_inference_result_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
      )
      .service(
        web::resource("/profile/{username}")
          .route(web::get().to(get_profile_handler))
          .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::scope("/user")
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
      .service(get_root_index)
      .service(enable_alpha)
      .default_service( web::route().to(default_route_404))
  })
  .bind(bind_address)?
  .workers(num_workers)
  .run()
  .await?;

  Ok(())
}
