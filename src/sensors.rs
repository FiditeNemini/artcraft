use std::borrow::BorrowMut;
use std::ffi::{c_void, CStr, CString};
use std::io::Cursor;
use std::os::raw::c_char;
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
use glium::vertex::VertexBufferAny;
use image::{DynamicImage, ImageFormat};
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

use handwritten_wrapper::*;
use k4a_sys_wrapper::Device;
use k4a_sys_wrapper::device_get_installed_count;
use k4a_sys_wrapper::Image;

pub fn capture_thread(frame: Arc<Mutex<Option<DynamicImage>>>) {
  let installed_devices = device_get_installed_count();
  println!("Installed devices: {}", installed_devices);

  let device = Device::open(0).unwrap();
  println!("Device: {:?}", device);

  let serial_number = device.get_serial_number().unwrap();
  println!("Device: {:?}", serial_number);

  println!("Starting cameras...");
  device.start_cameras().unwrap();

  loop {
    let mut captured_image = None;

    let capture = device.get_capture(1000)
        .expect("Should be able to get frame capture.");

    match capture.get_color_image() {
      Ok(image) => {
        captured_image = Some(image);
      }
      _ => {
        continue; // We didn't grab a frame.
      },
    }
    println!("Got frame!");

    let image = captured_image.unwrap();

    let image_image = depth_to_image(&image)
        .expect("depth_to_image should work");

    match frame.lock() {
      Ok(mut lock) => {
        println!("Wrote to mutex!");
        *lock = Some(image_image)
      },
      Err(_) => {
        continue; // Wat.
      },
    }
  }
}

pub fn grab_single_frame() -> DynamicImage {
  let installed_devices = device_get_installed_count();
  println!("Installed devices: {}", installed_devices);
  {
    let device = Device::open(0).unwrap();
    println!("Device: {:?}", device);
    let serial_number = device.get_serial_number().unwrap();
    println!("Device: {:?}", serial_number);

    println!("Starting cameras...");
    device.start_cameras().unwrap();

    let mut captured_image = None;
    loop {
      let capture = device.get_capture(1000).ok().unwrap();

      match capture.get_color_image() {
        Ok(image) => {
          captured_image = Some(image);
          break;
        }
        _ => {},
      }
    }

    let image = captured_image.unwrap();

    let image_image = depth_to_image(&image).expect("depth_to_image should work");

    device.stop_cameras();

    return image_image;
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
