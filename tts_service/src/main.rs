#[macro_use] extern crate anyhow;
#[macro_use] extern crate diesel;
#[macro_use] extern crate log;
#[macro_use] extern crate serde_derive;

extern crate actix_web;
extern crate actix_files;
extern crate arpabet;
extern crate hound;
extern crate serde;
extern crate tch;

pub mod database;
pub mod endpoints;
pub mod inference;
pub mod model;
pub mod rate_limiter;
pub mod schema;
pub mod text;

use std::env;
use std::fmt::Debug;
use std::fmt::Display;
use std::str::FromStr;
use std::sync::Arc;

use actix_cors::Cors;
use actix_files::Files;
use actix_web::middleware::{Logger, DefaultHeaders};
use actix_web::{App, HttpResponse, HttpServer, web, http};
use anyhow::Result as AnyhowResult;

use actix::{Addr, SyncArbiter, Context};
use arpabet::Arpabet;
use crate::database::connector::DatabaseConnector;
use crate::database::sentence_recorder::SentenceRecorder;
use crate::endpoints::index::get_root;
use crate::endpoints::liveness::get_liveness;
use crate::endpoints::models::get_models;
use crate::endpoints::readiness::get_readiness;
use crate::endpoints::sentences::get_sentences;
use crate::endpoints::speak::legacy_speak::legacy_get_speak;
use crate::endpoints::speak::legacy_tts::post_tts;
use crate::endpoints::speak::speak::post_speak;
use crate::endpoints::speak::speak_with_spectrogram::post_speak_with_spectrogram;
use crate::endpoints::speakers::get_speakers;
use crate::endpoints::words::get_words;
use crate::model::model_cache::ModelCache;
use crate::model::model_config::ModelConfigs;
use crate::rate_limiter::noop_rate_limiter::NoOpRateLimiter;
use crate::rate_limiter::rate_limiter::RateLimiter;
use crate::rate_limiter::redis_rate_limiter::RedisRateLimiter;
use crate::text::checker::TextChecker;
use limitation::Limiter;
use std::time::Duration;

const ENV_ARPABET_EXTRAS_FILE : &'static str = "ARPABET_EXTRAS_FILE";
const ENV_ASSET_DIRECTORY: &'static str = "ASSET_DIRECTORY";
const ENV_BIND_ADDRESS: &'static str = "BIND_ADDRESS";
const ENV_DATABASE_ENABLED : &'static str = "DATABASE_ENABLED";
const ENV_DATABASE_URL : &'static str = "DATABASE_URL";
const ENV_DEFAULT_SAMPLE_RATE_HZ : &'static str = "DEFAULT_SAMPLE_RATE_HZ";
const ENV_MAX_CHAR_LEN : &'static str = "MAX_CHAR_LEN";
const ENV_MIN_CHAR_LEN : &'static str = "MIN_CHAR_LEN";
const ENV_MODEL_CONFIG_FILE: &'static str = "MODEL_CONFIG_FILE";
const ENV_NUM_WORKERS: &'static str = "NUM_WORKERS";
const ENV_RATE_LIMITER_ENABLED : &'static str = "RATE_LIMITER_ENABLED";
const ENV_RATE_LIMITER_MAX_REQUESTS : &'static str = "RATE_LIMITER_MAX_REQUESTS";
const ENV_RATE_LIMITER_REDIS_HOST : &'static str = "RATE_LIMITER_REDIS_HOST";
const ENV_RATE_LIMITER_REDIS_PASS: &'static str = "RATE_LIMITER_REDIS_PASS";
const ENV_RATE_LIMITER_REDIS_PORT : &'static str = "RATE_LIMITER_REDIS_PORT";
const ENV_RATE_LIMITER_REDIS_USER : &'static str = "RATE_LIMITER_REDIS_USER";
const ENV_RATE_LIMITER_WINDOW_SECONDS : &'static str = "RATE_LIMITER_WINDOW_SECONDS";
const ENV_RUST_LOG : &'static str = "RUST_LOG";

const DEFAULT_ASSET_DIRECTORY : &'static str = "/home/bt/dev/voice/voder/tts_frontend/build";
const DEFAULT_BIND_ADDRESS : &'static str = "0.0.0.0:12345";
const DEFAULT_DATABASE_ENABLED : bool = false;
const DEFAULT_DATABASE_URL : &'static str = "mysql://root:root@localhost/mumble";
const DEFAULT_DEFAULT_SAMPLE_RATE_HZ : u32 = 22050;
const DEFAULT_MAX_CHAR_LEN : usize = 255;
const DEFAULT_MIN_CHAR_LEN : usize = 0;
const DEFAULT_MODEL_CONFIG_FILE: &'static str = "models.toml";
const DEFAULT_NUM_WORKERS : usize = 4;
const DEFAULT_RATE_LIMITER_ENABLED : bool = true;
const DEFAULT_RATE_LIMITER_MAX_REQUESTS : usize = 3;
const DEFAULT_RATE_LIMITER_REDIS_HOST : &'static str = "127.0.0.1";
const DEFAULT_RATE_LIMITER_REDIS_PORT : u16 = 6379;
const DEFAULT_RATE_LIMITER_WINDOW_SECONDS : u64 = 10;
const DEFAULT_RUST_LOG: &'static str = "debug,actix_web=info";


/** State that is easy to pass between handlers. */
pub struct AppState {
  pub arpabet: Arpabet,
  pub model_configs: ModelConfigs,
  pub model_cache: ModelCache,
  pub sentence_recorder: SentenceRecorder,
  pub text_checker: TextChecker,
  pub default_sample_rate_hz: u32,
  pub rate_limiter: Box<dyn RateLimiter>,
}

/** Startup parameters for the server. */
pub struct ServerArgs {
  pub bind_address: String,
  pub hostname: String,
  pub num_workers: usize,
  pub asset_directory: String,
}

fn get_env_string_optional(env_name: &str) -> Option<String> {
  match env::var(env_name).as_ref().ok() {
    Some(s) => Some(s.to_string()),
    None => {
      warn!("Env var '{}' not supplied.", env_name);
      None
    },
  }
}

fn get_env_string(env_name: &str, default: &str) -> String {
  match env::var(env_name).as_ref().ok() {
    Some(s) => s.to_string(),
    None => {
      warn!("Env var '{}' not supplied. Using default '{}'.", env_name, default);
      default.to_string()
    },
  }
}

fn get_env_bool(env_name: &str, default: bool) -> AnyhowResult<bool> {
  match env::var(env_name).as_ref().ok() {
    None => {
      warn!("Env var '{}' not supplied. Using default '{}'.", env_name, default);
      Ok(default)
    },
    Some(val) => match val.as_ref() {
      "TRUE" => Ok(true),
      "true" => Ok(true),
      "FALSE" => Ok(false),
      "false" => Ok(false),
      _ => bail!("Invalid boolean value: {:?}", val),
    }
  }
}

// the trait `std::error::Error` is not implemented for `<T as std::str::FromStr>::Err`
fn get_env_num<T>(env_name: &str, default: T) -> AnyhowResult<T>
  where T: FromStr + Display,
        T::Err: Debug
{
  match env::var(env_name).as_ref().ok() {
    None => {
      warn!("Env var '{}' not supplied. Using default '{}'.", env_name, default);
      Ok(default)
    },
    Some(val) => {
      match val.parse::<T>() {
        Err(e) => bail!("Can't parse value '{:?}'. Error: {:?}", val, e),
        Ok(val) => Ok(val),
      }
    },
  }
}

pub fn get_rate_limiter_redis() -> AnyhowResult<String> {
  let redis_host = get_env_string(ENV_RATE_LIMITER_REDIS_HOST, DEFAULT_RATE_LIMITER_REDIS_HOST);
  let redis_port = get_env_num::<u16>(ENV_RATE_LIMITER_REDIS_PORT, DEFAULT_RATE_LIMITER_REDIS_PORT)?;

  let address = if let Some(redis_user) = get_env_string_optional(ENV_RATE_LIMITER_REDIS_USER) {
    if let Some(redis_password) = get_env_string_optional(ENV_RATE_LIMITER_REDIS_PASS) {
      format!("redis://{}:{}@{}:{}/", redis_user, redis_password, redis_host, redis_port)
    } else {
      format!("redis://{}@{}:{}/", redis_user, redis_host, redis_port)
    }
  } else {
    format!("redis://{}:{}/", redis_host, redis_port)
  };

  Ok(address)
}

pub fn main() -> AnyhowResult<()> {
  if env::var(ENV_RUST_LOG)
      .as_ref()
      .ok()
      .is_none()
  {
    println!("Setting default logging level to \"{}\", override with env var {}.",
      DEFAULT_RUST_LOG, ENV_RUST_LOG);
    std::env::set_var(ENV_RUST_LOG, DEFAULT_RUST_LOG);
  }

  env_logger::init();

  let arpabet_extras_file = get_env_string_optional(ENV_ARPABET_EXTRAS_FILE);
  let bind_address = get_env_string(ENV_BIND_ADDRESS, DEFAULT_BIND_ADDRESS);
  let asset_directory = get_env_string(ENV_ASSET_DIRECTORY, DEFAULT_ASSET_DIRECTORY);
  let model_config_file = get_env_string(ENV_MODEL_CONFIG_FILE, DEFAULT_MODEL_CONFIG_FILE);
  let num_workers = get_env_num::<usize>(ENV_NUM_WORKERS, DEFAULT_NUM_WORKERS)?;
  let database_enabled = get_env_bool(ENV_DATABASE_ENABLED, DEFAULT_DATABASE_ENABLED)?;
  let database_url = get_env_string(ENV_DATABASE_URL, DEFAULT_DATABASE_URL);
  let max_char_len = get_env_num::<usize>(ENV_MAX_CHAR_LEN, DEFAULT_MAX_CHAR_LEN)?;
  let min_char_len = get_env_num::<usize>(ENV_MIN_CHAR_LEN, DEFAULT_MIN_CHAR_LEN)?;
  let default_sample_rate_hz = get_env_num::<u32>(ENV_DEFAULT_SAMPLE_RATE_HZ,
    DEFAULT_DEFAULT_SAMPLE_RATE_HZ)?;

  let limiter_enabled = get_env_bool(ENV_RATE_LIMITER_ENABLED, DEFAULT_RATE_LIMITER_ENABLED)?;
  let limiter_max_requests = get_env_num::<usize>(ENV_RATE_LIMITER_MAX_REQUESTS, DEFAULT_RATE_LIMITER_MAX_REQUESTS)?;
  let limiter_window_seconds = get_env_num::<u64>(ENV_RATE_LIMITER_WINDOW_SECONDS, DEFAULT_RATE_LIMITER_WINDOW_SECONDS)?;

  let server_hostname = hostname::get()
      .ok()
      .and_then(|h| h.into_string().ok())
      .unwrap_or("tts-unknown".to_string());

  info!("Arpabet extras file: {:?}", arpabet_extras_file);
  info!("Asset directory: {}", asset_directory);
  info!("Bind address: {}", bind_address);
  info!("Using model config file: {}", model_config_file);
  info!("Max character length: {}", max_char_len);
  info!("Min character length: {}", min_char_len);
  info!("Hostname: {}", server_hostname);
  info!("Default sample rate hz: {}", default_sample_rate_hz);

  info!("Rate Limiter enabled: {}", limiter_enabled);
  info!("Rate Limiter max requests: {}", limiter_max_requests);
  info!("Rate Limiter window seconds: {}", limiter_window_seconds);

  let model_configs = ModelConfigs::load_from_file(&model_config_file);

  info!("Model configs: {:?}", model_configs);

  let model_cache = ModelCache::new(&model_configs.model_locations);

  let rate_limiter : Box<dyn RateLimiter> = if limiter_enabled {
    let redis_address = get_rate_limiter_redis()?;
    info!("Redis connection string: {} ; connecting...", redis_address);

    let limiter = Limiter::build(&redis_address)
        .limit(limiter_max_requests)
        .period(Duration::from_secs(limiter_window_seconds))
        .finish()?;

    Box::new(RedisRateLimiter::new(limiter))
  } else {
    info!("Not using Redis. Installing NoOp limiter.");
    Box::new(NoOpRateLimiter {})
  };

  let sentence_recorder = if database_enabled {
    info!("Connecting to database...");
    let mut db_connector = DatabaseConnector::create(&database_url);

    match db_connector.connect() {
      Ok(_) => info!("Connected successfully"),
      Err(_) => error!("Could not connect to database."),
    }

    SentenceRecorder::new(db_connector)
  } else {
    info!("Not using database; will not record sentences.");
    SentenceRecorder::no_op_recoder()
  };

  let max_char_len = if max_char_len == 0 { None } else { Some(max_char_len) };
  let min_char_len = if min_char_len == 0 { None } else { Some(min_char_len) };

  let mut text_checker = TextChecker::create();
  text_checker.set_max_character_length(max_char_len);
  text_checker.set_min_character_length(min_char_len);

  let arpabet : Arpabet = match arpabet_extras_file {
    Some(extras_filename) => {
      info!("Loading default CMUdict Arpabet...");
      // Here we introduce silly internet words such as "lulz".
      // NB: The extras file takes precedence for any dictionary collisions.
      let cmu_dict = Arpabet::load_cmudict();
      info!("Loading Arpabet extensions...");
      let extra_arpabet = Arpabet::load_from_file(&extras_filename)?;
      let arpabet = cmu_dict.combine(&extra_arpabet);
      arpabet.clone()
    },
    None => {
      info!("Loading default CMUdict Arpabet...");
      Arpabet::load_cmudict().clone()
    },
  };

  info!("Arpabet loaded. {} entries", arpabet.len());

  let app_state = AppState {
    arpabet,
    model_configs,
    model_cache,
    sentence_recorder,
    text_checker,
    default_sample_rate_hz,
    rate_limiter,
  };

  let server_args = ServerArgs {
    bind_address,
    hostname: server_hostname,
    num_workers,
    asset_directory,
  };

  run_server(app_state, server_args)?;
  Ok(())
}

#[actix_rt::main]
async fn run_server(app_state: AppState, server_args: ServerArgs) -> std::io::Result<()> {
  let arc = web::Data::new(Arc::new(app_state));

  info!("Starting HTTP service.");

  let log_format = "[%{HOSTNAME}e] %a \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\" %T";

  let asset_directory = server_args.asset_directory.clone();
  let bind_address = server_args.bind_address.clone();
  let server_hostname = server_args.hostname.clone();

  HttpServer::new(move || App::new()
      .wrap(Cors::new()
          .allowed_origin("http://localhost:12345")
          .allowed_origin("http://localhost:3000")
          .allowed_origin("http://localhost:5555")
          .allowed_origin("http://localhost:8080")
          .allowed_origin("http://localhost:8000")
          .allowed_origin("http://localhost:7000")
          .allowed_origin("http://jungle.horse")
          .allowed_origin("https://jungle.horse")
          .allowed_origin("http://mumble.stream")
          .allowed_origin("https://mumble.stream")
          .allowed_origin("http://trumped.com")
          .allowed_origin("https://trumped.com")
          .allowed_origin("http://vo.codes")
          .allowed_origin("https://vo.codes")
          .allowed_origin("http://vocodes.com")
          .allowed_origin("https://vocodes.com")
          .allowed_methods(vec!["GET", "POST", "OPTIONS"])
          .allowed_headers(vec![
            http::header::ACCEPT,
            http::header::ACCESS_CONTROL_ALLOW_ORIGIN, // Tabulator Ajax
            http::header::CONTENT_TYPE,
            http::header::HeaderName::from_static("x-requested-with") // Tabulator Ajax sends
          ])
          .max_age(3600)
          .finish())
      .wrap(Logger::new(&log_format)
          .exclude("/liveness")
          .exclude("/readiness"))
      .wrap(DefaultHeaders::new().header("X-Backend-Hostname", &server_hostname))
      .service(Files::new("/frontend", asset_directory.clone())
          .index_file("index.html"))
      .service(
        web::resource("/advanced_tts")
            .route(web::post().to(post_tts))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/speak")
            .route(web::post().to(post_speak))
            .route(web::get().to(legacy_get_speak))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/speak_spectrogram")
            .route(web::post().to(post_speak_with_spectrogram))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(get_root)
      .service(get_readiness)
      .service(get_liveness)
      .service(get_models)
      .service(get_speakers)
      .service(get_sentences)
      .service(get_words)
      .app_data(arc.clone())
    )
    .bind(bind_address)?
    .workers(server_args.num_workers)
    .run()
    .await
}
