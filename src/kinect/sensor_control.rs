use std::sync::Arc;
use std::sync::Mutex;

use image::DynamicImage;
use opencv::prelude::*;

use image_debug::depth_to_image;
use kinect::k4a_sys_wrapper::device_get_installed_count;
use kinect::k4a_sys_wrapper::{Capture, Device};

/** Self-locking holder of Capture objects. */
pub struct CaptureProvider {
  capture: Arc<Mutex<Option<Capture>>>,
}

impl CaptureProvider {
  pub fn new() -> Self {
    CaptureProvider {
      capture: Arc::new(Mutex::new(None)),
    }
  }

  /**
   * Take the latest capture, if available, through interior mutability.
   * This leaves the mutex holding None.
   */
  pub fn get_capture(&self) -> Option<Capture> {
    self.capture.lock()
        .ok()
        .and_then(|mut lock| lock.take())
  }

  /**
   * Consume capture and replace whatever we currently hold.
   */
  pub fn set_capture(&self, capture: Capture) {
    match self.capture.lock() {
      Ok(mut lock) => {
        *lock = Some(capture)
      },
      Err(_) => {},
    }
  }
}

pub fn capture_thread(capture_provider: Arc<CaptureProvider>, device: Option<Device>) {
  let device = match device {
    Some(device) => device,
    None => {
      let installed_devices = device_get_installed_count();
      println!("Installed devices: {}", installed_devices);

      let device = Device::open(0).unwrap();
      println!("Device: {:?}", device);
      device
    },
  };

  let serial_number = device.get_serial_number().unwrap();
  println!("Device: {:?}", serial_number);

  println!("Starting cameras...");
  device.start_cameras().unwrap();

  loop {
    let capture = device.get_capture(1000)
        .expect("Should be able to get frame capture.");

    capture_provider.set_capture(capture);
  }
}
