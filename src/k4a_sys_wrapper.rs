//! Wrappers for the k4a-sys crate to make it easier to use.
//! I tried using the open source 'k4a-rs' crate from the same author,
//! but it's in a bad state and won't compile against any version of 'k4a-sys'.

use k4a_sys;
use std::ffi::{CString, CStr};
use std::ptr;
use handwritten_wrapper::{K4A_DEVICE_DEFAULT, k4a_device_close};
use k4a_sys_wrapper::K4AError::UnableToGetSerialNumber;

pub fn device_get_installed_count() -> u32 {
  unsafe {
    k4a_sys::k4a_device_get_installed_count()
  }
}

/*pub fn device_open() {

    k4a_sys::k4a_device_open(k4a_sys::K4A_DEVICE_DEFAULT)
    if k4a_device_open(device_idx, &mut device) != k4a_buffer_result_t_K4A_BUFFER_RESULT_SUCCEEDED {
      println!("Failed to open device #{}", device_idx);
      continue;
    }
  }
}*/

/// A library error
#[derive(Debug)]
pub enum K4AError {
  UnableToOpen { error_code: u32 },
  UnableToGetSerialNumber,
}

/// A Kinect Device Handle
#[derive(Debug)]
pub struct Device {
  device_pointer: k4a_sys::k4a_device_t,
}

impl Device {
  /// Open a device with the given index
  pub fn open(device_index: u32) -> Result<Self, K4AError> {
    let mut device_pointer: k4a_sys::k4a_device_t = ptr::null_mut();
    unsafe {
      let result = k4a_sys::k4a_device_open(device_index, &mut device_pointer);
      if result != k4a_sys::k4a_buffer_result_t_K4A_BUFFER_RESULT_SUCCEEDED {
        return Err(K4AError::UnableToOpen { error_code: result })
      }
    }
    Ok(Device {
      device_pointer,
    })
  }

  /// Fetch the device serial number.
  pub fn get_serial_number(&self) -> Result<String, K4AError> {
    // First we interrogate the serial number size.
    let mut serial_number_length: usize = 0;

    let result = unsafe {
      k4a_sys::k4a_device_get_serialnum(self.device_pointer, ptr::null_mut(), &mut serial_number_length)
    };

    if result != k4a_sys::k4a_buffer_result_t_K4A_BUFFER_RESULT_TOO_SMALL {
      return Err(K4AError::UnableToGetSerialNumber);
    }

    // Now we request to fill a serial number buffer.
    let mut serial_number = vec![0i8; serial_number_length];
    let serial_number_ptr = (&mut serial_number).as_mut_ptr();

    let result = unsafe {
      k4a_sys::k4a_device_get_serialnum(self.device_pointer, serial_number_ptr, &mut serial_number_length)
    };

    if result != k4a_sys::k4a_buffer_result_t_K4A_BUFFER_RESULT_SUCCEEDED {
      return Err(K4AError::UnableToGetSerialNumber);
    }

    // NB: Library shouldn't be returning i8's
    let serial_number = serial_number.iter().map(|v| *v as u8).collect();

    String::from_utf8(serial_number)
        .map(|s| s.trim_matches(char::from(0)).into()) // Remove trailing null byte
        .map_err(|_| K4AError::UnableToGetSerialNumber)
  }
}

/// Deallocate open device handles
impl Drop for Device {
  fn drop(&mut self) {
    unsafe {
      k4a_sys::k4a_device_close(self.device_pointer);
    }
  }
}
