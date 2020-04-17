//! These wrappers make it easier to use certain OpenGL types.
//! This draws inspiration from some of the code in Microsoft's MIT-licensed libk4a,
//! particularly the code in `openglhelpers.h`.

use gl;
use gl::types::*;

/// A slightly more convenient OpenGL Buffer type
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

/// A slightly more convenient OpenGL Texture type
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

