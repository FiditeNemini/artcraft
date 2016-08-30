// Copyright (c) 2015 Brandon Thomas <bt@brand.io>

use dictionary::VocabularyLibrary;
use iron::Handler;
use iron::mime::Mime;
use iron::prelude::*;
use iron::status;
use rustc_serialize::json;
use std::path::Path;
use std::path::PathBuf;

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
  fn handle(&self, _req: &mut Request) -> IronResult<Response> {
    // FIXME: This is inefficient to re-read on every request.
    match VocabularyLibrary::read_from_directory(
        self.directory.as_path()) {
      Err(_) => {
        Ok(Response::with((status::InternalServerError, "{\"error\": true}")))
      },
      Ok(library) => {
        let response = json::encode(&library).unwrap();
        let mime_type = "application/json".parse::<Mime>().unwrap();
        Ok(Response::with((mime_type, status::Ok, response)))
      }
    }
  }
}

impl VocabListHandler {
  pub fn new(directory: &str) -> VocabListHandler {
    VocabListHandler { directory: Path::new(directory).to_path_buf() }
  }
}

