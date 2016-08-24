// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use hound::Error as HoundError;
use std::convert::From;
use std::error;
use std::fmt;
use std::io;

/** The common error type used throughout the synthesizer. */
#[derive(Debug)]
pub enum SynthError {
  /// Bad user input.
  BadInput { description: &'static str },

  /// The file was empty or did not have parsable contents.
  EmptyFile,

  /// Wraps an IoError.
  IoError { cause: io::Error },

  /// Wraps a Hound audio library error.
  AudioError { cause: HoundError },
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
