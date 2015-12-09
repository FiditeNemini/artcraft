// Copyright (c) 2015 Brandon Thomas <bt@brand.io>

use iron::Handler;
use iron::mime::Mime;
use iron::prelude::*;
use iron::status;
use router::Router;

use std::fs::File;
use std::io::Read;
use std::path::{Path, PathBuf};

// TODO: Make this secure! Mimetypes, limit to single directory root, 
// sanitize input.
/// FileServerHandler is used to serve files. It is *NOT* secure.
pub struct FileServerHandler {
  /// Root of where files can be served from.
  /// A PathBuf since `Path` can only be created as a borrow.
  file_root: PathBuf,

  /// Default file to route to if none is found.
  index_file: String,
}

impl Handler for FileServerHandler {
  /// Handles routes of the form `/f/:fileame`
  fn handle(&self, req: &mut Request) -> IronResult<Response> {
    let not_found = Ok(Response::with((status::NotFound, "File not found.")));

    let filename = req.extensions.get::<Router>().unwrap()
        .find("filename")
        .unwrap_or(&self.index_file);

    let mime = match filename {
      s if s.ends_with(".css")   => { "text/css" },
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
    }
  }
}

impl FileServerHandler {
  pub fn new(file_root: &str, index_file: &str) -> FileServerHandler {
    FileServerHandler { 
      file_root: Path::new(file_root).to_path_buf(),
      index_file: index_file.to_string(),
    }
  }

  fn open_file(&self, request_filename: &str) -> Option<String> {
    let path = Path::new(request_filename);
    let filename = match path.file_name() {
      None => { return None; },
      Some(f) => { f },
    };

    let mut full_filename = self.file_root.clone();
    // TODO: `push` security; abspath might replace
    full_filename.push(filename); 

    // TODO: whitelist filetypes. 
    // TODO: only open non-executable files.
    println!("Opening file `{}`", full_filename.display());

    let mut file = match File::open(full_filename) {
      Err(_) => { return None },
      Ok(f) => { f },
    };

    let mut contents = String::new();

    match file.read_to_string(&mut contents) {
      Err(_) => { None },
      Ok(_) => { Some(contents) }
    }
  }
}

