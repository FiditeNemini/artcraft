//! Format conversion
//! k4a frames, image-rs, opencv, OpenGL textures, etc.

use std::ptr;
use std::slice;
use std::sync::{Arc, PoisonError, RwLockWriteGuard};
use std::sync::Mutex;
use std::sync::RwLock;
use std::thread;
use std::time::Duration;

use glium::{Display, glutin, Surface};
use glium::glutin::event::{Event, StartCause};
use glium::glutin::event_loop::{ControlFlow, EventLoop};
use glium::Texture2d;
use glium::texture::RawImage2d;
use glium::vertex::VertexBufferAny;
use image::{DynamicImage};
use image::flat::{FlatSamples, SampleLayout};
use image::GenericImage;
use image::ImageBuffer;
use image::ImageError;
use image::Rgb;
use image::Rgba;
use image::RgbaImage;
use image::RgbImage;
use libc::size_t;
use opencv::core;
use opencv::highgui;
use opencv::imgproc;
use opencv::prelude::*;

use k4a_sys_wrapper::Device;
use k4a_sys_wrapper::device_get_installed_count;
use k4a_sys_wrapper::Image;
use point_cloud::pixel_structs::DepthPixel;

/// We can't send trait 'Texture2dDataSource' impl 'RawImage2d' as it requires its data has
/// the same lifetime, so here we collect it together here.
pub struct TextureData2d<'a> {
  pub raw_data: Vec<u8>,
  pub dimensions: (u32, u32),
  pub raw_image: RawImage2d<'a, u8>,
}

impl <'a> TextureData2d<'a> {
  pub fn from_k4a_color_image(k4a_color_image: &Image) -> Self {
    let dynamic_image = depth_to_image(k4a_color_image)
        .expect("Should convert");
    let rgba_image = dynamic_image.to_rgba();
    let dimensions = rgba_image.dimensions();
    let raw_data= rgba_image.into_raw();

    let texture = glium::texture::RawImage2d::from_raw_rgba_reversed(
      &raw_data,
      dimensions);

    TextureData2d {
      raw_data,
      dimensions,
      raw_image: texture,
    }
  }
}

// https://docs.rs/image/0.23.2/image/flat/index.html
pub fn depth_to_image(image: &Image) -> Result<DynamicImage, ImageError> {
  let len = image.get_size();
  let samples = unsafe { slice::from_raw_parts(image.get_buffer(), len) };

  let layout = SampleLayout::row_major_packed(
    4,
    image.get_width_pixels() as u32,
    image.get_height_pixels() as u32);

  let mut buffer = FlatSamples {
    samples,
    layout,
    color_hint: None,
  };

  let view = buffer.as_view::<Rgba<u8>>()
      .expect("view should work");

  let mut img: RgbaImage = ImageBuffer::new(
    image.get_width_pixels() as u32,
    image.get_height_pixels() as u32);
  let mut img = DynamicImage::ImageRgba8(img);

  img.copy_from(&view, 0, 0).expect("Should be able to copy");

  Ok(img)
}

// Not efficient, but good for debugging
pub fn k4a_image_to_rust_image_for_debug(image: &Image) -> Result<RgbImage, ImageError> {
  let width = image.get_width_pixels() as u32;
  let height= image.get_height_pixels() as u32;
  let image_buffer = image.get_buffer();
  let image_format = image.get_format();

  let rgb_image = match image_format {
    Depth16 => {
      let output_image = DynamicImage::new_rgb8(width, height);
      let typed_buffer = image_buffer as *const DepthPixel;

      let mut rgb_image = output_image.to_rgb();

      let mut offset = 0;
      for x in 0 .. width {
        for y in 0 .. height {
          let pixel = unsafe { *typed_buffer.offset(offset) };
          let scaled_pixel = (pixel as f32 / std::u16::MAX as f32);
          let scaled_pixel = (scaled_pixel * std::u8::MAX as f32) as u8;
          rgb_image.put_pixel(x, y, Rgb([scaled_pixel, scaled_pixel, scaled_pixel]));
          offset += 1;
        }
      }

      rgb_image
    },
    _ => unimplemented!("conversion not implemented for: {:?}", image_format),
  };

  return Ok(rgb_image)
}
