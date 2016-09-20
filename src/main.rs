// Copyright (c) 2015-2016 Brandon Thomas <bt@brand.io>

extern crate clap;
extern crate crypto;
extern crate hound;
extern crate iron;
#[macro_use]
extern crate log;
extern crate regex;
extern crate resolve;
extern crate router;
extern crate rustc_serialize;
extern crate time;
extern crate toml;
extern crate urlencoded;

pub mod arpabet;
pub mod audiobank;
pub mod config;
pub mod dictionary;
pub mod effects;
pub mod error;
pub mod handlers;
pub mod logger;
pub mod synthesizer;
pub mod words;

use arpabet::ArpabetDictionary;
use audiobank::Audiobank;
use clap::{App, Arg, ArgMatches};
use config::Config;
use dictionary::VocabularyLibrary;
use handlers::audio_synth_handler::AudioSynthHandler;
use handlers::error_filter::ErrorFilter;
use handlers::file_server_handler::FileServerHandler;
use handlers::vocab_list_handler::VocabListHandler;
use iron::prelude::*;
use logger::SimpleLogger;
use resolve::hostname;
use router::Router;
use std::path::Path;
use std::sync::Arc;
use std::sync::RwLock;
use synthesizer::Synthesizer;

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

  let config = Config::read("./config.toml").unwrap();

  VocabularyLibrary::read_from_directory(
      Path::new(&config.get_sound_path()));

  get_hostname();

  let synthesizer = create_synthesizer(&config);

  start_server(&config, port, synthesizer);
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

fn start_server(config: &Config, port: u16, synthesizer: Synthesizer) {
  let audio_path = &config.get_sound_path();
  let file_path = "./web";
  let index = "index.html";

  let async_synth = Arc::new(RwLock::new(synthesizer));

  // TODO: Cross-cutting filter installation
  let mut router = Router::new();
  let mut chain = Chain::new(AudioSynthHandler::new(async_synth.clone(),
                                                    config.clone(),
                                                    audio_path));
  chain.link_after(ErrorFilter);
  router.get("/speak", chain);
  router.get("/words", VocabListHandler::new(audio_path));

  // TODO: Share the handler.
  router.get("/", FileServerHandler::new(file_path, index));
  router.get("/test", FileServerHandler::new(file_path, index));
  router.get("/assets/:filename", FileServerHandler::new(file_path, index));
  router.get("/assets/*", FileServerHandler::new(file_path, index));

  info!("Starting server on port {}...", port);
  Iron::new(router).http(("0.0.0.0", port)).unwrap();
}

fn get_hostname() {
  match hostname::get_hostname() {
    Ok(s) => { info!("Hostname: {}", s); },
    Err(_) => {},
  };
}

fn create_synthesizer(config: &Config) -> Synthesizer {
  info!("Reading Arpabet Dictionary...");
  let arpabet_dictionary = ArpabetDictionary::load_from_file(
      &config.phoneme_dictionary_file_development).unwrap();

  info!("Reading Extra Dictionary...");
  let extra_dictionary = ArpabetDictionary::load_from_file(
      &config.extra_dictionary_file_development).unwrap();

  info!("Reading Square Dictionary...");
  let square_dictionary = ArpabetDictionary::load_from_file(
      &config.square_dictionary_file_development).unwrap();

  let dictionary = arpabet_dictionary
      .combine(&extra_dictionary)
      .combine(&square_dictionary);

  let audiobank = Audiobank::new(&config.get_sound_path());

  info!("Building Synthesizer...");
  Synthesizer::new(dictionary, audiobank)
}

