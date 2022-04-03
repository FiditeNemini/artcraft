// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use hound::Error as HoundError;
use std::convert::From;
use std::error::Error;
use std::fmt;
use std::io;

/// Error in synthesizing audio.
#[derive(Debug)]
pub enum SynthesisError {
  ArpabetEntryDne,

  /// Bad user input.
  BadInput { description: &'static str },

  /// Cannot load an expected audio file, eg. "blank.wav".
  CannotLoadAudioFile,

  CannotSynthesizeWord,

  /// Wraps a Hound audio library error.
  HoundError { cause: HoundError },

  /// Wraps an IoError.
  IoError { cause: io::Error },

  /// Could not obtain a lock.
  LockError,

  MonophoneDne,
  SyllableBreakdownFailure,
  WordSampleDne,
}

impl Error for SynthesisError {
  fn description(&self) -> &str {
    "Synthesis Error" // TODO
  }

  /*fn cause(&self) -> Option<&Error> {
    Some(&self)
  }*/
}

impl fmt::Display for SynthesisError {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "Synthesis Error")
  }
}

impl From<io::Error> for SynthesisError {
  fn from(error: io::Error) -> SynthesisError {
    SynthesisError::IoError { cause: error }
  }
}

impl From<HoundError> for SynthesisError {
  fn from(error: HoundError) -> SynthesisError {
    SynthesisError::HoundError { cause: error }
  }
}
