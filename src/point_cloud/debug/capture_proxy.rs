use anyhow::Result as AnyhowResult;
use kinect::k4a_sys_wrapper;
use point_cloud::debug::camera_image_bytes::CameraImageBytes;
use std::sync::{RwLock, Mutex, PoisonError, MutexGuard, Arc};
use winit::event::VirtualKeyCode::Mute;

/// Store either a wrapped capture, or a k4a Capture.
/// Useful for debugging.
#[derive(Clone)]
pub struct CaptureProxy {
  storage: UnderlyingStorage,
}

#[derive(Clone)]
enum UnderlyingStorage {
  CameraImageBytes {
    color_image: CameraImageBytes,
    depth_image: CameraImageBytes,
  },
  K4aCapture {
    capture: k4a_sys_wrapper::Capture,
    color_image: CameraImageBytes,
    depth_image: CameraImageBytes,
  }
}

impl CaptureProxy {

  pub fn from_image_proxy_pair(color_image: CameraImageBytes, depth_image: CameraImageBytes) -> Self {
    Self {
      storage: UnderlyingStorage::CameraImageBytes {
        color_image,
        depth_image,
      }
    }
  }

  pub fn from_k4a_image(capture: &k4a_sys_wrapper::Capture) -> AnyhowResult<Self> {
    // NB: We need to increase the refcount.
    // K4a manages the memory under the hood.
    let capture = capture.clone();

    let color_image = capture.get_color_image()?;
    let depth_image = capture.get_color_image()?;

    // NB: I tried to lazily unpack these, but interior mutability Sync/Send was a nightmare.
    // The poor ergonomics were not worth it.
    let color_image_wrapper = CameraImageBytes::from_k4a_image(&color_image);
    let depth_image_wrapper = CameraImageBytes::from_k4a_image(&depth_image);

    Ok(Self {
      storage: UnderlyingStorage::K4aCapture {
        capture,
        color_image: color_image_wrapper,
        depth_image: depth_image_wrapper,
      }
    })
  }

  pub fn is_k4a(&self) -> bool {
    match &self.storage {
      UnderlyingStorage::CameraImageBytes{ .. } => false,
      UnderlyingStorage::K4aCapture { .. } => true,
    }
  }

  pub fn get_color_image(&self) -> AnyhowResult<&CameraImageBytes> {
    match &self.storage {
      UnderlyingStorage::CameraImageBytes { color_image, .. } => Ok(color_image),
      UnderlyingStorage::K4aCapture{ color_image, .. } => Ok(color_image),
    }
  }

  pub fn get_depth_image(&self) -> AnyhowResult<&CameraImageBytes> {
    match &self.storage {
      UnderlyingStorage::CameraImageBytes { depth_image, .. } => Ok(depth_image),
      UnderlyingStorage::K4aCapture{ depth_image, .. } => Ok(depth_image),
    }
  }
}
