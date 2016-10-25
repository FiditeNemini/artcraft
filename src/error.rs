// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use hound::Error as HoundError;
use std::convert::From;
use std::error::Error;
use std::fmt;
use std::io;

/** The common error type used throughout the synthesizer. */
#[derive(Debug)]
pub enum SynthError {
  /// Bad user input.
  BadInput { description: &'static str },

  /// The file was empty or did not have parsable contents.
  EmptyFile,

  /// Could not obtain the lock.
  LockError,

  /// Wraps an IoError.
  IoError { cause: io::Error },

  /// Wraps a Hound audio library error.
  AudioError { cause: HoundError },
}

impl fmt::Display for SynthError {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "Synthesis Error")
  }
}

impl Error for SynthError {
  fn description(&self) -> &str {
    "Synthesis Error" // TODO
  }

  /*fn cause(&self) -> Option<&Error> {
    Some(&self)
  }*/
}


impl From<io::Error> for SynthError {
  fn from(error: io::Error) -> SynthError {
    SynthError::IoError { cause: error }
  }
}

impl From<HoundError> for SynthError {
  fn from(error: HoundError) -> SynthError {
    SynthError::AudioError { cause: error }
  }
}
