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
pub mod old_model;
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
use crate::old_model::TacoMelModel;
use crate::text::text_to_arpabet_encoding;

const BIND_ADDRESS : &'static str = "BIND_ADDRESS";
const ASSET_DIRECTORY : &'static str = "ASSET_DIRECTORY";
const MODEL_CONFIG_FILE : &'static str = "MODEL_CONFIG_FILE";

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
  println!("Loading configs.");
  std::env::set_var("RUST_LOG", "actix_web=info");
  env_logger::init();

  let model_config_file = match env::var(MODEL_CONFIG_FILE).as_ref().ok() {
    Some(filename) => filename.to_string(),
    None => {
      println!("MODEL_CONFIG_FILE not set, defaulting to '{}'.", DEFAULT_MODEL_CONFIG_FILE);
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

  let bind_address = env::var(BIND_ADDRESS)
      .expect(&format!("Must include {} env var, eg `0.0.0.0:8000`", BIND_ADDRESS));

  let asset_directory = env::var(ASSET_DIRECTORY)
      .expect(&format!("Must include {} env var", ASSET_DIRECTORY));

  let arc = web::Data::new(Arc::new(app_state));

  println!("Asset directory: {}", asset_directory);
  println!("Listening on: {}", bind_address);

  println!("Starting HTTP service.");

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
      .wrap(Logger::default()
          .exclude("/liveness")
          .exclude("/readiness"))
      .service(Files::new("/frontend", asset_directory.clone()).show_files_listing())
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
    .run()
    .await
}
