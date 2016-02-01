// Copyright (c) 2015 Brandon Thomas <bt@brand.io>

use iron::Handler;
use iron::mime::Mime;
use iron::prelude::*;
use iron::status;
use router::Router;
use rustc_serialize::json;

use std::fs::File;
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};

#[derive(RustcDecodable, RustcEncodable)]
struct WordsResponse {
  pub words: Vec<String>
}

/// Returns a list of the available vocabulary.
pub struct VocabListHandler {
  /// Root of where files can be served from.
  /// A PathBuf since `Path` can only be created as a borrow.
  directory: PathBuf,
}

impl Handler for VocabListHandler {
  fn handle(&self, req: &mut Request) -> IronResult<Response> {
    let words = self.list_files();
    let response = json::encode(& WordsResponse { words: words }).unwrap();
    let mime_type = "application/json".parse::<Mime>().unwrap();
    Ok(Response::with((mime_type, status::Ok, response)))
  }
}

impl VocabListHandler {
  pub fn new(directory: &str) -> VocabListHandler {
    VocabListHandler { directory: Path::new(directory).to_path_buf() }
  }

  // TODO: Return errors.
  /// Return a list of words from the audio files in the directory.
  fn list_files(&self) -> Vec<String> {
    let mut words = Vec::new();

    let paths = match fs::read_dir(self.directory.as_path()) {
      Err(_) => { return words; },
      Ok(r) => r,
    };

    for path in paths {
      match path {
        Err(_) => { continue; },
        Ok(r) => {
          match r.file_name().into_string() {
            Err(_) => { continue; },
            Ok(s) => {
              let word = s.replace(".wav", "");
              if (word.starts_with("_")) { continue; }
              if (word.ends_with("_")) { continue; }
              words.push(word);
            }
          }
        },
      }
    }

    words.sort();
    words
  }
}

