//! Wrappers for the k4a-sys crate to make it easier to use.
//! I tried using the open source 'k4a-rs' crate from the same author,
//! but it's in a bad state and won't compile against any version of 'k4a-sys'.

use std::ffi::{CStr, CString};
use std::ptr;

use k4a_sys;

use handwritten_wrapper::{k4a_device_close, K4A_DEVICE_DEFAULT};

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

// TODO: this is kind of lame.
/// A library error
#[derive(Debug)]
pub enum KinectError {
  UnableToOpen { error_code: u32 },
  UnableToGetSerialNumber,
  UnableToStartCameras { error_code: u32 },
}

/// A Kinect Device Handle
#[derive(Debug)]
pub struct Device {
  device_pointer: k4a_sys::k4a_device_t,
}

impl Device {
  /// Open a device with the given index
  pub fn open(device_index: u32) -> Result<Self, KinectError> {
    let mut device_pointer: k4a_sys::k4a_device_t = ptr::null_mut();
    unsafe {
      let result = k4a_sys::k4a_device_open(device_index, &mut device_pointer);
      if result != k4a_sys::k4a_buffer_result_t_K4A_BUFFER_RESULT_SUCCEEDED {
        return Err(KinectError::UnableToOpen { error_code: result })
      }
    }
    Ok(Device {
      device_pointer,
    })
  }

  /// Fetch the device serial number.
  pub fn get_serial_number(&self) -> Result<String, KinectError> {
    // First we interrogate the serial number size.
    let mut serial_number_length: usize = 0;

    let result = unsafe {
      k4a_sys::k4a_device_get_serialnum(self.device_pointer, ptr::null_mut(), &mut serial_number_length)
    };

    if result != k4a_sys::k4a_buffer_result_t_K4A_BUFFER_RESULT_TOO_SMALL {
      return Err(KinectError::UnableToGetSerialNumber);
    }

    // Now we request to fill a serial number buffer.
    let mut serial_number = vec![0i8; serial_number_length];
    let serial_number_ptr = (&mut serial_number).as_mut_ptr();

    let result = unsafe {
      k4a_sys::k4a_device_get_serialnum(self.device_pointer, serial_number_ptr, &mut serial_number_length)
    };

    if result != k4a_sys::k4a_buffer_result_t_K4A_BUFFER_RESULT_SUCCEEDED {
      return Err(KinectError::UnableToGetSerialNumber);
    }

    // NB: Library shouldn't be returning i8's
    let serial_number = serial_number.iter().map(|v| *v as u8).collect();

    String::from_utf8(serial_number)
        .map(|s| s.trim_matches(char::from(0)).into()) // Remove trailing null byte
        .map_err(|_| KinectError::UnableToGetSerialNumber)
  }

  // TODO: Pass options.
  /// Start the cameras.
  pub fn start_cameras(&self) -> Result<(), KinectError> {
    let mut device_config = DeviceConfiguration::new();
    // NB: Although the Kinect docs say this format isn't natively supported by the color camera
    // and that extra CPU is required, this is the only color mode supported by 'k4aviewer' 3D view.
    device_config.0.color_format = k4a_sys::k4a_image_format_t_K4A_IMAGE_FORMAT_COLOR_BGRA32;
    device_config.0.color_resolution = k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_2160P;
    device_config.0.depth_mode = k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_NFOV_UNBINNED;
    device_config.0.camera_fps = k4a_sys::k4a_fps_t_K4A_FRAMES_PER_SECOND_30;

    let result = unsafe {
      k4a_sys::k4a_device_start_cameras(self.device_pointer, &device_config.0)
    };

    if result != k4a_sys::k4a_buffer_result_t_K4A_BUFFER_RESULT_SUCCEEDED {
      return Err(KinectError::UnableToStartCameras { error_code: result });
    }

    return Ok(())
  }

  /// Stops the color and depth camera capture.
  ///
  /// The streaming of individual sensors stops as a result of this call. Once called,
  /// k4a_device_start_cameras() may be called again to resume sensor streaming.
  /// This function may be called while another thread is blocking in k4a_device_get_capture().
  /// Calling this function while another thread is in that function will result in that function
  /// returning a failure.
  pub fn stop_cameras(&self) {
    unsafe {
      k4a_sys::k4a_device_stop_cameras(self.device_pointer)
    }
  }

  /// Get capture and return a new buffer.
  pub fn get_capture(&self, timeout_ms: i32) -> Result<Capture, GetCaptureError> {
    let mut capture_buffer: k4a_sys::k4a_capture_t = ptr::null_mut();
    self.get_capture_buffered(&mut capture_buffer, timeout_ms)
        .map(|_| Capture(capture_buffer)) // TODO: Can capture be null?
  }

  /// Get capture and reuse an existing buffer.
  pub fn get_capture_buffered(&self, capture_buffer: &mut k4a_sys::k4a_capture_t, timeout_ms: i32)
      -> Result<(), GetCaptureError>
  {
    let timeout_millis = 1000;

    let result = unsafe {
      k4a_sys::k4a_device_get_capture(self.device_pointer, capture_buffer, timeout_ms)
    };

    match result {
      k4a_sys::k4a_wait_result_t_K4A_WAIT_RESULT_SUCCEEDED  => { /* ok, continue */ },
      k4a_sys::k4a_wait_result_t_K4A_WAIT_RESULT_TIMEOUT => {
        return Err(GetCaptureError::TimeoutError);
      },
      k4a_sys::k4a_wait_result_t_K4A_WAIT_RESULT_FAILED => {
        return Err(GetCaptureError::TimeoutError);
      }
      _ => {
        return Err(GetCaptureError::UnknownError(result));
      }
    }

    Ok(())
  }
}

/// Errors for GetCapture
#[derive(Debug)]
pub enum GetCaptureError {
  TimeoutError,
  FailedError,
  UnknownError(u32),
}

#[derive(Debug)]
pub enum CaptureError {
  NullCapture,
}

/// Adapted from k4a-sys. Represents a capture.
#[derive(Debug)]
pub struct Capture(pub k4a_sys::k4a_capture_t);

impl Capture {
  pub fn get_depth_image(&self) -> Result<Image, CaptureError> {
    let image = unsafe {
      k4a_sys::k4a_capture_get_depth_image(self.0)
    };
    if image.is_null() {
      return Err(CaptureError::NullCapture);
    }
    Ok(Image(image))
  }

  pub fn get_color_image(&self) -> Result<Image, CaptureError> {
    let image = unsafe {
      k4a_sys::k4a_capture_get_color_image(self.0)
    };
    if image.is_null() {
      return Err(CaptureError::NullCapture);
    }
    Ok(Image(image))
  }

  pub fn get_ir_image(&self) -> Result<Image, CaptureError> {
    let image = unsafe {
      k4a_sys::k4a_capture_get_ir_image(self.0)
    };
    if image.is_null() {
      return Err(CaptureError::NullCapture);
    }
    Ok(Image(image))
  }
}

/// Adapted from k4a-sys. Represents an image within a capture.
#[derive(Debug)]
pub struct Image(pub k4a_sys::k4a_image_t);

impl Image {
  pub fn get_height_pixels(&self) -> usize {
    unsafe {
      k4a_sys::k4a_image_get_height_pixels(self.0) as usize
    }
  }

  pub fn get_width_pixels(&self) -> usize {
    unsafe {
      k4a_sys::k4a_image_get_width_pixels(self.0) as usize
    }
  }

  pub fn get_stride_bytes(&self) -> usize {
    unsafe {
      k4a_sys::k4a_image_get_stride_bytes(self.0) as usize
    }
  }

  pub fn get_size(&self) -> usize {
    unsafe {
      k4a_sys::k4a_image_get_size(self.0) // returns size_t
    }
  }

  pub fn get_buffer(&self) -> *mut u8 {
    unsafe {
      k4a_sys::k4a_image_get_buffer(self.0)
    }
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

impl Drop for Capture {
  fn drop(&mut self) {
    unsafe {
      k4a_sys::k4a_capture_release(self.0);
    }
  }
}

impl Drop for Image {
  fn drop(&mut self) {
    unsafe {
      k4a_sys::k4a_image_release(self.0);
    }
  }
}

/// Copied from k4a-sys
pub struct DeviceConfiguration (k4a_sys::k4a_device_configuration_t);

/// Copied from k4a-sys
impl DeviceConfiguration {
  pub fn new() -> Self {
    Self (k4a_sys::k4a_device_configuration_t {
      color_format: k4a_sys::k4a_image_format_t_K4A_IMAGE_FORMAT_COLOR_MJPG,
      color_resolution: k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_720P,
      depth_mode: k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_WFOV_2X2BINNED,
      camera_fps: 0,
      synchronized_images_only: false,
      depth_delay_off_color_usec: 0,
      wired_sync_mode: 0,
      subordinate_delay_off_master_usec: 0,
      disable_streaming_indicator: false,
    })
  }
}
