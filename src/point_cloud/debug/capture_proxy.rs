use anyhow::Result as AnyhowResult;
use kinect::k4a_sys_wrapper;
use point_cloud::debug::image_proxy::ImageProxy;
use std::sync::{RwLock, Mutex, PoisonError, MutexGuard, Arc};
use winit::event::VirtualKeyCode::Mute;
use kinect::k4a_sys_wrapper::CaptureError;

/// Store either a wrapped capture, or a k4a Capture.
/// Useful for debugging.
#[derive(Clone)]
pub struct CaptureProxy {
  storage: UnderlyingStorage,
}

#[derive(Clone)]
enum UnderlyingStorage {
  CameraImageBytes {
    color_image: ImageProxy,
    depth_image: ImageProxy,
  },
  K4aCapture {
    capture: k4a_sys_wrapper::Capture,
    maybe_color_image: Option<ImageProxy>,
    maybe_depth_image: Option<ImageProxy>,
  }
}

impl CaptureProxy {

  pub fn from_image_proxy_pair(color_image: ImageProxy, depth_image: ImageProxy) -> Self {
    Self {
      storage: UnderlyingStorage::CameraImageBytes {
        color_image,
        depth_image,
      }
    }
  }

  pub fn from_k4a_image(capture: &k4a_sys_wrapper::Capture) -> Self {
    // NB: We need to increase the refcount.
    // K4a manages the memory under the hood.
    let capture = capture.clone();
    Self::consume_k4a_image(capture)
  }

  pub fn consume_k4a_image(capture: k4a_sys_wrapper::Capture) -> Self {
    // NB: I tried to lazily unpack these, but interior mutability Sync/Send was a nightmare.
    // The poor ergonomics were not worth it.
    let color_image = capture.get_color_image()
        .map(|image| ImageProxy::consume_k4a_image(image))
        .ok();

    let depth_image = capture.get_color_image()
        .map(|image| ImageProxy::consume_k4a_image(image))
        .ok();

    Self {
      storage: UnderlyingStorage::K4aCapture {
        capture,
        maybe_color_image: color_image,
        maybe_depth_image: depth_image,
      }
    }
  }

  pub fn is_k4a(&self) -> bool {
    match &self.storage {
      UnderlyingStorage::CameraImageBytes{ .. } => false,
      UnderlyingStorage::K4aCapture { .. } => true,
    }
  }

  pub fn get_color_image(&self) -> AnyhowResult<&ImageProxy> {
    match &self.storage {
      UnderlyingStorage::CameraImageBytes { color_image, .. } => Ok(color_image),
      UnderlyingStorage::K4aCapture{ maybe_color_image, .. } => {
        let inner = maybe_color_image.as_ref()
            .ok_or(CaptureError::NullCapture)?;
        Ok(inner)
      }
    }
  }

  pub fn get_depth_image(&self) -> AnyhowResult<&ImageProxy> {
    match &self.storage {
      UnderlyingStorage::CameraImageBytes { depth_image, .. } => Ok(depth_image),
      UnderlyingStorage::K4aCapture{ maybe_depth_image, .. } => {
        let inner = maybe_depth_image.as_ref()
            .ok_or(CaptureError::NullCapture)?;
        Ok(inner)
      }
    }
  }
}
