// Copyright (c) 2015 Brandon Thomas <bt@brand.io>

extern crate crypto;
extern crate hound;
extern crate iron;
#[macro_use]
extern crate log;
extern crate router;
extern crate rustc_serialize;
extern crate time;
extern crate urlencoded;

pub mod handlers;
pub mod logger;
pub mod words;

use iron::prelude::*;
use router::Router;

use handlers::audio_synth_handler::AudioSynthHandler;
use handlers::error_filter::ErrorFilter;
use handlers::file_server_handler::FileServerHandler;
use handlers::vocab_list_handler::VocabListHandler;
use logger::SimpleLogger;

fn main() {
  SimpleLogger::init().unwrap();
  start_server();
}

fn start_server() {
  let audio_path = "./sounds/trump";
  let file_path = "./web";
  let index = "index.html";

  // TODO: Cross-cutting filter installation
  let mut router = Router::new();
  let mut chain = Chain::new(AudioSynthHandler::new(audio_path));
  chain.link_after(ErrorFilter);
  router.get("/speak", chain);
  router.get("/words", VocabListHandler::new(audio_path));

  // TODO: Share the handler.
  router.get("/", FileServerHandler::new(file_path, index));
  router.get("/assets/:filename", FileServerHandler::new(file_path, index));

  info!("Starting server...");
  Iron::new(router).http("0.0.0.0:9000").unwrap();
}

