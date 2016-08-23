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
pub mod atom;
pub mod error;
pub mod config;
pub mod dictionary;
pub mod handlers;
pub mod logger;
pub mod words;

use arpabet::ArpabetDictionary;
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
use std::path::{Path, PathBuf};

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
      Path::new(&config.sound_path_development));

  get_hostname();

  read_arpabet();

  start_server(&config, port);
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

fn start_server(config: &Config, port: u16) {
  let audio_path = &config.sound_path_development;
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
  router.get("/test", FileServerHandler::new(file_path, index));
  router.get("/assets/:filename", FileServerHandler::new(file_path, index));
  router.get("/assets/*", FileServerHandler::new(file_path, index));

  info!("Starting server on port {}...", port);
  Iron::new(router).http(("0.0.0.0", port)).unwrap();
}

fn get_hostname() {
  match hostname::get_hostname() {
    Ok(s) => { println!("Hostname: {}", s); },
    Err(_) => {},
  };

  /*let len = 34u;
  let mut buf = std::vec::from_elem(len, 0u8);

  let err = unsafe {gethostname (vec::raw::to_mut_ptr(buf) as *mut i8, len as u64)};
  if err != 0 { println("oops, gethostname failed"); return; }*/
}

fn read_arpabet() {
  // TODO: Configurable path.
  let dict = ArpabetDictionary::load_from_file("./dictionary/cmudict-0.7b").unwrap();

  let result = dict.get("nintendo");

  println!("Result: {:?}", result);
}

