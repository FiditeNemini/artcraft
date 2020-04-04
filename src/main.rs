#[macro_use] extern crate enum_primitive;
extern crate k4a_sys;
extern crate libc;
extern crate opencv;

pub mod handwritten_wrapper;
pub mod handwritten_wrapper_test;
pub mod k4a_sys_wrapper;

use handwritten_wrapper::*;
use k4a_sys_wrapper::device_get_installed_count;
use k4a_sys_wrapper::Device;
use k4a_sys_wrapper::Image;

use libc::size_t;
use opencv::highgui;
use opencv::imgproc;
use opencv::core;
use opencv::prelude::*;
use std::borrow::BorrowMut;
use std::ffi::{CStr, CString, c_void};
use std::os::raw::c_char;
use std::thread;
use std::time::Duration;

pub fn main() {
  let installed_devices = device_get_installed_count();
  println!("Installed devices: {}", installed_devices);

  let window_name = "output";
  highgui::named_window(window_name, 1).unwrap();

  {
    let device = Device::open(0).unwrap();
    println!("Device: {:?}", device);
    let serial_number = device.get_serial_number().unwrap();
    println!("Device: {:?}", serial_number);

    println!("Starting cameras...");
    device.start_cameras().unwrap();


    loop {
      let capture = device.get_capture(1000).ok().unwrap();
      let image = capture.get_depth_image().ok().unwrap();

      let opencv_image = depth_to_opencv(&image).ok().unwrap();

      highgui::imshow(window_name, &opencv_image).unwrap();
      if highgui::wait_key(10).unwrap() > 0 {
        break;
      }
    }

    device.stop_cameras();
  }

  handwritten_wrapper_test::test_integration();
}

/// Copied from k4a-sys
pub fn color_to_opencv(mut image: Image) -> opencv::Result<Mat> {
  let with_alpha = unsafe {
    let stride = image.get_stride_bytes();
    Mat::new_rows_cols_with_data(
      image.get_height_pixels() as i32,
      image.get_width_pixels() as i32,
      core::CV_8UC4,
      &mut *(image.get_buffer() as *mut c_void),
      stride,
    )?
  };
  let mut no_alpha = Mat::default()?;
  imgproc::cvt_color(&with_alpha, &mut no_alpha, imgproc::COLOR_BGRA2BGR, 0)?;
  return Ok(no_alpha);
}

/// Copied from k4a-sys
pub fn depth_to_opencv(image: &Image) -> opencv::Result<Mat> {
  unsafe {
    let stride = image.get_stride_bytes();
    let mat = Mat::new_rows_cols_with_data(
      image.get_height_pixels() as i32,
      image.get_width_pixels() as i32,
      core::CV_16U,
      &mut *(image.get_buffer() as *mut c_void),
      stride,
    );
    mat
  }
}
