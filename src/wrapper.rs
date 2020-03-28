use libc::size_t;
use std::os::raw::c_char;

/// Default device index
///
/// Remarks:
/// Passed as an argument to k4a_device_open() to open the default sensor
pub const K4A_DEVICE_DEFAULT: u32 = 0;

#[link(name="k4a")]
extern {
  /// Get number of Kinect devices
  pub fn k4a_device_get_installed_count() -> u32;

  /*
  NB(bt): Device handles are declared with the following macro:

  #define K4A_DECLARE_HANDLE(_handle_name_)                                                                              \
    typedef struct _##_handle_name_                                                                                    \
    {                                                                                                                  \
        size_t _rsvd; /**< Reserved, do not use. */                                                                    \
    } * _handle_name_;
  */

  /// Open an Azure Kinect device.
  ///
  /// Returns:
  /// K4A_RESULT_SUCCEEDED if the device was opened successfully.
  ///
  /// Remarks:
  /// If successful, k4a_device_open() will return a device handle in the device_handle parameter.
  /// This handle grants exclusive access to the device and may be used in the other Azure Kinect
  /// API calls.
  /// When done with the device, close the handle with k4a_device_close()
  pub fn k4a_device_open(index: u32, device_handle: *mut k4a_device_t) -> k4a_result_t;

  /// Closes an Azure Kinect device.
  ///
  /// Remarks:
  /// Once closed, the handle is no longer valid.
  /// Before closing the handle to the device, ensure that all k4a_capture_t captures
  /// have been released with k4a_capture_release().
  pub fn k4a_device_close(device_handle: *mut k4a_device_t);


  pub fn k4a_device_get_serialnum(//k4a_device_t  	device_handle,
                                  device_handle: *const k4a_device_t,
                                  //char *  	serial_number,
                                  serial_number: *mut c_char,
                                  //size_t *  	serial_number_size
                                  serial_number_size: *mut size_t) -> k4a_buffer_result_t;
}

enum_from_primitive! {
#[derive(Debug, PartialEq)]
pub enum k4a_result_t {
  K4A_RESULT_SUCCEEDED = 0,
  K4A_RESULT_FAILED,
}
}

/// Result code returned by Azure Kinect APIs.
enum_from_primitive! {
#[derive(Debug, PartialEq)]
pub enum k4a_buffer_result_t {
  /// The result was successful.
  K4A_BUFFER_RESULT_SUCCEEDED,
  /// The result was a failure.
  K4A_BUFFER_RESULT_FAILED,
  /// The input buffer was too small.
  K4A_BUFFER_RESULT_TOO_SMALL,
}
}


// Opaque device handle
//#[no_mangle]
#[derive(Debug,Default)]
#[repr(C)]
pub struct k4a_device_t {
  pub _rsvd: size_t,
}
