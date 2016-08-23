// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use std::error;
use std::io;
use std::fmt;
use std::convert::From;

#[derive(Debug)]
pub enum Error {
  /// The file was empty or did not have parsable contents.
  EmptyFile,

  /// Wraps an IoError.
  IoError { cause: io::Error },
}

impl From<io::Error> for Error {
  fn from(error: io::Error) -> Error {
    Error::IoError { cause: error }
  }
}

