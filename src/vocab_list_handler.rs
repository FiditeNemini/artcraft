// Copyright (c) 2015 Brandon Thomas <bt@brand.io>

use iron::Handler;
use iron::mime::Mime;
use iron::prelude::*;
use iron::status;
use router::Router;

use std::fs::File;
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};

/// Returns a list of the available vocabulary.
pub struct VocabListHandler {
  /// Root of where files can be served from.
  /// A PathBuf since `Path` can only be created as a borrow.
  directory: PathBuf,
}

impl Handler for VocabListHandler {
  fn handle(&self, req: &mut Request) -> IronResult<Response> {
    /*let not_found = Ok(Response::with((status::NotFound, "File not found.")));

    let filename = req.extensions.get::<Router>().unwrap()
        .find("filename").unwrap_or("");

    let mime = match filename {
      s if s.ends_with(".html") => { "text/html" },
      s if s.ends_with(".js")   => { "application/javascript" },
      _ => { "text/plain" },
    };

    match self.open_file(filename) {
      None => { not_found },
      Some(contents) => {
        let content_type = mime.parse::<Mime>().unwrap();
        Ok(Response::with((content_type, status::Ok, contents)))
      },
    }*/

    //let not_found = Ok(Response::with((status::NotFound, "File not found.")));

    self.list_files();

    Ok(Response::with(status::BadRequest))
  }
}

impl VocabListHandler {
  pub fn new(directory: &str) -> VocabListHandler {
    VocabListHandler { directory: Path::new(directory).to_path_buf() }
  }

  fn list_files(&self) {
    println!("listing files...");
    let paths = match fs::read_dir(self.directory.as_path()) {
      Err(_) => { return; },
      Ok(r) => r,
    };

    for path in paths {
      match path {
        Err(_) => { continue; },
        Ok(r) => {
          println!("Path: {:?}", r.file_name());
        },
      }
    }
  }
}
