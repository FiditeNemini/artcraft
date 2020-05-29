extern crate actix_web;
#[macro_use] extern crate anyhow;
#[macro_use] extern crate serde_derive;

extern crate actix_files;
extern crate arpabet;
extern crate hound;
extern crate serde;
extern crate tch;

pub mod config;
pub mod endpoints;
pub mod model;
pub mod text;

use std::env;
use std::sync::Arc;

use arpabet::Arpabet;

use actix_cors::Cors;
use actix_files::Files;
use actix_web::middleware::Logger;
use actix_web::web::Json;
use actix_web::{App, HttpResponse, HttpServer, web, http};

use crate::config::ModelConfigs;
use crate::endpoints::index::get_root;
use crate::endpoints::legacy_speak::legacy_get_speak;
use crate::endpoints::liveness::get_liveness;
use crate::endpoints::models::get_models;
use crate::endpoints::readiness::get_readiness;
use crate::endpoints::speak::post_speak;
use crate::endpoints::speakers::get_speakers;
use crate::endpoints::tts::post_tts;
use crate::model::model_cache::ModelCache;
use crate::model::old_model::TacoMelModel;
use crate::text::text_to_arpabet_encoding;

const BIND_ADDRESS : &'static str = "BIND_ADDRESS";
const ASSET_DIRECTORY : &'static str = "ASSET_DIRECTORY";
const MODEL_CONFIG_FILE : &'static str = "MODEL_CONFIG_FILE";

const DEFAULT_BIND_ADDRESS : &'static str = "0.0.0.0:12345";
const DEFAULT_ASSET_DIRECTORY : &'static str = "/home/bt/dev/voder/tts_frontend/build";
const DEFAULT_MODEL_CONFIG_FILE: &'static str = "models.toml";

/// For query strings
#[derive(Deserialize)]
pub struct TtsQueryRequest {
  text: String,
}

/** State that is easy to pass between handlers. */
pub struct AppState {
  pub model_configs: ModelConfigs,
  pub model_cache: ModelCache,
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
  std::env::set_var("RUST_LOG", "actix_web=info");
  env_logger::init();

  let bind_address = match env::var(BIND_ADDRESS).as_ref().ok() {
    Some(address) => address.to_string(),
    None => {
      println!("BIND_ADDRESS env var not set, defaulting to '{}'.", DEFAULT_BIND_ADDRESS);
      DEFAULT_BIND_ADDRESS.to_string()
    },
  };

  let asset_directory = match env::var(ASSET_DIRECTORY).as_ref().ok() {
    Some(dir) => dir.to_string(),
    None => {
      println!("ASSET_DIRECTORY env var not set, defaulting to '{}'.", DEFAULT_ASSET_DIRECTORY);
      DEFAULT_ASSET_DIRECTORY.to_string()
    },
  };

  println!("Asset directory: {}", asset_directory);
  println!("Bind address: {}", bind_address);

  let model_config_file = match env::var(MODEL_CONFIG_FILE).as_ref().ok() {
    Some(filename) => filename.to_string(),
    None => {
      println!("MODEL_CONFIG_FILE env var not set, defaulting to '{}'.", DEFAULT_MODEL_CONFIG_FILE);
      DEFAULT_MODEL_CONFIG_FILE.to_string()
    },
  };

  println!("Using model config file: {}", model_config_file);

  let model_configs = ModelConfigs::load_from_file(&model_config_file);

  println!("Model configs: {:?}", model_configs);

  let model_cache = ModelCache::new(&model_configs.model_locations);

  let app_state = AppState {
    model_configs,
    model_cache,
  };

  let arc = web::Data::new(Arc::new(app_state));

  println!("Starting HTTP service.");

  let log_format = "[%{HOSTNAME}e] %a \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\" %T";

  HttpServer::new(move || App::new()
      .wrap(Cors::new()
          .allowed_origin("http://localhost:12345")
          .allowed_origin("http://localhost:8080")
          .allowed_origin("http://trumped.com")
          .allowed_origin("https://trumped.com")
          .allowed_origin("http://jungle.horse")
          .allowed_origin("https://jungle.horse")
          .allowed_methods(vec!["GET", "POST"])
          .allowed_headers(vec![http::header::ACCEPT])
          .allowed_header(http::header::CONTENT_TYPE)
          .max_age(3600)
          .finish())
      .wrap(Logger::new(&log_format)
          .exclude("/liveness")
          .exclude("/readiness"))
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
      .service(get_root)
      .service(get_readiness)
      .service(get_liveness)
      .service(get_models)
      .service(get_speakers)
      .app_data(arc.clone())
    )
    .bind(bind_address)?
    .workers(5)
    .run()
    .await
}
