#[macro_use] extern crate actix_web;
#[macro_use] extern crate serde_derive;

extern crate hound;
extern crate serde;
extern crate tch;

pub mod model;

use model::TacoMelModel;

use std::env;
use std::sync::Arc;

use actix_web::http::{header, Method, StatusCode};
use actix_web::{
  App,
  HttpRequest,
  HttpResponse,
  HttpServer,
  Responder,
  get,
  web,
};

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

#[derive(Deserialize)]
pub struct TtsRequest {
  text: String,
}

#[get("/tts")]
async fn get_tts(request: HttpRequest,
  query: web::Query<TtsRequest>,
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

const TACOTRON_MODEL : &'static str = "TACOTRON_MODEL";
const MELGAN_MODEL : &'static str = "MELGAN_MODEL";
const BIND_ADDRESS : &'static str = "BIND_ADDRESS";

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
  println!("Starting service.");

  let bind_address = env::var(BIND_ADDRESS)
      .expect(&format!("Must include {} env var, eg `0.0.0.0:8000`", BIND_ADDRESS));

  let tacotron_filename = env::var(TACOTRON_MODEL)
      .expect(&format!("Must include {} env var", TACOTRON_MODEL));

  let melgan_filename = env::var(MELGAN_MODEL)
      .expect(&format!("Must include {} env var", MELGAN_MODEL));

  println!("Loading models...");

  let ttsEngine = TacoMelModel::create(&tacotron_filename, &melgan_filename);

  let arc = web::Data::new(Arc::new(ttsEngine));

  println!("Starting HTTP service.");
  println!("Listening on: {}", bind_address);

  HttpServer::new(move || App::new()
      .service(get_root)
      .service(get_readiness)
      .service(get_liveness)
      .service(get_tts)
      .app_data(arc.clone())
    )
    .bind(bind_address)?
    .run()
    .await
}

