
use kinect::k4a_sys_wrapper::{Device, KinectError};

// Allowing at least 160 microseconds between depth cameras should ensure they do not interfere with one another.
const MIN_TIME_BETWEEN_DEPTH_CAMERA_PICTURES_USEC : libc::int32_t = 160;

pub struct MultiDeviceCapturer {
  pub primary_device: Device,  // TODO: Temporary public viz
  secondary_devices: Vec<Device>
}

impl MultiDeviceCapturer {

  // TODO: Don't panic everywere.
  /// Open the primary and secondary devices.
  pub fn new(num_devices: u32) -> Result<Self, KinectError> {
    let mut primary_device = None;
    let mut secondary_devices = Vec::new();

    for i in 0..num_devices {
      let mut device = Device::open(i)?;
      let jack_status = device.get_synchronization_jack_status()?;

      if jack_status.sync_out_jack_connected && !jack_status.sync_in_jack_connected {
        if primary_device.is_some() {
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

    Ok(Self {
      primary_device: primary_device.unwrap(),
      secondary_devices,
    })
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

