use anyhow::Result as AnyhowResult;
use gl::types::*;
use std::os::raw::c_char;

/// A typesafe handle on uniform IDs with convenience methods.
#[derive(Clone, Debug, Copy)]
pub struct Uniform {
  id: GLint,
}

impl Uniform {
  pub fn lookup(opengl_program_id: GLuint, identifier: *const c_char) -> AnyhowResult<Self> {
    let mut loc = -1;

    unsafe {
      loc = gl::GetUniformLocation(opengl_program_id, identifier);
    }

    Ok(Self {
      id: loc,
    })
  }

  pub fn id(&self) -> GLint {
    self.id
  }
}
