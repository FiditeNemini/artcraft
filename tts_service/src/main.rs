#[macro_use] extern crate actix_web;
#[macro_use] extern crate serde_derive;

extern crate actix_files;
extern crate arpabet;
extern crate hound;
extern crate serde;
extern crate tch;

pub mod model;
pub mod text;

use model::TacoMelModel;

use std::env;
use std::sync::Arc;

use arpabet::Arpabet;

use actix_cors::Cors;
use actix_files::Files;
use actix_web::http::{header, Method, StatusCode};
use actix_web::middleware::Logger;
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
use crate::text::text_to_arpabet_encoding;

#[get("/")]
async fn get_root(request: HttpRequest) -> std::io::Result<HttpResponse> {
  println!("GET /");
  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("text/html; charset=utf-8")
      .body("Hello World"))
}

#[get("/readiness")]
async fn get_readiness(request: HttpRequest) -> std::io::Result<HttpResponse> {
  println!("GET /readiness");
  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("text/html; charset=utf-8")
      .body("Ready"))
}

#[get("/liveness")]
async fn get_liveness(request: HttpRequest) -> std::io::Result<HttpResponse> {
  println!("GET /liveness");
  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("text/html; charset=utf-8")
      .body("Live"))
}

/// For JSON payloads
#[derive(Deserialize)]
pub struct TtsRequest {
  text: String,
  speaker: String,
}

/// For query strings
#[derive(Deserialize)]
pub struct TtsQueryRequest {
  text: String,
}

//#[get("/tts")]
async fn get_tts(request: HttpRequest,
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
}

//#[post("/tts")]
async fn post_tts(request: HttpRequest,
  query: web::Json<TtsRequest>,
  //arpabet: web::Data<Arc<Arpabet>>,
  model: web::Data<Arc<TacoMelModel>>)
  -> std::io::Result<HttpResponse> {
  println!("POST /tts");
  let text = query.text.to_string();

  println!("Text: {}", text);

  let arpabet = Arpabet::load_cmudict();
  let encoded = text_to_arpabet_encoding(arpabet, &text);

  println!("Encoded: {:?}", encoded);

  let wav_data = model.run_tts_encoded(&encoded);

  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("audio/wav")
      .body(wav_data))
}

const TACOTRON_MODEL : &'static str = "TACOTRON_MODEL";
const MELGAN_MODEL : &'static str = "MELGAN_MODEL";
const BIND_ADDRESS : &'static str = "BIND_ADDRESS";
const ASSET_DIRECTORY : &'static str = "ASSET_DIRECTORY";

pub struct AppState {
  pub arpabet: Arpabet,
  pub model: TacoMelModel,
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
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

  let ttsEngine = TacoMelModel::create(&tacotron_filename, &melgan_filename);

  let arc = web::Data::new(Arc::new(ttsEngine));
  //let arc2 = web::Data::new(Arc::new(arpabet));

  println!("Starting HTTP service.");
  println!("Asset directory: {}", asset_directory);
  println!("Listening on: {}", bind_address);

  HttpServer::new(move || App::new()
      .wrap(Logger::default())
      .service(Files::new("/frontend", asset_directory.clone()).show_files_listing())
      .service(
        web::resource("/tts")
            .route(web::get().to(get_tts))
            .route(web::post().to(post_tts))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(get_root)
      .service(get_readiness)
      .service(get_liveness)
      .app_data(arc.clone())
      //.app_data(arc2.clone())
    )
    .bind(bind_address)?
    .run()
    .await
}

