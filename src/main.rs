#[macro_use] extern crate enum_primitive;
extern crate libc;

pub mod wrapper;

use libc::size_t;
use wrapper::*;
use std::ffi::{CStr, CString};
use std::os::raw::c_char;

pub fn main() {
  println!("hello world");
  let device_count = unsafe { k4a_device_get_installed_count() };

  println!("Device count: {}", device_count);

  println!("opening device...");
  let mut device_handle = k4a_device_t::default();

  println!("[before] device handle: {:?}", device_handle);

  let result = unsafe {
    k4a_device_open(K4A_DEVICE_DEFAULT, &mut device_handle)
  };

  println!("result: {:?}", result);
  println!("device handle: {:?}", device_handle);
  unsafe { println!("&device handle: {:?}", &device_handle); }

  println!("getting serial number...");
  let mut serial_size : size_t = 13; // experimentally determined - serial size: 13
  let mut message_bytes : Vec<c_char> = vec![c_char::default(); 13];
  let mut serial_number: *const c_char = std::ptr::null();
  let result = unsafe {
    k4a_device_get_serialnum(device_handle, message_bytes.as_mut_ptr(), &mut serial_size)
  };
  println!("result: {:?}", result);
  println!("serial size: {:?}", serial_size);

  let serial = unsafe { CString::from_raw(message_bytes.as_mut_ptr()) };
  println!("serial: {:?}", serial);

  /*println!("closing device...");
  unsafe {
    k4a_device_close(device_handle)
  };*/

  //println!("device handle: {:?}", device_handle);

  println!("done");
}