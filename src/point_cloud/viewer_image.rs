use opengl_wrapper::{Buffer, gl_get_error};
use opengl_wrapper::Texture;
use opengl_wrapper::OpenGlError;
use std::fmt::{Error, Formatter};

use libc::uint8_t;
use gl;
use gl::types::*;
use image::image_dimensions;
use std::ptr::null;

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

impl ViewerImage {
  /// private ctor
  fn new(dimensions: ImageDimensions, format: GLenum) -> Result<Self> {
    let texture = Texture::new_initialized();
    let texture_buffer = Buffer::new_initialized();

    let texture_buffer_size = (dimensions.width * dimensions.height) as GLuint
        * get_format_pixel_element_count(format);

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
    //data: &[uint8_t],
    format: Option<GLenum>,
    internal_format: Option<GLenum>) -> Result<Self>
  {
    let dimensions = ImageDimensions { width, height };
    let mut viewer_image = ViewerImage::new(
      dimensions,
      format.unwrap_or(gl::BGRA)
    )?;

    // NB: To be a nice citizen with other tools, let's unbind.
    let mut last_texture_id = 0;

    unsafe {
      // NB: To be a good citizen, let's rebind the old texture.
      gl::GetIntegerv(gl::TEXTURE_BINDING_2D, &mut last_texture_id);

      gl::BindTexture(gl::TEXTURE_2D, viewer_image.texture.id());

      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::LINEAR as i32);
      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::LINEAR as i32);
      gl::PixelStorei(gl::UNPACK_ROW_LENGTH, 0);

      gl::TexStorage2D(
        gl::TEXTURE_2D,
        1,
        internal_format.unwrap_or(gl::RGBA8),
        width as i32,
        height as i32,
      );

      viewer_image.update_texture(None)?;

      // NB: To be a nice citizen with other tools, let's unbind.
      gl::BindTexture(gl::TEXTURE_2D, last_texture_id as u32);
    }

    Ok(viewer_image)
  }

  pub fn texture_id(&self) -> GLuint {
    self.texture.id()
  }

  pub unsafe fn update_texture(&mut self, data: Option<&[uint8_t]>) -> Result<()> {
    gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, self.texture_buffer.id());
    gl::BindTexture(gl::TEXTURE_2D, self.texture.id());

    let cleanup_guard = CleanupGuard {};

    let buffer = gl::MapBufferRange(
      gl::PIXEL_UNPACK_BUFFER,
      0,
      self.texture_buffer_size as isize,
      gl::MAP_WRITE_BIT | gl::MAP_INVALIDATE_BUFFER_BIT,
    );

    if buffer as usize == 0 {
      return Err(ViewerImageError::OpenGlError(gl_get_error().err().unwrap()));
    }

    // TODO COPY DATA
    /*
    if (data)
    {
    // TODO TODO TODO TODO
        std::copy(data, data + m_textureBufferSize, buffer);
    }
    else
    {
    // TODO TODO TODO TODO
        std::fill(buffer, buffer + m_textureBufferSize, static_cast<uint8_t>(0));
    }
    */
    match data {
      Some(_) => {
        // TODO - does this get used in k4a!?
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

