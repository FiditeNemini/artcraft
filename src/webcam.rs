use std::{fmt, io};
use std::ffi::c_void;
use std::fmt::Formatter;
use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::Path;

use gl;
use gl::types::*;

use opengl::wrapper::other_misc_wrapper::{gl_get_error, OpenGlError};

/// WebcamWriter uses Webcamoid's akvcam kernel driver to stream output to a /dev/video*
/// file. Their wiki contains all of the setup instructions, and I'm checked in some example
/// configs into this repo.
///
/// https://github.com/webcamoid/akvcam
pub struct WebcamWriter {
  /// Internal byte buffer to pull from OpenGL texture and flush to file.
  buffer: Vec<u8>,
  buffer_size: usize,
  /// File to flush raw RGB24 bytes to.
  file: File,
}

impl WebcamWriter {

  /// Create a WebcamWriter that outputs to the supplied file.
  /// The file handle is created and owned by WebcamWriter.
  pub fn open_file(filename: &str, width: usize, height: usize, bit_depth: usize)
    -> Result<Self, io::Error>
  {
    let path = Path::new(filename);
    let file = OpenOptions::new()
        .read(true)
        .truncate(true)
        .write(true)
        .open(path)?;

    let buffer_size = width * height * bit_depth;

    let mut buffer = Vec::with_capacity(buffer_size);
    buffer.resize(buffer_size, 0);

    Ok(Self {
      buffer,
      buffer_size,
      file,
    })
  }

  // TODO: Make it easy to update for new textures of different sizes (dynamic buffer resize)
  /// Grab the current texture held by `texture_id` and immediately write it to file.
  pub fn write_current_frame_to_file(&mut self, texture_id: GLuint) -> Result<(), WebcamError> {
    let typed_buffer = self.buffer.as_mut_ptr() as *mut c_void;

    unsafe {
      gl::BindTexture(gl::TEXTURE_2D, texture_id);
      gl::GetnTexImage(gl::TEXTURE_2D, 0, gl::RGB, gl::UNSIGNED_BYTE, self.buffer_size as i32, typed_buffer);

      gl_get_error()?;

      gl::BindTexture(gl::TEXTURE_2D, 0);
    }

    self.file.write_all(&self.buffer)?;
    self.file.flush()?;

    Ok(())
  }
}

/// Errors from this module.
#[derive(Debug)]
pub enum WebcamError {
  IoError(io::Error),
  OpenGlError(OpenGlError),
}

impl fmt::Display for WebcamError {
  fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
    let explain = match self {
      WebcamError::IoError(e) => format!("IoError: {:?}", e),
      WebcamError::OpenGlError(e) => format!("OpenGL error: {:?}", e),
    };
    write!(f, "{}", explain)
  }
}

impl std::error::Error for WebcamError {
  fn source(&self) -> Option<&(dyn std::error::Error +'static)> {
    None // Generic error, no backtrace.
  }
}

impl From<io::Error> for WebcamError {
  fn from(error: io::Error) -> Self {
    WebcamError::IoError(error)
  }
}

impl From<OpenGlError> for WebcamError {
  fn from(error: OpenGlError) -> Self {
    WebcamError::OpenGlError(error)
  }
}

