use anyhow::Result as AnyhowResult;
use anyhow::bail;
use gl::types::*;
use std::os::raw::c_char;
use std::ffi::CString;

/// A typesafe handle on attribute IDs with convenience methods.
#[derive(Clone, Debug, Copy)]
pub struct Attribute {
  id: GLint,
}

impl Attribute {
  pub fn lookup(identifier: &str, opengl_program_id: GLuint) -> AnyhowResult<Self> {
    let id_cstr : CString = CString::new(identifier)?;
    let id_cstr_ptr : *const c_char = id_cstr.as_ptr() as *const c_char;

    let mut loc = -1;
    unsafe {
      loc = gl::GetAttribLocation(opengl_program_id, id_cstr_ptr);
    }

    if loc < 0 {
      bail!("Couldn't find attribute named '{}' in OpenGL program {}.", identifier, opengl_program_id);
    }

    Ok(Self {
      id: loc,
    })
  }

  pub fn id(&self) -> GLint {
    self.id
  }
}
