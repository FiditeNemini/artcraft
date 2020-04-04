#[macro_use] extern crate enum_primitive;
extern crate libc;
extern crate k4a_sys;

pub mod handwritten_wrapper;
pub mod handwritten_wrapper_test;
pub mod k4a_sys_wrapper;

use libc::size_t;
use handwritten_wrapper::*;
use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::borrow::BorrowMut;
use std::thread;

use k4a_sys_wrapper::device_get_installed_count;
use k4a_sys_wrapper::Device;
use std::time::Duration;

pub fn main() {
  let installed_devices = device_get_installed_count();
  println!("Installed devices: {}", installed_devices);

  {
    let device = Device::open(0).unwrap();
    println!("Device: {:?}", device);
    let serial_number = device.get_serial_number().unwrap();
    println!("Device: {:?}", serial_number);

    println!("Starting cameras...");
    device.start_cameras().unwrap();

    thread::sleep(Duration::from_secs(5));
    
    println!("Stopping cameras...");
    device.stop_cameras();
  }

  handwritten_wrapper_test::test_integration();
}

