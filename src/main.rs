#![allow(warnings)]

#[macro_use] extern crate enum_primitive;
#[macro_use] extern crate glium;
#[macro_use] extern crate imgui;
extern crate clipboard;
extern crate genmesh;
extern crate gl;
extern crate glfw;
extern crate glfw_sys;
extern crate glutin;
extern crate grr;
extern crate image;
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

use std::borrow::BorrowMut;
use std::ffi::{c_void, CStr, CString};
use std::io::{Cursor, Write};
use std::os::raw::c_char;
use std::ptr;
use std::slice;
use std::sync::{Arc, PoisonError, RwLockReadGuard};
use std::sync::Mutex;
use std::sync::RwLock;
use std::thread;
use std::time::Duration;

use glium::{Display, Surface};
use glium::glutin::event::{Event, StartCause};
use glium::glutin::event_loop::{ControlFlow, EventLoop};
use glium::Texture2d;
use glium::texture::RawImage2d;
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

use conversion::TextureData2d;
use k4a_sys_wrapper::Device;
use k4a_sys_wrapper::device_get_installed_count;
use k4a_sys_wrapper::Image;
use sensor_control::{capture_thread_to_texture, grab_single_frame, CaptureProvider, capture_thread};
use std::fs::File;
use rand::Rng;

pub mod conversion;
pub mod graphics_gl;
pub mod graphics_imgui;
pub mod k4a_sys_wrapper;
pub mod old_graphics_libraries;
pub mod imgui_support;
pub mod opengl;
pub mod old_k4a_wrapper;
pub mod opengl_wrapper;
pub mod point_cloud;
pub mod sensor_control;

pub fn main() {
  /*let device = Device::open(0).expect("Device should open");

  let depth_mode : k4a_sys::k4a_depth_mode_t = 2; //k4a_sys::K4A_DEPTH_MODE_NFOV_UNBINNED;
  let color_format: k4a_sys::k4a_color_resolution_t = k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_2160P;

  let calibration = device.get_calibration(depth_mode, color_format).unwrap();

  let capture_provider = Arc::new(CaptureProvider::new());
  let capture_provider2= capture_provider.clone();

  thread::spawn(move || capture_thread(capture_provider, Some(device)));

  graphics_imgui::run(capture_provider2, calibration);*/

  let mut rng = rand::thread_rng();
  let mut file = File::create("/dev/video7").expect("write");

  println!("Streaming...");

  loop {
    let mut buffer = Vec::<u8>::with_capacity(1024);
    for _ in 0..buffer.capacity() {
      buffer.push(rng.gen_range(0, 255));
    }
    file.write(&buffer).expect("work");
  }

  println!("Done");


}
