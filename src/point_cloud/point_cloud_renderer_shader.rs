//! This is a port of Microsoft's libk4a `k4apointcloudrenderer.cpp`.
//! This provides the visual output.

use std::ffi::CString;
use std::fmt::{Error, Formatter};
use std::mem::size_of;
use std::os::raw::{c_char, c_int, c_void};
use std::ptr;
use std::ptr::null;
use std::str;

use gl;
use k4a_sys_wrapper;
use gl::types::*;
use libc;

use opengl_wrapper::{Buffer, VertexArray, gl_get_error, OpenGlError};
use opengl_wrapper::Texture;
use point_cloud::compile_shader::compile_shader;
use point_cloud::point_cloud_compute_shader::POINT_CLOUD_TEXTURE_FORMAT;
use graphics_gl::{get_stride, get_pointer_offset};

pub type Result<T> = std::result::Result<T, PointCloudRendererError>;

#[derive(Clone, Debug)]
pub enum PointCloudRendererError {
  OpenGlError(OpenGlError),
  UnknownError,
}

impl std::fmt::Display for PointCloudRendererError {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    let description = match self {
      PointCloudRendererError::OpenGlError(inner) => {
        format!("Renderer OpenGL error: {}", inner)
      },
      PointCloudRendererError::UnknownError => "Unknown Renderer Error".into(),
    };

    write!(f, "{}", description)
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
    // TODO: Init view and projection matrices
    // mat4x4_identity(m_view);
    // mat4x4_identity(m_projection);

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

  // TODO need matrix maths
  pub fn update_view_projection(&mut self) {
    // TODO - matrix math
    // void PointCloudRenderer::UpdateViewProjection(mat4x4 view, mat4x4 projection)
    //mat4x4_dup(m_view, view);
    //mat4x4_dup(m_projection, projection);
    unimplemented!();
  }

  pub fn update_point_clouds(&mut self, color_image: &k4a_sys_wrapper::Image,
                             point_cloud_texture: &Texture) -> Result<()>
  {
    unsafe {
      gl::BindVertexArray(self.vertex_array_object.id());

      // Vertex Colors
      gl::BindBuffer(gl::ARRAY_BUFFER, self.vertex_color_buffer_object.id());
    }

    let color_image_size_bytes = color_image.get_size() as i32;

    if self.vertex_array_size_bytes != color_image_size_bytes {
      self.vertex_array_size_bytes = color_image_size_bytes;
      unsafe {
        gl::BufferData(
          gl::ARRAY_BUFFER,
          self.vertex_array_size_bytes as isize,
          null(),
          gl::STREAM_DRAW
        );
      }
    }

    let vertex_mapped_buffer = unsafe {
      // GLubyte *vertexMappedBuffer = reinterpret_cast<GLubyte *>(
      gl::MapBufferRange(
        gl::ARRAY_BUFFER,
        0,
        color_image_size_bytes as isize,
        gl::MAP_WRITE_BIT | gl::MAP_INVALIDATE_BUFFER_BIT
      )
    };

    if vertex_mapped_buffer as usize == 0 {
      // TODO: return glGetError() instead
      return Err(PointCloudRendererError::UnknownError);
    }

    let mut color_src = color_image.get_buffer();

    let result = unsafe {
      //const GLubyte *colorSrc = reinterpret_cast<const GLubyte *>(color.get_buffer());
      //std::copy(colorSrc, colorSrc + colorImageSizeBytes, vertexMappedBuffer);
      std::ptr::copy_nonoverlapping::<u8>(color_src, vertex_mapped_buffer as *mut u8,
        color_image_size_bytes as usize);

      gl::UnmapBuffer(gl::ARRAY_BUFFER)
    };

    if result == gl::FALSE {
      return Err(PointCloudRendererError::UnknownError);
    }

    unsafe {
      gl::EnableVertexAttribArray(0);
      gl::VertexAttribPointer(
        0,
        gl::BGRA as i32,
        gl::UNSIGNED_BYTE,
        gl::TRUE,
        get_stride::<f32>(0),
        get_pointer_offset::<f32>(0),
      );
      gl::UseProgram(self.program_id);
    }

    // Uniforms
    // Bind our point cloud texture
    unsafe {
      gl::ActiveTexture(gl::TEXTURE0);
      gl::BindTexture(gl::TEXTURE_2D, point_cloud_texture.id());
      gl::BindImageTexture(
        0,
        point_cloud_texture.id(),
        0,
        gl::FALSE,
        0,
        gl::READ_ONLY,
        POINT_CLOUD_TEXTURE_FORMAT,
      );
      gl::Uniform1i(self.point_cloud_texture_index, 0);

      gl::BindVertexArray(0);
    }

    gl_get_error()
        .map_err(|err| PointCloudRendererError::OpenGlError(err))
  }

  pub fn render(&self) -> Result<()> {
    unsafe {
      gl::Enable(gl::DEPTH_TEST);
      gl::Enable(gl::BLEND);
      gl::BlendFunc(gl::SRC_ALPHA, gl::ONE_MINUS_SRC_ALPHA);

      gl::PointSize(self.point_size as f32);

      gl::UseProgram(self.program_id);

      // TODO:
      // Update view/projection matrices in shader
      // glUniformMatrix4fv(m_viewIndex, 1, GL_FALSE, reinterpret_cast<const GLfloat *>(m_view));
      // glUniformMatrix4fv(m_projectionIndex, 1, GL_FALSE, reinterpret_cast<const GLfloat *>(m_projection));

      // Update render settings in shader
      let enable_shading = if self.enable_shading { 1 } else { 0 };
      gl::Uniform1i(self.enable_shading_index, enable_shading);

      // glDrawArrays(GL_POINTS, 0, m_vertexArraySizeBytes / static_cast<GLsizei>(sizeof(BgraPixel)));
      let size = self.vertex_array_size_bytes/64;

      // Render point cloud
      gl::BindVertexArray(self.vertex_array_object.id());
      gl::DrawArrays(
        gl::POINTS,
        0,
        size,
      );

      gl::BindVertexArray(0);

      gl_get_error()
          .map_err(|err| PointCloudRendererError::OpenGlError(err))
    }
  }

  pub fn set_point_size(&mut self, point_size: u8) {
    self.point_size = point_size;
  }

  pub fn set_enable_shading(&mut self, enable_shading: bool) {
    self.enable_shading = enable_shading;
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
