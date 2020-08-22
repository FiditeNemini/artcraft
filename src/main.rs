#![allow(warnings)]

#[macro_use] extern crate clap;
#[macro_use] extern crate glium;
#[macro_use] extern crate imgui;

extern crate anyhow;
extern crate arcball;
extern crate cgmath;
extern crate clipboard;
extern crate gl;
extern crate glfw;
extern crate glfw_sys;
extern crate image;
extern crate imgui_glium_renderer;
extern crate imgui_opengl_renderer;
extern crate imgui_sdl2;
extern crate imgui_winit_support;
extern crate k4a_sys;
extern crate libc;
extern crate opencv;
extern crate rand;
extern crate sdl2;
extern crate tobj;
extern crate winit;
extern crate gltf;

use std::sync::Arc;
use std::thread;

use opencv::prelude::*;

use anyhow::Result as AnyhowResult;
use anyhow::bail;
use kinect::k4a_sys_wrapper::{Device, Calibration};
use kinect::sensor_control::capture_thread;
use kinect::capture::multi_device_capturer::{MultiDeviceCapturer, start_capture_thread};
use kinect::capture::fake_device_capturer::FakeDeviceCaptureProvider;
use kinect::capture::device_capturer::CaptureProvider;
use clap::{Clap};

pub mod assets;
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

#[derive(Clap, Debug)]
struct Opts {
  #[clap(long, parse(try_from_str = true_or_false), default_value = "true")]
  pub enable_cameras: bool,
  #[clap(long, parse(try_from_str = true_or_false), default_value = "false")]
  pub enable_webcam: bool,
  #[clap(long, parse(try_from_str = true_or_false), default_value = "false")]
  pub save_captures: bool,
}

fn true_or_false(s: &str) -> Result<bool, &'static str> {
  match s {
    "true" => Ok(true),
    "false" => Ok(false),
    _ => Err("expected `true` or `false`"),
  }
}

/// Arguments to pass through the program
pub struct ProgramArgs {
  pub save_captures: bool,
  pub enable_webcam_output_writing: bool,
}

pub fn main() -> AnyhowResult<()> {
  let opts = Opts::parse();

  println!("opts: {:?}", opts);

  // Validate args.
  if opts.save_captures && !opts.enable_cameras {
    bail!("Can't save captures without cameras enabled.");
  }

  let program_args = ProgramArgs {
    enable_webcam_output_writing: opts.enable_webcam,
    save_captures: opts.save_captures,
  };

  let capture_provider: Arc<dyn CaptureProvider> = if opts.enable_cameras {
    let multi_device = MultiDeviceCapturer::new(2, Some(1))
        .expect("multi-device create");

    multi_device.start_cameras().expect("start cameras");

    let capture_provider = multi_device.get_sync_capture_provider();

    thread::spawn(move || start_capture_thread(multi_device));

    capture_provider
  } else {
    Arc::new(FakeDeviceCaptureProvider::new().unwrap())
  };

  let calibration = capture_provider.get_calibration().clone();
  //calibration.debug_print();

  graphics_imgui::run(capture_provider, calibration, program_args);

  Ok(())
}
