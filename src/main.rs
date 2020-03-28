#[macro_use] extern crate enum_primitive;
extern crate libc;

pub mod wrapper;

use libc::size_t;
use wrapper::*;
use std::ffi::CStr;
use std::os::raw::c_char;

pub fn main() {
  println!("hello world");
  let device_count = unsafe { k4a_device_get_installed_count() };

  println!("Device count: {}", device_count);

  println!("opening device...");
  let mut device_handle = k4a_device_t {
    _rsvd: 0,
  };

  println!("[before] device handle: {:?}", device_handle);

  let result = unsafe {
    k4a_device_open(K4A_DEVICE_DEFAULT, &mut device_handle)
  };

  println!("result: {:?}", result);
  println!("device handle: {:?}", device_handle);
  unsafe { println!("&device handle: {:?}", &device_handle); }

  /*println!("getting serial number...");
  let mut serial_size : size_t = 0;
  let mut serial_number : c_char = c_char::default();
  let result = unsafe {
    k4a_device_get_serialnum(&device_handle, &mut serial_number, &mut serial_size)
  };
  println!("result: {:?}", result);*/

  println!("closing device...");
  unsafe {
    k4a_device_close(device_handle)
  };

  //println!("device handle: {:?}", device_handle);

  println!("done");
}