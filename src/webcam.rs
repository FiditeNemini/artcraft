use gl::types::*;
use gl;
use std::ffi::c_void;
use std::fs::File;
use std::io::Write;
use opengl_wrapper::gl_get_error;
use image::imageops::FilterType;
use memmap2::MmapMut;
use mmap::MemoryMap;

pub fn write_frame_to_webcam(file: &mut File, texture_id: GLuint) {

  //let mut buffer: [u8; 15_360_000] = [0; 15_360_000];
  /*let mut buffer = Vec::with_capacity(15_360_000);
  for _ in 0..15_360_000 {
    buffer.push(0);
  }*/
  //let size = 800 * 800 * 4;
  let size = 15_360_000;
  let mut buffer = Vec::with_capacity(size);
  buffer.resize(size, 0);
  /*for _ in 0 .. size {
    buffer.push(0);
  }*/
  let mut typed_buffer = buffer.as_mut_ptr() as *mut c_void;

  unsafe {
    // > 600 * 800
    // 480000
    // > 600 * 800 * 4
    // 1920000
    /*
    const width : usize = 640;
    const height : usize = 480;
    const bytes_per_pixel : usize = 4;
    const size : usize = width * height * bytes_per_pixel;
    let mut buffer: [u8; bytes_per_pixel] = [0; bytes_per_pixel];
    let mut typed_buffer = buffer.as_mut_ptr() as *mut c_void;
    gl::ReadnPixels(0, 0, width as i32, height as i32, gl::RGB, gl::BYTE, size as i32, typed_buffer);
    println!("Write buffer to camera");
    file.write(&buffer).expect("work");
    */
    // width = 800
    // height = 800
    // rgb8 = 24
    // size = 15_360_000
    println!("Declare memory size");

    println!("Read frame into buffer");
    //gl::Viewport(0, 0, 640, 480);
    //gl::ReadPixels(0, 0, 640, 480, gl::RGB, gl::UNSIGNED_BYTE, typed_buffer);

    println!("Getting texture: {}", texture_id);

    // InvalidEnum
    //gl::BindTexture(gl::TEXTURE_2D, texture_id);
    //gl::GetnTexImage(gl::TEXTURE_2D, 0, gl::RGB8, gl::UNSIGNED_BYTE, 1_228_800, typed_buffer);

    println!("Bind");
    gl::BindTexture(gl::TEXTURE_2D, texture_id);
    println!("getn");
    //gl::GetnTexImage(gl::TEXTURE_2D, 0, gl::RGB, gl::UNSIGNED_BYTE, 15_360_000, typed_buffer);
    //gl::GetnTexImage(gl::TEXTURE_2D, 0, gl::RGB, gl::UNSIGNED_BYTE, 15_360_000, typed_buffer); // WORKS
    gl::GetnTexImage(gl::TEXTURE_2D, 0, gl::RGB, gl::UNSIGNED_BYTE, size as i32, typed_buffer);

    println!("load from memory");

    gl_get_error().unwrap();

    println!("Write buffer to camera");

    gl::BindTexture(gl::TEXTURE_2D, 0);

    //let img = image::load_from_memory(&buffer).unwrap();
    //let resized = img.resize(640, 480, FilterType::Nearest);
    //let bytes = resized.to_bytes();

    println!("Buffer width before: {}", buffer.len());
    /*let mut resizer = resize::new(
      800,
      800,
      640,
      480,
      resize::Pixel::RGB24,
      resize::Type::Lanczos3);

    let capacity = 640 * 480 * 3;
    let mut dst_buffer = Vec::with_capacity(capacity);
    dst_buffer.resize(capacity, 0);*/
    /*for _ in 0 .. capacity {
      dst_buffer.push(0);
    }*/

    //resizer.resize(&buffer, &mut dst_buffer);

    /*println!("Buffer width after: {}", dst_buffer.len());

    println!("Values: {}, {}, {}, {}, {}",
      dst_buffer.get(0).unwrap(),
      dst_buffer.get(10).unwrap(),
      dst_buffer.get(100).unwrap(),
      dst_buffer.get(5000).unwrap(),
      dst_buffer.get(10000).unwrap());*/

    //let width = 640 * 480 * 3;
    //buffer.truncate(width);
    //println!("Buffer width after: {}", buffer.len());

    //gl::GetTextureImage(texture_id, 0, gl::RGB, gl::UNSIGNED_BYTE, 1_228_800, typed_buffer);

    let image_size = 1280 * 720 * 3 * 10;
    /*let image_size = 640 * 480 * 3;

    println!("Writing mmap of size {}", file.len());
    println!("Writing bytes: {}", image_size);

    let mut image_buf = Vec::with_capacity(image_size);
    image_buf.resize(image_size, 255);

    let typed_buffer = image_buf.as_mut_ptr();

    unsafe {
      std::ptr::copy_nonoverlapping::<u8>(typed_buffer,
        file.data(),
        image_size as usize);
    }*/

    let width = 1280;
    let height = 720;
    let depth =  3;
    let size = width * height * depth;
    let mut buffer= Vec::with_capacity(width * height);
    buffer.resize(size, 255);

    let use_width = true;
    let mut i = 0;
    for y in 0 .. height {
      for x in 0 .. width {
        /*
        > approx_bytes = 2763000 - 1843500
        919500
        > approx_bytes/3
        306500
        > approx_bytes/3/720
        425.69444444444446
        */
        // y < 720 is the height of the screen. Duh.
        /*buffer[i + 0] = 0;
        buffer[i + 1] = 0;
        buffer[i + 2] = 0;
        // byte # 1_843_500 is super close to the start.
        if i < 1_843_500 {
          buffer[i + 0] = 255;
        }
        // byte # 2_763_000 is super close to the end.
        if i < 2_763_000 {
          buffer[i + 1] = 255;
        }
        if i < 3_000_000 {
          buffer[i + 2] = 255;
        }*/
        if use_width {
          // Width
          buffer[i] = (x as f32 / width as f32 * 255.0) as u8;
          buffer[i + 1] = (x as f32 / width as f32 * 255.0) as u8;
          buffer[i + 2] = (x as f32 / width as f32 * 255.0) as u8;
        } else {
          // Height
          buffer[i] = (y as f32 / height as f32 * 255.0) as u8;
          buffer[i + 1] = (y as f32 / height as f32 * 255.0) as u8;
          buffer[i + 2] = (y as f32 / height as f32 * 255.0) as u8;
        }
        i += depth;
      }
    }

    //(&mut file[..]).write_all(&buffer[0..1280*720*3]).expect("work");
    //(&mut file[..]).write_all(&buffer[0..1280*720*3]).expect("work");
    file.write_all(&buffer).expect("should write");
    file.flush().expect("flush");

  }
}
