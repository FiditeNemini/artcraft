//! Add an OpenGL debugging callback.

use std::ffi::CStr;
use std::os::raw::c_void;
use std::ptr::null;

use gl;
use gl::types::*;

extern "system" fn glDebugOutput(
  _source: GLenum,
  _gltype: GLenum,
  id: GLuint,
  _severity: GLenum,
  _length: GLsizei,
  message: *const GLchar,
  _userParam: *mut c_void)
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
