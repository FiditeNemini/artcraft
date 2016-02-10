// Copyright (c) 2015 Brandon Thomas <bt@brand.io>

extern crate clap;
extern crate crypto;
extern crate hound;
extern crate iron;
#[macro_use]
extern crate log;
extern crate router;
extern crate rustc_serialize;
extern crate time;
extern crate urlencoded;

pub mod dictionary;
pub mod handlers;
pub mod logger;
pub mod words;

use std::path::{Path, PathBuf};

use clap::{App, Arg, ArgMatches};
use iron::prelude::*;
use router::Router;

use handlers::audio_synth_handler::AudioSynthHandler;
use handlers::error_filter::ErrorFilter;
use handlers::file_server_handler::FileServerHandler;
use handlers::vocab_list_handler::VocabListHandler;
use logger::SimpleLogger;
use dictionary::VocabularyLibrary;

fn main() {
  SimpleLogger::init().unwrap();

  // Parse command line args.
  let matches = App::new("trumpet")
      .arg(Arg::with_name("PORT")
           .short("p")
           .long("port")
           .help("Sets the port the server listens on.")
           .takes_value(true)
           .required(false))
      .get_matches();

  let port = get_port(&matches, 9000);


  VocabularyLibrary::read_from_directory(Path::new("./sounds"));

  start_server(port);
}

fn get_port(matches: &ArgMatches, default_port: u16) -> u16 {
  match matches.value_of("PORT") {
    None => default_port,
    Some(port) => {
      match port.parse::<u16>() {
        Err(_) => default_port,
        Ok(p) => p,
      }
    },
  }
}

fn start_server(port: u16) {
  let audio_path = "./sounds";
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

  info!("Starting server on port {}...", port);
  Iron::new(router).http(("0.0.0.0", port)).unwrap();
}

