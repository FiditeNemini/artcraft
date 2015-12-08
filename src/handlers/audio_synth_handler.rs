// Copyright (c) 2015 Brandon Thomas <bt@brand.io>

use iron::Handler;
use iron::mime::Mime;
use iron::prelude::*;
use iron::status;
use router::Router;
use rustc_serialize::json;
use urlencoded::UrlEncodedQuery;

use std::fs::File;
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};

use words::split_sentence;

const QUERY_PARAM : &'static str = "q";

/// Synthesizes audio from input.
pub struct AudioSynthHandler {
  /// Root of where files can be served from.
  /// A PathBuf since `Path` can only be created as a borrow.
  directory: PathBuf,
}

impl Handler for AudioSynthHandler {
  fn handle(&self, req: &mut Request) -> IronResult<Response> {
    let error = Ok(Response::with((status::Ok, "error")));
    
    let sentence = match req.get_ref::<UrlEncodedQuery>() {
      Err(_) => { return error; },
      Ok(ref map) => {
        match map.get(QUERY_PARAM) {
          None => { return error; },
          Some(list) => { 
            match list.get(0) {
              None => { return error; },
              Some(s) => { s },
            }
          },
        }
      },
    };

    let words = split_sentence(sentence);

    /*let words = self.list_files();
    let response = json::encode(&words).unwrap();*/
    Ok(Response::with((status::Ok, "todo")))
  }
}

impl AudioSynthHandler {
  pub fn new(directory: &str) -> AudioSynthHandler {
    AudioSynthHandler { directory: Path::new(directory).to_path_buf() }
  }

  // TODO: Return errors.
  /// Return a list of words from the audio files in the directory.
  fn list_files(&self) -> Vec<String> {
    let mut words = Vec::new();
    words
  }
}

