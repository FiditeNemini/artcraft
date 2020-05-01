//! Format conversion
//! k4a frames, image-rs, opencv, OpenGL textures, etc.

use std::mem::size_of;
use std::slice;

use glium::texture::RawImage2d;
use image::DynamicImage;
use image::error::{ImageFormatHint, UnsupportedError};
use image::flat::{FlatSamples, SampleLayout};
use image::GenericImage;
use image::ImageBuffer;
use image::ImageError;
use image::Rgba;
use image::RgbaImage;
use opencv::prelude::*;

use k4a_sys_wrapper;
use k4a_sys_wrapper::Image;
use point_cloud::pixel_structs::{BgraPixel, DepthPixel};

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

  let buffer = FlatSamples {
    samples,
    layout,
    color_hint: None,
  };

  let view = buffer.as_view::<Rgba<u8>>()
      .expect("view should work");

  let img: RgbaImage = ImageBuffer::new(
    image.get_width_pixels() as u32,
    image.get_height_pixels() as u32);
  let mut img = DynamicImage::ImageRgba8(img);

  img.copy_from(&view, 0, 0).expect("Should be able to copy");

  Ok(img)
}

// Not efficient, but good for debugging
pub fn k4a_image_to_rust_image_for_debug(image: &Image) -> Result<RgbaImage, ImageError> {
  let width = image.get_width_pixels() as u32;
  let height= image.get_height_pixels() as u32;
  let image_buffer = image.get_buffer();
  let image_format = image.get_format();

  println!("k4a_image_to_rust: {}x{} (format={:?}", width, height, image_format);

  let output_image = DynamicImage::new_rgba16(width, height);
  let mut rgba_image = output_image.to_rgba();
  let mut offset = 0;

  match image_format {
    k4a_sys_wrapper::ImageFormat::Depth16 => {
      let typed_buffer = image_buffer as *const DepthPixel;
      for y in 0 .. height {
        for x in 0 .. width {
          let pixel = unsafe { *typed_buffer.offset(offset) };
          let scaled_pixel = pixel as f32 / std::u16::MAX as f32;
          let scaled_pixel = (scaled_pixel * std::u8::MAX as f32) as u8;
          rgba_image.put_pixel(x, y, Rgba([scaled_pixel, scaled_pixel, scaled_pixel, 255]));
          offset += 1;
        }
      }
    },
    k4a_sys_wrapper::ImageFormat::ColorBgra32 => {
      let typed_buffer = image_buffer as *const BgraPixel;
      for y in 0 .. height {
        for x in 0 .. width {
          let pixel = unsafe { &*typed_buffer.offset(offset) };
          // BGRA32: The fourth byte is the alpha channel and is unused in the Azure Kinect APIs.
          rgba_image.put_pixel(x, y, Rgba([pixel.red, pixel.green, pixel.blue, 255]));
          offset += 1;
        }
      }
    },
    k4a_sys_wrapper::ImageFormat::Custom => {
      // Stride is image_width * bytes_per_pixel, so we solve for bytes_per_pixel
      let stride = image.get_stride_bytes();
      let image_width = image.get_width_pixels();
      let bytes_per_pixel = stride / image_width;

      // The only format we know how to represent is k4a_float2_t.
      let known_size = size_of::<k4a_sys::k4a_float2_t>();

      if bytes_per_pixel != known_size {
        return Err(ImageError::Unsupported(UnsupportedError::from(ImageFormatHint::Unknown)))
      }

      let typed_buffer = image_buffer as *const k4a_sys::k4a_float2_t;

      let mut max_x = -10000.0;
      let mut max_y = -10000.0;
      let mut min_x= 10000.0;
      let mut min_y = 10000.0;

      offset = 0;
      for _ in 0 .. height {
        for _ in 0 .. width {
          unsafe {
            let pixel = &*typed_buffer.offset(offset);
            let xp = pixel.xy.x;
            let yp = pixel.xy.y;
            if xp < min_x {
              min_x = xp;
            }
            if xp > max_x {
              max_x = xp;
            }
            if yp < min_y {
              min_y = yp;
            }
            if yp > max_y {
              max_y = yp;
            }
          }
          offset += 1;
        }
      }

      //println!("Max x: {}", max_x);
      //println!("Max y: {}", max_y);
      //println!("Min x: {}", min_x);
      //println!("Min y: {}", min_y);

      offset = 0;
      for y in 0 .. height {
        for x in 0 .. width {
          unsafe {
            let pixel = &*typed_buffer.offset(offset);
            let xp = pixel.xy.x;
            let yp = pixel.xy.y;

            let scaled_x =  (xp - min_x) / (max_x - min_x);
            let scaled_x =  (255.0 * scaled_x) as u8;

            let scaled_y =  (yp - min_y) / (max_y - min_y);
            let scaled_y =  (255.0 * scaled_y) as u8;

            rgba_image.put_pixel(x, y, Rgba([scaled_x, 0, scaled_y, 255]));
          }
          offset += 1;
        }
      }
    },
    _ => unimplemented!("conversion not implemented for: {:?}", image_format),
  };

  return Ok(rgba_image)
}
