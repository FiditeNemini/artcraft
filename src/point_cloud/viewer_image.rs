use std::fmt::Formatter;
use std::ptr::null;

use gl;
use gl::types::*;
use libc::uint8_t;

use opengl_wrapper::{Buffer, gl_get_error};
use opengl_wrapper::OpenGlError;
use opengl_wrapper::Texture;
use point_cloud::pixel_structs::BgraPixel;

pub type Result<T> = std::result::Result<T, ViewerImageError>;

#[derive(Clone, Debug)]
pub enum ViewerImageError {
  OpenGlError(OpenGlError),
}

impl From<OpenGlError> for ViewerImageError {
  fn from(error: OpenGlError) -> Self {
    ViewerImageError::OpenGlError(error)
  }
}

impl std::fmt::Display for ViewerImageError {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    let description = match self {
      ViewerImageError::OpenGlError(inner) => {
        format!("Visualizer OpenGL error: {}", inner)
      },
    };
    write!(f, "{}", description)
  }
}

impl std::error::Error for ViewerImageError {
  fn source(&self) -> Option<&(dyn std::error::Error +'static)> {
    // Generic error, no backtrace.
    None
  }
}


#[derive(Clone, Debug)]
pub struct ImageDimensions {
  pub width: u32,
  pub height: u32,
}

#[derive(Clone, Debug)]
pub struct ViewerImage {
  dimensions: ImageDimensions,
  format: GLenum,

  texture: Texture,
  texture_buffer: Buffer,

  texture_buffer_size: GLuint,
}

// GLenum format = GL_BGRA (default), but overridden as gl::RGBA
// GLenum internalFormat = GL_RGBA8 (default)
impl ViewerImage {
  /// private ctor
  fn new(
    dimensions: ImageDimensions,
    format: GLenum
  ) -> Result<Self> {
    let texture_buffer_size = (dimensions.width * dimensions.height) as GLuint
        * get_format_pixel_element_count(format);

    let texture = Texture::new_initialized();
    let texture_buffer = Buffer::new_initialized();

    unsafe {
      gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, texture_buffer.id());
      gl::BufferData(gl::PIXEL_UNPACK_BUFFER, texture_buffer_size as isize, null(), gl::STREAM_DRAW);
      gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, 0);
    }

    Ok(Self {
      dimensions,
      format,
      texture_buffer_size,
      texture,
      texture_buffer,
    })
  }

  pub fn create(
    width: u32,
    height: u32,
  ) -> Result<Self>
  {
    let dimensions = ImageDimensions { width, height };
    let format = gl::RGBA;
    let mut viewer_image = ViewerImage::new(dimensions, format)?;

    unsafe {
      gl::BindTexture(gl::TEXTURE_2D, viewer_image.texture.id());

      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::LINEAR as i32);
      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::LINEAR as i32);
      gl::PixelStorei(gl::UNPACK_ROW_LENGTH, 0);

      gl::TexStorage2D(
        gl::TEXTURE_2D,
        1,
        gl::RGBA8,
        width as i32,
        height as i32,
      );

      viewer_image.update_texture(None)?;
    }

    Ok(viewer_image)
  }

  pub fn texture_id(&self) -> GLuint {
    self.texture.id()
  }

  pub unsafe fn update_texture(&mut self, data: Option<&[uint8_t]>) -> Result<()> {
    gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, self.texture_buffer.id());
    gl::BindTexture(gl::TEXTURE_2D, self.texture.id());

    let _cleanup_guard = CleanupGuard {};

    let buffer = gl::MapBufferRange(
      gl::PIXEL_UNPACK_BUFFER,
      0,
      self.texture_buffer_size as isize,
      gl::MAP_WRITE_BIT | gl::MAP_INVALIDATE_BUFFER_BIT,
    ) as *mut BgraPixel; // TODO: It's actually RGBA, not BGRA.

    if buffer as usize == 0 {
      return Err(ViewerImageError::OpenGlError(gl_get_error().err().unwrap()));
    }

    // TODO COPY DATA
    match data {
      Some(_) => {
        unreachable!("TODO")
      },
      None => {
        unsafe {
          *buffer = std::mem::zeroed();
        }
      },
    }

    let result = gl::UnmapBuffer(gl::PIXEL_UNPACK_BUFFER);

    if result == 0 {
      return Err(ViewerImageError::OpenGlError(gl_get_error().err().unwrap()));
    }

    gl::TexSubImage2D(
      gl::TEXTURE_2D,
      0,
      0,
      0,
      self.dimensions.width as i32,
      self.dimensions.height as i32,
      self.format,
      gl::UNSIGNED_BYTE,
      null(),
    );

    gl_get_error()
        .map_err(|err| ViewerImageError::OpenGlError(err))
  }
}

pub fn get_format_pixel_element_count(format: GLenum) -> GLuint {
  match format {
    gl::RED => 1,
    gl::RG => 2,
    gl::RGB | gl::BGR => 3,
    gl::RGBA | gl::BGRA => 4,
    _ => unreachable!("bad get_format_pixel_element_count") // TODO: Ugh.
  }
}

// TODO: Dedup
struct CleanupGuard {}

impl Drop for CleanupGuard {
  fn drop(&mut self) {
    println!("Running CleanupGuard");
    unsafe {
      gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, 0);
    }
  }
}

