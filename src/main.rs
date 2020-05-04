#![allow(warnings)]

extern crate arcball;
extern crate cgmath;
extern crate clipboard;
extern crate gl;
extern crate glfw;
extern crate glfw_sys;
#[macro_use] extern crate glium;
extern crate image;
#[macro_use] extern crate imgui;
extern crate imgui_glium_renderer;
extern crate imgui_opengl_renderer;
extern crate imgui_sdl2;
extern crate imgui_winit_support;
extern crate k4a_sys;
extern crate libc;
extern crate obj;
extern crate opencv;
extern crate rand;
extern crate sdl2;
extern crate winit;

use std::sync::Arc;
use std::thread;

use opencv::prelude::*;

use kinect::k4a_sys_wrapper::Device;
use kinect::sensor_control::{capture_thread, CaptureProvider};

pub mod image_debug;
pub mod core_types;
pub mod graphics_imgui;
pub mod gui;
pub mod imgui_support;
pub mod kinect;
pub mod opengl;
pub mod point_cloud;
pub mod webcam;

/// This is the serial number for the camera I have mounted to the utility wall.
const PRIMARY_DEVICE_SERIAL : &'static str = "000513594512";

/// This is a second device
const SECONDARY_DEVICE_SERIAL : &'static str = "000886694512";

pub fn main() {
  let device_1 = Device::open(0).expect("Device should open");
  let device_2 = Device::open(1).expect("Device should open");

  let primary_device;
  let secondary_device;
  {
    if PRIMARY_DEVICE_SERIAL.eq(&device_1.get_serial_number().expect("device 1 serial")) {
      primary_device = device_1;
      secondary_device = device_2;
    } else if PRIMARY_DEVICE_SERIAL.eq(&device_2.get_serial_number().expect("device 2 serial")) {
      primary_device = device_2;
      secondary_device = device_1;
    } else {
      panic!("Primary device not found: {}", PRIMARY_DEVICE_SERIAL);
    }
  }

  let depth_mode : k4a_sys::k4a_depth_mode_t = 2; //k4a_sys::K4A_DEPTH_MODE_NFOV_UNBINNED;
  let color_format: k4a_sys::k4a_color_resolution_t = k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_2160P;

  let calibration = primary_device.get_calibration(depth_mode, color_format).unwrap();

  let capture_provider = Arc::new(CaptureProvider::new());
  let capture_provider2= capture_provider.clone();

  thread::spawn(move || capture_thread(capture_provider, Some(primary_device)));

  graphics_imgui::run(capture_provider2, calibration);
}
