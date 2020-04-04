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

use libc::size_t;
use opencv::highgui;
use opencv::prelude::*;
use std::borrow::BorrowMut;
use std::ffi::{CStr, CString};
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
      println!("Capture: {:?}", capture);

      let image = capture.get_depth_image().ok().unwrap();
      println!("Image: {:?}", capture);

      let height = image.get_height_pixels();
      let width = image.get_width_pixels();

      println!("Dimensions: {}x{}", width, height);

      /*highgui::imshow(window_name, &output_image).unwrap();
      if highgui::wait_key(10).unwrap() > 0 {
        break;
      }*/

      thread::sleep(Duration::from_secs(1));
    }


    println!("Stopping cameras...");
    device.stop_cameras();
  }

  handwritten_wrapper_test::test_integration();
}

