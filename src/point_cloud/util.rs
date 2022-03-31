use crate::point_cloud::pixel_structs::{DepthPixel, BgraPixel};
use imgui::sys::igColorConvertHSVtoRGB;
use k4a_sys_temp as k4a_sys;

/// Ranges of values we can expect from the depth sensor, depending on its current configuration.
pub struct ValueRange {
  /// Lowest (nearest) value reported from the depth sensor in millimeters.
  pub near: DepthPixel,
  /// Highest (furthest) value reported from the depth sensor in millimeters.
  pub far: DepthPixel,
}

/// Gets the range of values that we expect to see from the depth camera
/// when using a given depth mode, in millimeters
pub fn get_depth_mode_range(depth_mode: k4a_sys::k4a_depth_mode_t) -> Option<ValueRange> {
  match depth_mode {
    k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_NFOV_2X2BINNED => Some(ValueRange { near: 500, far: 5800 }),
    k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_NFOV_UNBINNED => Some(ValueRange { near: 500, far: 4000 }),
    k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_WFOV_2X2BINNED => Some(ValueRange { near: 250, far: 3000 }),
    k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_WFOV_UNBINNED  => Some(ValueRange { near: 250, far: 2500 }),
    k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_PASSIVE_IR => None, // TODO: Return error
    _ => None, // TODO: Return error
  }
}

/// This is a port of Microsoft's `ColorizeBlueToRed` in the open source / MIT-licensed libk4a
pub fn colorize_depth_blue_to_red(depth_pixel: DepthPixel, value_range: &ValueRange) -> BgraPixel {
  let  pixel_max = libc::uint8_t::max_value();

  let mut result = BgraPixel { blue: 0, green: 0, red: 0, alpha: pixel_max };

  if depth_pixel == 0 {
    // If the pixel is actually zero and not just below the min value, make it black.
    return result;
  }

  let clamped_value = depth_pixel
      .min(value_range.far)
      .max(value_range.near);

  // Normalize to [0, 1]
  let mut hue = (clamped_value - value_range.near) as f32 / (value_range.far - value_range.near) as f32;

  // The 'hue' coordinate in HSV is a polar coordinate, so it 'wraps'.
  // Purple starts after blue and is close enough to red to be a bit unclear,
  // so we want to go from blue to red.  Purple starts around .6666667,
  // so we want to normalize to [0, .6666667].
  let range = 2.0f32 / 3.0;
  hue *= range;

  // We want blue to be close and red to be far, so we need to reflect the
  // hue across the middle of the range.
  hue = range - hue;

  let mut red = 0.0f32;
  let mut green= 0.0f32;
  let mut blue = 0.0f32;

  unsafe {
    igColorConvertHSVtoRGB(hue, 1.0, 1.0, &mut red, &mut green, &mut blue);
  }

  let pixel_max = pixel_max as f32;
  result.red = (red * pixel_max) as u8;
  result.green = (green * pixel_max) as u8;
  result.blue = (blue * pixel_max) as u8;

  result
}