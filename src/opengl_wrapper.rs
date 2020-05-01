//! These wrappers make it easier to use certain OpenGL types.
//! This draws inspiration from some of the code in Microsoft's MIT-licensed libk4a,
//! particularly the code in `openglhelpers.h`.

use std::fmt::{Error, Formatter};
use gl;
use gl::types::*;
use std::ptr::null;

/// A slightly more convenient OpenGL Buffer type
#[derive(Clone, Debug)]
pub struct Buffer {
  id: GLuint,
}

impl Buffer {
  pub fn new() -> Self {
    return Self {
      id: 0,
    }
  }

  pub fn new_initialized() -> Self {
    let mut new_object= Self::new();
    new_object.init();
    new_object
  }

  pub fn is_initialized(&self) -> bool {
    self.id != 0
  }

  pub fn id(&self) -> GLuint {
    self.id
  }

  pub fn init(&mut self) {
    self.reset();
    self.gen();
  }

  pub fn reset(&mut self) {
    if self.is_initialized() {
      self.delete();
      self.id = 0;
    }
  }

  pub fn gen(&mut self) {
    unsafe {
      gl::GenBuffers(1, &mut self.id);
    }
  }

  pub fn delete(&mut self) {
    unsafe {
      gl::DeleteBuffers(1, &mut self.id);
    }
  }
}

/// A slightly more convenient OpenGL Framebuffer type
#[derive(Clone, Debug)]
pub struct Framebuffer {
  id: GLuint,
}

impl Framebuffer {
  pub fn new() -> Self {
    return Self {
      id: 0,
    }
  }

  pub fn new_initialized() -> Self {
    let mut new_object= Self::new();
    new_object.init();
    new_object
  }

  pub fn is_initialized(&self) -> bool {
    self.id != 0
  }

  pub fn id(&self) -> GLuint {
    self.id
  }

  pub fn init(&mut self) {
    self.reset();
    self.gen();
  }

  pub fn reset(&mut self) {
    if self.is_initialized() {
      self.delete();
      self.id = 0;
    }
  }

  pub fn gen(&mut self) {
    unsafe {
      gl::GenFramebuffers(1, &mut self.id);
    }
  }

  pub fn delete(&mut self) {
    unsafe {
      gl::DeleteFramebuffers(1, &mut self.id);
    }
  }
}

/// A slightly more convenient OpenGL Renderbuffer type
#[derive(Clone, Debug)]
pub struct Renderbuffer {
  id: GLuint,
}

impl Renderbuffer {
  pub fn new() -> Self {
    return Self {
      id: 0,
    }
  }

  pub fn new_initialized() -> Self {
    let mut new_object= Self::new();
    new_object.init();
    new_object
  }

  pub fn is_initialized(&self) -> bool {
    self.id != 0
  }

  pub fn id(&self) -> GLuint {
    self.id
  }

  pub fn init(&mut self) {
    self.reset();
    self.gen();
  }

  pub fn reset(&mut self) {
    if self.is_initialized() {
      self.delete();
      self.id = 0;
    }
  }

  fn gen(&mut self) {
    unsafe {
      gl::GenRenderbuffers(1, &mut self.id);
    }
  }

  fn delete(&mut self) {
    unsafe {
      gl::DeleteRenderbuffers(1, &mut self.id);
    }
  }
}

/// A slightly more convenient OpenGL Texture type
#[derive(Clone, Debug)]
pub struct Texture {
  id: GLuint,
}

impl Texture {
  pub fn new() -> Self {
    return Self {
      id: 0,
    }
  }

  pub fn new_initialized() -> Self {
    let mut new_object= Self::new();
    new_object.init();
    new_object
  }

  pub fn is_initialized(&self) -> bool {
    self.id != 0
  }

  pub fn id(&self) -> GLuint {
    self.id
  }

  pub fn init(&mut self) {
    self.reset();
    self.gen();
  }

  pub fn reset(&mut self) {
    if self.is_initialized() {
      self.delete();
      self.id = 0;
    }
  }

  fn gen(&mut self) {
    unsafe {
      gl::GenTextures(1, &mut self.id);
    }
  }

  fn delete(&mut self) {
    unsafe {
      gl::DeleteTextures(1, &mut self.id);
    }
  }
}

/// A slightly more convenient OpenGL VertexArray type
#[derive(Clone, Debug)]
pub struct VertexArray {
  id: GLuint,
}

impl VertexArray {
  pub fn new() -> Self {
    return Self {
      id: 0,
    }
  }

  pub fn new_initialized() -> Self {
    let mut new_object= Self::new();
    new_object.init();
    new_object
  }

  pub fn is_initialized(&self) -> bool {
    self.id != 0
  }

  pub fn id(&self) -> GLuint {
    self.id
  }

  pub fn init(&mut self) {
    self.reset();
    self.gen();
  }

  pub fn reset(&mut self) {
    if self.is_initialized() {
      self.delete();
      self.id = 0;
    }
  }

  fn gen(&mut self) {
    unsafe {
      gl::GenVertexArrays(1, &mut self.id);
    }
  }

  fn delete(&mut self) {
    unsafe {
      gl::DeleteVertexArrays(1, &mut self.id);
    }
  }
}

/// Represents the OpenGL errors returned by `glGetError()`.
/// https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/glGetError.xhtml
/// When an error flag is set, results of a GL operation are undefined only if GL_OUT_OF_MEMORY
/// has occurred. In all other cases, the command generating the error is ignored and has no effect
/// on the GL state or frame buffer contents. If the generating command returns a value, it
/// returns 0. If glGetError itself generates an error, it returns 0.
#[derive(Copy,Clone,Debug)]
pub enum OpenGlError {
  /// No error has been recorded. The value of this symbolic constant is guaranteed to be 0.
  /// NB: While GL_NO_ERROR is represented here, it won't be returned by the convenience function.
  NoError,
  /// An unacceptable value is specified for an enumerated argument. The offending command is
  /// ignored and has no other side effect than to set the error flag.
  InvalidEnum,
  /// A numeric argument is out of range. The offending command is ignored and has no other side
  /// effect than to set the error flag.
  InvalidValue,
  /// The specified operation is not allowed in the current state. The offending command is
  /// ignored and has no other side effect than to set the error flag.
  InvalidOperation,
  /// The framebuffer object is not complete. The offending command is ignored and has no other
  /// side effect than to set the error flag.
  InvalidFramebufferOperation,
  /// There is not enough memory left to execute the command. The state of the GL is undefined,
  /// except for the state of the error flags, after this error is recorded.
  OutOfMemory,
  /// An attempt has been made to perform an operation that would cause an internal stack to
  /// underflow.
  StackUnderflow,
  /// An attempt has been made to perform an operation that would cause an internal stack to
  /// overflow.
  StackOverflow,
  /// Invented error if we can't determine which enum was returned.
  UnknownError(u32),
}

impl std::fmt::Display for OpenGlError {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    let explain = match self {
      OpenGlError::NoError => "OpenGL error: No Error (this shouldn't ever be set)".into(),
      OpenGlError::InvalidEnum => "OpenGL error: Invalid Enum".into(),
      OpenGlError::InvalidValue => "OpenGL error: Invalid Value".into(),
      OpenGlError::InvalidOperation => "OpenGL error: Invalid Operation".into(),
      OpenGlError::InvalidFramebufferOperation => "OpenGL error: Invalid Framebuffer Operation".into(),
      OpenGlError::OutOfMemory => "OpenGL error: Out of Memory".into(),
      OpenGlError::StackUnderflow => "OpenGL error: Stack Underflow".into(),
      OpenGlError::StackOverflow => "OpenGL error: Stack Overflow".into(),
      OpenGlError::UnknownError(result) => format!("OpenGL error: Unknown Error {}", result),
    };
    write!(f, "{}", explain)
  }
}

impl std::error::Error for OpenGlError {
  fn source(&self) -> Option<&(dyn std::error::Error +'static)> {
    // Generic error, no backtrace.
    None
  }
}

/// Query OpenGL for the current error.
pub fn gl_get_error() -> Result<(), OpenGlError> {
  let result = unsafe {
    gl::GetError()
  };
  match result {
    gl::NO_ERROR => Ok(()),
    gl::INVALID_ENUM => Err(OpenGlError::InvalidEnum),
    gl::INVALID_VALUE => Err(OpenGlError::InvalidValue),
    gl::INVALID_OPERATION => Err(OpenGlError::InvalidOperation),
    gl::INVALID_FRAMEBUFFER_OPERATION => Err(OpenGlError::InvalidFramebufferOperation),
    gl::OUT_OF_MEMORY => Err(OpenGlError::OutOfMemory),
    gl::STACK_UNDERFLOW => Err(OpenGlError::StackUnderflow),
    gl::STACK_OVERFLOW => Err(OpenGlError::StackOverflow),
    _ => Err(OpenGlError::UnknownError(result)),
  }
}

/// Calculate the stride width for OpenGL
/// Useful for `gl::VertexAttribPointer`.
pub fn get_stride<T>(size: usize) -> gl::types::GLint {
  (size * std::mem::size_of::<T>()) as gl::types::GLint
}

/// Calculate the offset for OpenGL
/// Useful for `gl::VertexAttribPointer`.
pub fn get_pointer_offset<T>(offset: usize) -> *const gl::types::GLvoid {
  match offset {
    0 => null(),
    _ => (offset * std::mem::size_of::<T>()) as *const gl::types::GLvoid,
  }
}
