#[macro_use] extern crate actix_web;
#[macro_use] extern crate anyhow;
#[macro_use] extern crate serde_derive;

extern crate actix_files;
extern crate arpabet;
extern crate hound;
extern crate serde;
extern crate tch;

pub mod config;
pub mod model;
pub mod old_model;
pub mod text;

use std::env;
use std::sync::Arc;

use arpabet::Arpabet;

use actix_cors::Cors;
use actix_files::Files;
use actix_web::http::{header, Method, StatusCode};
use actix_web::middleware::Logger;
use actix_web::web::Json;
use actix_web::{
  App,
  HttpRequest,
  HttpResponse,
  HttpServer,
  Responder,
  get,
  http,
  web,
};

use crate::config::ModelConfigs;
use crate::model::model_cache::ModelCache;
use crate::old_model::TacoMelModel;
use crate::text::text_to_arpabet_encoding;

#[get("/")]
async fn get_root(_request: HttpRequest) -> std::io::Result<HttpResponse> {
  println!("GET /");
  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("text/html; charset=utf-8")
      .body("Hello World"))
}

#[get("/readiness")]
async fn get_readiness(_request: HttpRequest) -> std::io::Result<HttpResponse> {
  println!("GET /readiness");
  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("text/html; charset=utf-8")
      .body("Ready"))
}

#[get("/liveness")]
async fn get_liveness(_request: HttpRequest) -> std::io::Result<HttpResponse> {
  println!("GET /liveness");
  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("text/html; charset=utf-8")
      .body("Live"))
}

#[get("/models")]
async fn get_models(_request: HttpRequest) -> std::io::Result<Json<ModelConfigs>> {
  println!("GET /models");
  let model_configs = ModelConfigs::load_from_file("models.toml");
  println!("Model Configs: {:?}", model_configs);

  Ok(Json(model_configs))
}

/// For JSON payloads
#[derive(Deserialize)]
pub struct TtsRequest {
  text: String,
  speaker: String,
  // The client can specify the models to use
  arpabet_tacotron_model: Option<String>,
  melgan_model: Option<String>,
}

/// For query strings
#[derive(Deserialize)]
pub struct TtsQueryRequest {
  text: String,
}

//#[get("/tts")]
/*async fn get_tts(request: HttpRequest,
  query: web::Query<TtsQueryRequest>,
  model: web::Data<Arc<TacoMelModel>>)
    -> std::io::Result<HttpResponse> {
  println!("GET /tts");

  let text = query.text.to_string();

  println!("Text: {}", text);

  let wav_data = model.run_tts_audio(&text);

  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("audio/wav")
      .body(wav_data))
}*/

//#[post("/tts")]
async fn post_tts(request: HttpRequest,
  query: web::Json<TtsRequest>,
  model_cache: web::Data<Arc<ModelCache>>)
  -> std::io::Result<HttpResponse> {
  println!("POST /tts");

  let tacotron_model = query.arpabet_tacotron_model
      .as_ref()
      .map(|s| s.clone())
      .unwrap_or("/home/bt/dev/voder/tacotron_melgan/tacotron2_trump_txlearn_ljs_arpabet_2020-05-14_ckpt11500.jit".to_string());

  let melgan_model = query.melgan_model
      .as_ref()
      .map(|s| s.clone())
      .unwrap_or("/home/bt/dev/tacotron-melgan/melgan_trump-txlearn-2020.05.05_13675.jit".to_string());

  let text = query.text.to_string();
  println!("Tacotron Model: {}", tacotron_model);
  println!("Melgan Model: {}", melgan_model);
  println!("Text: {}", text);

  let arpabet = Arpabet::load_cmudict();
  let encoded = text_to_arpabet_encoding(arpabet, &text);

  println!("Encoded Text: {:?}", encoded);

  let mut cache = model_cache.into_inner();

  let tacotron = cache.get_or_load_arbabet_tacotron(&tacotron_model).unwrap();
  let melgan = cache.get_or_load_melgan(&melgan_model).unwrap();

  let wav_data = TacoMelModel::new().run_tts_encoded(&tacotron, &melgan, &encoded);

  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("audio/wav")
      .body(wav_data))
}

const TACOTRON_MODEL : &'static str = "TACOTRON_MODEL";
const MELGAN_MODEL : &'static str = "MELGAN_MODEL";
const BIND_ADDRESS : &'static str = "BIND_ADDRESS";
const ASSET_DIRECTORY : &'static str = "ASSET_DIRECTORY";

//pub struct AppState {
//  pub arpabet: Arpabet,
//  pub model: TacoMelModel,
//}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
  println!("Loading configs.");

  let configs = ModelConfigs::load_from_file("models.toml");
  println!("Configs: {:?}", configs);

  println!("Starting service.");

  let bind_address = env::var(BIND_ADDRESS)
      .expect(&format!("Must include {} env var, eg `0.0.0.0:8000`", BIND_ADDRESS));

  let tacotron_filename = env::var(TACOTRON_MODEL)
      .expect(&format!("Must include {} env var", TACOTRON_MODEL));

  let melgan_filename = env::var(MELGAN_MODEL)
      .expect(&format!("Must include {} env var", MELGAN_MODEL));

  let asset_directory = env::var(ASSET_DIRECTORY)
      .expect(&format!("Must include {} env var", ASSET_DIRECTORY));

  println!("Loading models...");

  //let ttsEngine = TacoMelModel::create(&tacotron_filename, &melgan_filename);
  let model_cache = ModelCache::new();

  let arc = web::Data::new(Arc::new(model_cache));
  //let arc2 = web::Data::new(Arc::new(arpabet));

  println!("Starting HTTP service.");
  println!("Asset directory: {}", asset_directory);
  println!("Listening on: {}", bind_address);

  HttpServer::new(move || App::new()
      .wrap(Logger::default())
      .service(Files::new("/frontend", asset_directory.clone()).show_files_listing())
      .service(
        web::resource("/tts")
            //.route(web::get().to(get_tts))
            .route(web::post().to(post_tts))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(get_root)
      .service(get_readiness)
      .service(get_liveness)
      .service(get_models)
      .app_data(arc.clone())
      //.app_data(arc2.clone())
    )
    .bind(bind_address)?
    .run()
    .await
}

