//! Add an OpenGL debugging callback.

use gl::types::*;
use gl;
use std::ffi::CStr;
use std::os::raw::c_void;
use std::ptr::null;

extern "system" fn glDebugOutput(
  source: GLenum,
  gltype: GLenum,
  id: GLuint,
  severity: GLenum,
  length: GLsizei,
  message: *const GLchar,
  userParam: *mut c_void)
{
  let message = unsafe { CStr::from_ptr(message) };
  //println!(">>> [GL DEBUG] id: {:?} message: {:?} source: {:?} type: {:?} severity: {:?}",
  //  id, message, source, gltype, severity);
  println!(">>> [GL DEBUG] id: {:?} message: {:?}", id, message);
}

pub fn enable_opengl_debugging() {
  unsafe {
    // Set debugging. This can be expensive, so we should be able to trigger it with a flag.
    gl::Enable(gl::DEBUG_OUTPUT);
    gl::Enable(gl::DEBUG_OUTPUT_SYNCHRONOUS);
    gl::DebugMessageCallback(Some(glDebugOutput), null());
    // Opt into everything.
    gl::DebugMessageControl(gl::DONT_CARE, gl::DONT_CARE, gl::DONT_CARE, 0, null(), gl::TRUE);
  }
}
