// Copyright (c) 2015 Brandon Thomas <bt@brand.io>

use iron::AfterMiddleware;
use iron::prelude::*;
use iron::status::Status;

use std::error::Error;
use std::fmt::{self, Debug};

/// Error-handling filter.
pub struct ErrorFilter;

/// An error type compatible with IronError.
#[derive(Debug)]
pub struct StringError(pub String);

pub fn build_error(status: Status, message: &str) -> IronResult<Response> {
  Err(IronError::new(StringError(message.to_string()), status))
}

impl AfterMiddleware for ErrorFilter {
  fn catch(&self, _: &mut Request, err: IronError) -> IronResult<Response> {
    error!(target: "handler", "Error has occurred! Error: {}", err.error);

    // TODO: Return JSON if request was JSON, otherwise HTML.
    match err.response.status {
      Some(status) => {
        Ok(Response::with((status, err.error.description())))
      },
      _ => Err(err)
    }
  }
}

impl fmt::Display for StringError {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    Debug::fmt(self, f)
  }
}

impl Error for StringError {
  fn description(&self) -> &str {
    &*self.0
  }
}

