use point_cloud::debug::capture_proxy::CaptureProxy;

pub trait CaptureProvider {

  /** Return the number of cameras. */
  fn get_num_cameras(&self) -> usize;

  /**
   * Take the latest captures, if available, through interior mutability.
   * This leaves the mutex holding an empty vec.
   */
  fn get_captures(&self) -> Option<Vec<CaptureProxy>>;
}
