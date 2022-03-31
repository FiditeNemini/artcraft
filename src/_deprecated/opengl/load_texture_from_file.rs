use gl::types::*;
use gl;
use image;
use std::ffi::c_void;
use std::path::Path;

/// Load a texture from a file.
pub fn load_texture_from_file(filename: &str) -> GLuint {
  let mut texture_id = 0;

  unsafe {
    gl::GenTextures(1, &mut texture_id);
    gl::BindTexture(gl::TEXTURE_2D, texture_id);

    // Set up filtering params and other texture attributes
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::LINEAR as i32);
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::LINEAR as i32);
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_S, gl::REPEAT as i32);
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_T, gl::REPEAT as i32);
  }

  let img = image::open(&Path::new(filename))
      .expect("failed to load")
      .to_rgba();

  let width = img.dimensions().0 as i32;
  let height = img.dimensions().1 as i32;
  let data = img.into_raw();

  println!("Loaded image: {}x{}", width, height);

  unsafe {
    gl::PixelStorei(gl::UNPACK_ROW_LENGTH, 0);
    gl::TexImage2D(
      gl::TEXTURE_2D,
      0,
      gl::RGBA as i32,
      //format as i32,
      width,
      height,
      0,
      gl::RGBA,
      //format,
      gl::UNSIGNED_BYTE,
      &data[0] as *const u8 as *const c_void,
    );

    //gl::BindTexture(gl::TEXTURE_2D, 0);
  }

  println!("Returning texture id: {}", texture_id);
  return texture_id;
}
