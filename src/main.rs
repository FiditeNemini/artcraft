#[macro_use] extern crate enum_primitive;
extern crate libc;

pub mod wrapper;

use libc::size_t;
use wrapper::*;
use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::borrow::BorrowMut;

pub fn main() {
  println!("hello world");
  let device_count = unsafe { k4a_device_get_installed_count() };

  println!("Device count: {}", device_count);

  println!("opening device...");
  let mut device_handle : k4a_device_t = unsafe { std::mem::zeroed() };

  println!("[before] device handle: {:?}", device_handle);

  let result = unsafe {
    k4a_device_open(K4A_DEVICE_DEFAULT, &mut device_handle)
  };
  /*
  let result = unsafe {
    let mut handle = std::mem::MaybeUninit::uninit();
    let result = k4a_device_open(K4A_DEVICE_DEFAULT, handle.as_mut_ptr());

    device_handle = handle.assume_init().read();
    //device_handle = std::mem::take(&mut handle.read());
    result
  };
  let result = unsafe {
    let mut mut_ref : *mut k4a_device_t = &mut device_handle;
    //let dbl_mut : *mut &mut k4a_device_t = &mut mut_ref;
    k4a_device_open(K4A_DEVICE_DEFAULT, &mut mut_ref)
  };
  */

  println!("result: {:?}", result);
  println!("device handle: {:?}", device_handle);
  unsafe { println!("&device handle: {:?}", &device_handle); }

  get_serial_number(device_handle);

  println!("closing device...");
  unsafe {
    k4a_device_close(device_handle)
  };

  println!("done!");
}

fn get_serial_number(device_handle: k4a_device_t) {
  // We first interrogate the size (and don't return a serial number).
  let mut serial_size : size_t = 0;

  println!("getting serial size...");
  let result = unsafe {
    k4a_device_get_serialnum(device_handle, std::ptr::null_mut(), &mut serial_size)
  };

  println!("result: {:?}", result);
  println!("serial size: {:?}", serial_size);

  println!("getting serial value...");
  let mut message_bytes : Vec<c_char> = vec![c_char::default(); serial_size];
  let result = unsafe {
    k4a_device_get_serialnum(device_handle, message_bytes.as_mut_ptr(), &mut serial_size)
  };
  println!("result: {:?}", result);
  println!("serial size: {:?}", serial_size);

  // Careful not to produce a double-free:
  let mut serial = unsafe { CString::from_raw(message_bytes.as_mut_ptr()).clone() };
  println!("serial: {:?}", serial);
}