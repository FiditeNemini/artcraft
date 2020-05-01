//#![allow(warnings)]

extern crate arcball;
extern crate cgmath;
extern crate clipboard;
#[macro_use] extern crate enum_primitive;
extern crate genmesh;
extern crate gl;
extern crate glfw;
extern crate glfw_sys;
#[macro_use] extern crate glium;
extern crate glutin;
extern crate grr;
extern crate image;
#[macro_use] extern crate imgui;
extern crate imgui_glium_renderer;
extern crate imgui_opengl_renderer;
extern crate imgui_sdl2;
extern crate imgui_winit_support;
extern crate k4a_sys;
extern crate libc;
extern crate memmap2;
extern crate mmap;
extern crate obj;
extern crate opencv;
extern crate rand;
extern crate sdl2;
extern crate winit;

use std::sync::Arc;
use std::thread;

use opencv::prelude::*;

use k4a_sys_wrapper::Device;
use sensor_control::{capture_thread, CaptureProvider};

pub mod conversion;
pub mod mouse;
pub mod graphics_imgui;
pub mod imgui_support;
pub mod k4a_sys_wrapper;
pub mod opengl;
pub mod opengl_wrapper;
pub mod point_cloud;
pub mod sensor_control;
pub mod webcam;

pub fn main() {
  let device = Device::open(0).expect("Device should open");

  let depth_mode : k4a_sys::k4a_depth_mode_t = 2; //k4a_sys::K4A_DEPTH_MODE_NFOV_UNBINNED;
  let color_format: k4a_sys::k4a_color_resolution_t = k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_2160P;

  let calibration = device.get_calibration(depth_mode, color_format).unwrap();

  let capture_provider = Arc::new(CaptureProvider::new());
  let capture_provider2= capture_provider.clone();

  thread::spawn(move || capture_thread(capture_provider, Some(device)));

  graphics_imgui::run(capture_provider2, calibration);

}
