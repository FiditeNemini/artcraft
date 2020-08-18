//! These wrappers make it easier to use certain OpenGL types.
//! This draws inspiration from some of the code in Microsoft's MIT-licensed libk4a,
//! particularly the code in `openglhelpers.h`.

use gl::types::*;

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

  pub fn bind_as_array_buffer(&self) {
    unsafe {
      gl::BindBuffer(gl::ARRAY_BUFFER, self.id);
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

