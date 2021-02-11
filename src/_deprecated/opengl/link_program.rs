use gl::types::*;
use std::ptr;
use std::str;

pub fn link_shader_program(program: GLuint, vertex_shader: GLuint, fragment_shader: GLuint) -> GLuint {
  unsafe {
    gl::AttachShader(program, vertex_shader);
    gl::AttachShader(program, fragment_shader);
    gl::LinkProgram(program);
    // Get the link status
    let mut status = gl::FALSE as GLint;
    gl::GetProgramiv(program, gl::LINK_STATUS, &mut status);

    // Fail on error
    if status != (gl::TRUE as GLint) {
      let mut len: GLint = 0;
      gl::GetProgramiv(program, gl::INFO_LOG_LENGTH, &mut len);
      let mut buf = Vec::with_capacity(len as usize);
      buf.set_len((len as usize) - 1); // subtract 1 to skip the trailing null character
      gl::GetProgramInfoLog(
        program,
        len,
        ptr::null_mut(),
        buf.as_mut_ptr() as *mut GLchar,
      );
      panic!(
        "{}",
        str::from_utf8(&buf)
            .ok()
            .expect("ProgramInfoLog not valid utf8")
      );
    }
    program
  }
}
