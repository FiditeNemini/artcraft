use crate::kinect::k4a_sys_wrapper::Calibration;
use crate::point_cloud::debug::capture_proxy::CaptureProxy;

pub trait CaptureProvider {

  /** Return the number of cameras. */
  fn get_num_cameras(&self) -> usize;

  /**
   * Take the latest captures, if available, through interior mutability.
   * This leaves the mutex holding an empty vec.
   */
  fn get_captures(&self) -> Option<Vec<CaptureProxy>>;

  /** Get device calibration (from one of the cameras). */
  fn get_calibration(&self) -> &Calibration;
}
