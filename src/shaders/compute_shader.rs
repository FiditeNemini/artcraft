use std::ffi::CString;
use std::ptr;
use std::str;

use gl;
use gl::types::*;

/// This is taken from Microsoft's MIT-licensed k4a libraries.
/// From the file `tools/k4aviewer/graphics/shaders/gpudepthtopointcloudconverter.cpp`
pub static COMPUTE_SHADER_SRC: &'static str = "\
#version 430

layout(location=0, rgba32f) writeonly uniform image2D destTex;

layout(location=1, r16ui) readonly uniform uimage2D depthImage;
layout(location=2, rg32f) readonly uniform image2D xyTable;

layout(local_size_x = 1, local_size_y = 1) in;

void main()
{
    ivec2 pixel = ivec2(gl_GlobalInvocationID.xy);

    float vertexValue = float(imageLoad(depthImage, pixel));
    vec2 xyValue = imageLoad(xyTable, pixel).xy;

    float alpha = 1.0f;
    vec3 vertexPosition = vec3(vertexValue * xyValue.x, vertexValue * xyValue.y, vertexValue);

    // Invalid pixels have their XY table values set to 0.
    // Set the rest of their values to 0 so clients can pick them out.
    //
    if (xyValue.x == 0.0f && xyValue.y == 0.0f)
    {
        alpha = 0.0f;
        vertexValue = 0.0f;
    }

    // Vertex positions are in millimeters, but everything else is in meters, so we need to convert
    //
    vertexPosition /= 1000.0f;

    // OpenGL and K4A have different conventions on which direction is positive -
    // we need to flip the X coordinate.
    //
    vertexPosition.x *= -1;

    imageStore(destTex, pixel, vec4(vertexPosition, alpha));
}
";

pub struct ComputeShader {
  program_id: GLuint,
  shader_id: GLuint,
}

impl ComputeShader {

  pub fn create() -> Self {
    let program = unsafe { gl::CreateProgram() };
    let shader = compile_shader(COMPUTE_SHADER_SRC, gl::COMPUTE_SHADER);

    link_program(program, shader);

    ComputeShader {
      shader_id: shader,
      program_id: program,
    }
  }
}

pub fn compile_shader(src: &str, ty: GLenum) -> GLuint {
  let shader;
  unsafe {
    shader = gl::CreateShader(ty);
    // Attempt to compile the shader
    let c_str = CString::new(src.as_bytes()).unwrap();
    gl::ShaderSource(shader, 1, &c_str.as_ptr(), ptr::null());
    gl::CompileShader(shader);

    // Get the compile status
    let mut status = gl::FALSE as GLint;
    gl::GetShaderiv(shader, gl::COMPILE_STATUS, &mut status);

    // Fail on error
    if status != (gl::TRUE as GLint) {
      let mut len = 0;
      gl::GetShaderiv(shader, gl::INFO_LOG_LENGTH, &mut len);
      let mut buf = Vec::with_capacity(len as usize);
      buf.set_len((len as usize) - 1); // subtract 1 to skip the trailing null character
      gl::GetShaderInfoLog(
        shader,
        len,
        ptr::null_mut(),
        buf.as_mut_ptr() as *mut GLchar,
      );
      panic!(
        "{}",
        str::from_utf8(&buf)
            .ok()
            .expect("ShaderInfoLog not valid utf8")
      );
    }
  }
  shader
}

fn link_program(program: GLuint, shader: GLuint) -> GLuint {
  unsafe {
    gl::AttachShader(program, shader);
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
