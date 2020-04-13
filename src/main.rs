#![allow(warnings)]

#[macro_use] extern crate enum_primitive;
extern crate genmesh;
#[macro_use] extern crate glium;
extern crate glutin;
extern crate grr;
extern crate image;
extern crate k4a_sys;
extern crate libc;
extern crate obj;
extern crate opencv;

use std::borrow::BorrowMut;
use std::ffi::{c_void, CStr, CString};
use std::io::Cursor;
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
use graphics_glium::run_glium;
use k4a_sys_wrapper::Device;
use k4a_sys_wrapper::device_get_installed_count;
use k4a_sys_wrapper::Image;
use sensor_control::{capture_thread_to_texture, grab_single_frame, CaptureProvider, capture_thread};

pub mod conversion;
pub mod graphics_glium;
pub mod graphics_grr;
pub mod old_k4a_wrapper;
pub mod k4a_sys_wrapper;
pub mod sensor_control;

pub fn main() {
  let capture_provider = Arc::new(CaptureProvider::new());
  let capture_provider2= capture_provider.clone();

  thread::spawn(move || capture_thread(capture_provider));

  graphics_grr::run(capture_provider2).unwrap();
  //graphics_glium::run_glium();
}
