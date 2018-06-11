// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use config::Config;
use iron::Handler;
use iron::error::HttpError;
use iron::error::IronError;
use iron::mime::Mime;
use iron::prelude::IronResult;
use iron::prelude::Request;
use iron::prelude::Response;
use iron::status::Status::InternalServerError;
use iron::status;
use std::fs::File;
use std::io::Error as IoError;
use std::io::Read;
use std::path::Path;

/// A handler that serves statically-defined routes to HTML files.
/// Not very flexible, but serves a purpose.
pub struct HtmlHandler {
  config: Config,
}

lazy_static! {
  static ref MIMETYPE: Mime = "text/html".parse::<Mime>().unwrap();
}

impl Handler for HtmlHandler {
  fn handle(&self, req: &mut Request) -> IronResult<Response> {
    let filename = match self.match_file(req) {
      None => { return Ok(Response::with((status::NotFound, "File not found."))); },
      Some(filename) => filename,
    };

    match self.read_file(filename) {
      Err(err) => Err(IronError::new(HttpError::Io(err), InternalServerError)),
      Ok(contents) => Ok(Response::with((MIMETYPE.clone(), status::Ok, contents))),
    }
  }
}

impl HtmlHandler {
  pub fn new(config: Config) -> HtmlHandler {
    HtmlHandler { config: config }
  }

  fn match_file(&self, request: &Request) -> Option<&'static str> {
    let path = request.url.path().join("/");
    match path.as_ref() {
      ""          => Some("index.html"),
      "demo/jon"  => Some("demo_jon.html"),
      "demo/jt"   => Some("demo_jt.html"),
      "old"       => Some("old.html"),
      _           => None,
    }
  }

  fn read_file(&self, filename: &str) -> Result<String, IoError> {
    let mut path = self.config.html_path
        .as_ref()
        .and_then(|p| Some(Path::new(&p).to_path_buf()))
        .unwrap_or_else(|| Path::new("./www").to_path_buf());

    path.push(filename);

    let mut file = File::open(&path)?;
    let mut contents = String::new();

    file.read_to_string(&mut contents)?;
    Ok(contents)
  }
}

