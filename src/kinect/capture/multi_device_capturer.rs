use kinect::k4a_sys_wrapper::{Device, KinectError, Capture, CaptureError, GetCaptureError};
use std::sync::Arc;
use std::sync::Mutex;
use kinect::capture::device_capturer::CaptureProvider;
use point_cloud::debug::capture_proxy::CaptureProxy;

// Allowing at least 160 microseconds between depth cameras should ensure they do not interfere with one another.
const MIN_TIME_BETWEEN_DEPTH_CAMERA_PICTURES_USEC : libc::int32_t = 160;

pub struct MultiDeviceCapturer {
  num_cameras: usize,
  pub primary_device: Device,  // TODO: Temporary public viz
  secondary_devices: Vec<Device>,
  capture_provider: Arc<MultiDeviceCaptureProvider>,
}

pub struct MultiDeviceCaptureProvider {
  num_cameras: usize,
  captures: Arc<Mutex<Vec<Capture>>>, // TODO: Shouldn't need to wrap in mutex if we wrap struct instead.
}

impl MultiDeviceCapturer {

  // TODO: Don't panic everywere.
  /// Open the primary and secondary devices.
  pub fn new(num_devices: u32, limit_secondary_devices: Option<usize>) -> Result<Self, KinectError> {
    let mut primary_device = None;
    let mut secondary_devices = Vec::new();

    for i in 0..num_devices {
      let mut device = Device::open(i)?;
      let jack_status = device.get_synchronization_jack_status()?;

      if jack_status.sync_out_jack_connected && !jack_status.sync_in_jack_connected {
        if primary_device.is_some() {
          // NB: This assumes a daisy chain topology.
          panic!("We already one primary device. We can't have two.");
        }
        primary_device = Some(device);
        continue;
      }

      if !jack_status.sync_in_jack_connected {
        panic!("Secondary device does not have 'in' jack connected!");
      }

      secondary_devices.push(device);
    }

    if primary_device.is_none() {
      panic!("Could not find primary device!");
    }

    if let Some(limit) = limit_secondary_devices {
      secondary_devices.truncate(limit);
    }

    let num_cameras = 1 + secondary_devices.len();

    Ok(Self {
      num_cameras,
      primary_device: primary_device.expect("There must be a primary device"),
      secondary_devices,
      capture_provider: Arc::new(MultiDeviceCaptureProvider::new(num_cameras)),
    })
  }

  /// Return the number of cameras
  pub fn get_num_cameras(&self) -> usize {
    self.num_cameras
  }

  // TODO:
  //  Per Microsoft's "green screen" example, it's possible to differentially configure things such
  //  as exposure, but we won't consider that at the moment. When we do, there is a lot of good
  //  documentation in the 'green_screen' source code that speaks to important timing delay
  //  considerations.
  /// Start cameras all with the same configuration
  pub fn start_cameras(&self) -> Result<(), KinectError> {
    let secondary_config = get_secondary_device_config();

    // NB: Secondary devices *MUST* be started before the master!
    for device in self.secondary_devices.iter() {
      device.start_cameras(secondary_config)?;
    }

    // Once the secondaries start, we can start the primary.
    let primary_config = get_primary_device_config();
    self.primary_device.start_cameras(primary_config)?;

    Ok(())
  }

  pub fn get_synchronized_captures(&self) -> Result<Vec<Capture>, GetCaptureError> {
    let mut captures = Vec::with_capacity(1 + self.secondary_devices.len());

    // TODO: -1 is K4A_WAIT_INDEFINITE
    let capture = self.primary_device.get_capture(-1)?;
    captures.push(capture);

    for device in self.secondary_devices.iter() {
      let capture = device.get_capture(-1)?;
      captures.push(capture);
    }

    // TODO TODO TODO - Lots of sync logic goes here
    // TODO TODO TODO - Lots of sync logic goes here
    // TODO TODO TODO - Lots of sync logic goes here
    // TODO TODO TODO - Lots of sync logic goes here

    Ok(captures)
  }

  /// Get a capture provider for another thread
  pub fn get_sync_capture_provider(&self) -> Arc<MultiDeviceCaptureProvider> {
    self.capture_provider.clone()
  }
}

impl MultiDeviceCaptureProvider {
  pub fn new(num_cameras: usize) -> Self {
    Self {
      num_cameras,
      captures: Arc::new(Mutex::new(Vec::new())),
    }
  }

  /**
   * Consume captures and replace whatever we currently hold.
   */
  pub fn set_captures(&self, captures: Vec<Capture>) {
    match self.captures.lock() {
      Ok(mut lock) => {
        *lock = captures;
      },
      Err(_) => {},
    }
  }
}

impl CaptureProvider for MultiDeviceCaptureProvider {

  /** Return the number of cameras. */
  fn get_num_cameras(&self) -> usize {
    self.num_cameras
  }

  /**
   * Take the latest captures, if available, through interior mutability.
   * This leaves the mutex holding an empty vec.
   */
  fn get_captures(&self) -> Option<Vec<CaptureProxy>> {
    self.captures.lock()
        .ok()
        .map(|mut v| (*v).split_off(0))
        .map(|mut captures| captures.into_iter()
            .map(|capture| CaptureProxy::consume_k4a_capture(capture))
            .collect())
  }
}

pub fn start_capture_thread(capturer: MultiDeviceCapturer) {
  let mut capture_provider = capturer.get_sync_capture_provider();

  loop {
    let captures = capturer.get_synchronized_captures()
        .expect("Should get captures");

    capture_provider.set_captures(captures);
  }
}

fn get_primary_device_config() -> k4a_sys::k4a_device_configuration_t {
  let mut config = get_default_device_config();
  config.wired_sync_mode = k4a_sys::k4a_wired_sync_mode_t_K4A_WIRED_SYNC_MODE_MASTER;
  config.synchronized_images_only = true;

  // Two depth images should be seperated by MIN_TIME_BETWEEN_DEPTH_CAMERA_PICTURES_USEC to ensure the depth imaging
  // sensor doesn't interfere with the other. To accomplish this the master depth image captures
  // (MIN_TIME_BETWEEN_DEPTH_CAMERA_PICTURES_USEC / 2) before the color image, and the subordinate camera captures its
  // depth image (MIN_TIME_BETWEEN_DEPTH_CAMERA_PICTURES_USEC / 2) after the color image. This gives us two depth
  // images centered around the color image as closely as possible.
  config.depth_delay_off_color_usec = -(MIN_TIME_BETWEEN_DEPTH_CAMERA_PICTURES_USEC / 2);

  // TODO: These are the old values I used that are NOT in 'green_screen'.
  //  They may need to be adjusted
  config.color_resolution = k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_2160P;
  config.depth_mode = k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_NFOV_UNBINNED;
  //config.camera_fps = k4a_sys::k4a_fps_t_K4A_FRAMES_PER_SECOND_30;

  config
}

fn get_secondary_device_config() -> k4a_sys::k4a_device_configuration_t {
  let mut config = get_default_device_config();
  config.wired_sync_mode = k4a_sys::k4a_wired_sync_mode_t_K4A_WIRED_SYNC_MODE_SUBORDINATE;

  // Two depth images should be seperated by MIN_TIME_BETWEEN_DEPTH_CAMERA_PICTURES_USEC to ensure the depth imaging
  // sensor doesn't interfere with the other. To accomplish this the master depth image captures
  // (MIN_TIME_BETWEEN_DEPTH_CAMERA_PICTURES_USEC / 2) before the color image, and the subordinate camera captures its
  // depth image (MIN_TIME_BETWEEN_DEPTH_CAMERA_PICTURES_USEC / 2) after the color image. This gives us two depth
  // images centered around the color image as closely as possible.
  config.depth_delay_off_color_usec = MIN_TIME_BETWEEN_DEPTH_CAMERA_PICTURES_USEC / 2;

  // TODO: These are the old values I used that are NOT in 'green_screen'.
  //  They may need to be adjusted
  config.color_resolution = k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_2160P;
  config.depth_mode = k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_NFOV_UNBINNED;
  //config.camera_fps = k4a_sys::k4a_fps_t_K4A_FRAMES_PER_SECOND_30;

  config
}


/// Sensible shared defaults
fn get_default_device_config() -> k4a_sys::k4a_device_configuration_t {
  k4a_sys::k4a_device_configuration_t {
    color_format : k4a_sys::k4a_image_format_t_K4A_IMAGE_FORMAT_COLOR_BGRA32,
    color_resolution : k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_720P,
    // No need for depth during calibration
    // TODO: We need it.
    depth_mode : k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_WFOV_UNBINNED,
    // Don't use all USB bandwidth
    // TODO: This will be a problem.
    camera_fps : k4a_sys::k4a_fps_t_K4A_FRAMES_PER_SECOND_15,
    // Must be zero for master
    subordinate_delay_off_master_usec : 0,
    synchronized_images_only : true,

    // These fields were not set and come from `K4A_DEVICE_CONFIG_INIT_DISABLE_ALL`:
    depth_delay_off_color_usec: 0,
    disable_streaming_indicator: false,
    wired_sync_mode: k4a_sys::k4a_wired_sync_mode_t_K4A_WIRED_SYNC_MODE_STANDALONE,
  }
}

