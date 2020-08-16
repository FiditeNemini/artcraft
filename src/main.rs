#![allow(warnings)]

extern crate anyhow;
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
use kinect::capture::multi_device_capturer::{MultiDeviceCapturer, start_capture_thread};
use kinect::capture::fake_device_capturer::FakeDeviceCaptureProvider;

pub mod core_types;
pub mod files;
pub mod graphics_imgui;
pub mod gui;
pub mod image_debug;
pub mod imgui_support;
pub mod kinect;
pub mod opengl;
pub mod point_cloud;
pub mod webcam;

/// This is the serial number for the camera I have mounted to the utility wall.
const PRIMARY_DEVICE_SERIAL : &'static str = "000513594512";

/// This is a second device
const SECONDARY_DEVICE_SERIAL : &'static str = "000886694512";

const ENABLE_WEBCAM : bool = false;

pub fn main() {
  let multi_device = MultiDeviceCapturer::new(2, Some(1))
      .expect("multi-device create");

  multi_device.start_cameras().expect("start cameras");

  let depth_mode : k4a_sys::k4a_depth_mode_t = 2; //k4a_sys::K4A_DEPTH_MODE_NFOV_UNBINNED;
  let color_format: k4a_sys::k4a_color_resolution_t = k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_2160P;

  let primary_device = &multi_device.primary_device;
  let calibration = primary_device.get_calibration(depth_mode, color_format).unwrap();

  let capture_provider = multi_device.get_sync_capture_provider();

  thread::spawn(move || start_capture_thread(multi_device));

  //let capture_provider = Arc::new(FakeDeviceCaptureProvider::new().unwrap());

  graphics_imgui::run(capture_provider, calibration, ENABLE_WEBCAM);
}
