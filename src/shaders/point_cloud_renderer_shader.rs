//! This is a port of Microsoft's libk4a `tools/k4aviewer/window/point_cloud/4_k4apointcloudrenderer.cpp`.
//! This provides the visual output.

use std::ffi::CString;
use std::fmt::{Error, Formatter};
use std::mem::size_of;
use std::os::raw::{c_char, c_int, c_void};
use std::ptr;
use std::ptr::null;
use std::str;

use gl;
use gl::types::*;
use libc;

use opengl_wrapper::{Buffer, VertexArray};
use opengl_wrapper::Texture;
use shaders::compile_shader::compile_shader;

pub type Result<T> = std::result::Result<T, PointCloudRendererError>;

#[derive(Clone, Debug)]
pub enum PointCloudRendererError {
  UnknownError,
}

impl std::fmt::Display for PointCloudRendererError {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    write!(f, "unknown point cloud RENDERER error")
  }
}

impl std::error::Error for PointCloudRendererError {
  fn source(&self) -> Option<&(dyn std::error::Error +'static)> {
    // Generic error, no backtrace.
    None
  }
}

/// This is taken from Microsoft's MIT-licensed k4a libraries.
/// From the file `tools/k4aviewer/graphics/shaders/k4apointcloudshaders.h`
pub static POINT_CLOUD_VERTEX_SHADER : &'static str = "\
#version 430
layout(location = 0) in vec4 inColor;

out vec4 vertexColor;

uniform mat4 view;
uniform mat4 projection;
layout(rgba32f) readonly uniform image2D pointCloudTexture;
uniform bool enableShading;

bool GetPoint3d(in vec2 pointCloudSize, in ivec2 point2d, out vec3 point3d)
{
    if (point2d.x < 0 || point2d.x >= pointCloudSize.x ||
        point2d.y < 0 || point3d.y >= pointCloudSize.y)
    {
        return false;
    }

    point3d = imageLoad(pointCloudTexture, point2d).xyz;
    if (point3d.z <= 0)
    {
        return false;
    }

    return true;
}

void main()
{
    ivec2 pointCloudSize = imageSize(pointCloudTexture);
    ivec2 currentDepthPixelCoordinates = ivec2(gl_VertexID % pointCloudSize.x, gl_VertexID / pointCloudSize.x);
    vec3 vertexPosition = imageLoad(pointCloudTexture, currentDepthPixelCoordinates).xyz;

    gl_Position = projection * view * vec4(vertexPosition, 1);

    vertexColor = inColor;

    // Pass along the 'invalid pixel' flag as the alpha channel
    //
    if (vertexPosition.z == 0.0f)
    {
        vertexColor.a = 0.0f;
    }

    if (enableShading)
    {
        // Compute the location of the closest neighbor pixel to compute lighting
        //
        vec3 closestNeighbor = vertexPosition;

        // If no neighbors have data, default to 1 meter behind point.
        //
        closestNeighbor.z += 1.0f;

        vec3 outPoint;
        if (GetPoint3d(pointCloudSize, currentDepthPixelCoordinates - ivec2(1, 0), outPoint))
        {
            if (closestNeighbor.z > outPoint.z)
            {
                closestNeighbor = outPoint;
            }
        }
        if (GetPoint3d(pointCloudSize, currentDepthPixelCoordinates + ivec2(1, 0), outPoint))
        {
            if (closestNeighbor.z > outPoint.z)
            {
                closestNeighbor = outPoint;
            }
        }
        if (GetPoint3d(pointCloudSize, currentDepthPixelCoordinates - ivec2(0, 1), outPoint))
        {
            if (closestNeighbor.z > outPoint.z)
            {
                closestNeighbor = outPoint;
            }
        }
        if (GetPoint3d(pointCloudSize, currentDepthPixelCoordinates + ivec2(0, 1), outPoint))
        {
            if (closestNeighbor.z > outPoint.z)
            {
                closestNeighbor = outPoint;
            }
        }

        vec3 lightPosition = vec3(0, 0, 0);
        float occlusion = length(vertexPosition - closestNeighbor) * 20.0f;
        float diffuse = 1.0f - clamp(occlusion, 0.0f, 0.6f);

        float distance = length(lightPosition - vertexPosition);

        // Attenuation term for light source that covers distance up to 50 meters
        // http://wiki.ogre3d.org/tiki-index.php?page=-Point+Light+Attenuation
        //
        float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);

        vertexColor = vec4(attenuation * diffuse * vertexColor.rgb, vertexColor.a);
    }
}
";

/// This is taken from Microsoft's MIT-licensed k4a libraries.
/// From the file `tools/k4aviewer/graphics/shaders/k4apointcloudshaders.h`
pub static POINT_CLOUD_FRAGMENT_SHADER: &'static str = "\
#version 430

in vec4 vertexColor;
out vec4 fragmentColor;

uniform bool enableShading;

void main()
{
    if (vertexColor.a == 0.0f)
    {
        discard;
    }

    fragmentColor = vertexColor;
}
";

pub struct PointCloudRendererShader {
  /// The OpenGL program
  program_id: GLuint,

  /// The OpenGL vertex shader
  vertex_shader_id: GLuint,

  /// The OpenGL fragment shader
  fragment_shader_id: GLuint,

  // TODO: matrix for view
  // TODO: matrix for projection

  /// Renderer setting: size of the rendered points
  point_size: u8,

  /// Renderer setting: shading enabled
  enable_shading: bool,

  /// Point array size
  vertex_array_size_bytes: GLsizei,

  /// Uniform location in the shader program.
  view_index: GLint,

  /// Uniform location in the shader program.
  projection_index: GLint,

  /// Uniform location in the shader program.
  enable_shading_index: GLint,

  /// Uniform location in the shader program.
  point_cloud_texture_index: GLint,

  vertex_array_object: VertexArray,
  vertex_color_buffer_object: Buffer,
}

impl PointCloudRendererShader {

  pub fn new() -> Self {
    let vertex_array_object = VertexArray::new_initialized();
    let vertex_color_buffer_object = Buffer::new_initialized();

    // Context Settings
    unsafe {
      gl::Enable(gl::PROGRAM_POINT_SIZE);
    }

    let program_id = unsafe { gl::CreateProgram() };
    let vertex_shader_id = compile_shader(POINT_CLOUD_VERTEX_SHADER, gl::VERTEX_SHADER);
    let fragment_shader_id = compile_shader(POINT_CLOUD_FRAGMENT_SHADER, gl::FRAGMENT_SHADER);

    link_program(program_id, vertex_shader_id, fragment_shader_id);

    /// Uniform variable name in OpenGL shader program
    let VIEW : CString = CString::new("view").expect("string is correct");
    let VIEW_PTR : *const c_char = VIEW.as_ptr() as *const c_char;

    /// Uniform variable name in OpenGL shader program
    let PROJECTION : CString = CString::new("projection").expect("string is correct");
    let PROJECTION_PTR : *const c_char = PROJECTION.as_ptr() as *const c_char;

    /// Uniform variable name in OpenGL shader program
    let ENABLE_SHADING : CString = CString::new("enableShading").expect("string is correct");
    let ENABLE_SHADING_PTR : *const c_char = ENABLE_SHADING.as_ptr() as *const c_char;

    /// Uniform variable name in OpenGL shader program
    let POINT_CLOUD : CString = CString::new("pointCloudTexture").expect("string is correct");
    let POINT_CLOUD_PTR : *const c_char = POINT_CLOUD.as_ptr() as *const c_char;

    let mut view_index = 0;
    let mut projection_index = 0;
    let mut enable_shading_index = 0;
    let mut point_cloud_texture_index = 0;

    unsafe {
      view_index = gl::GetUniformLocation(program_id, VIEW_PTR);
      projection_index = gl::GetUniformLocation(program_id, PROJECTION_PTR);
      enable_shading_index = gl::GetUniformLocation(program_id, ENABLE_SHADING_PTR);
      point_cloud_texture_index = gl::GetUniformLocation(program_id, POINT_CLOUD_PTR);
    }

    Self {
      program_id,
      vertex_shader_id,
      fragment_shader_id,
      point_size: 2,
      enable_shading: true,
      vertex_array_size_bytes: 0,
      view_index,
      projection_index,
      enable_shading_index,
      point_cloud_texture_index,
      vertex_array_object,
      vertex_color_buffer_object,
    }
  }
}

// TODO: Reuse.
fn link_program(program: GLuint, vertex_shader: GLuint, fragment_shader: GLuint) -> GLuint {
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
