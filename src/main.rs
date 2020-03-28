#[macro_use] extern crate enum_primitive;
extern crate libc;

pub mod wrapper;

use libc::size_t;
use wrapper::*;

pub fn main() {
  println!("hello world");
  let device_count = unsafe { k4a_device_get_installed_count() };

  println!("Device count: {}", device_count);

  println!("opening device...");
  let mut device_handle: size_t = size_t::default();

  let result = unsafe {
    k4a_device_open(K4A_DEVICE_DEFAULT, &device_handle)
  };

  println!("result: {:?}", result);
  println!("device handle: {:?}", device_handle);

  println!("closing device...");

  unsafe {
    k4a_device_close(&device_handle)
  };

  println!("device handle: {:?}", device_handle);

  println!("done");
}