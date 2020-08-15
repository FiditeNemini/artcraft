use anyhow::Result as AnyhowResult;
use std::fs::File;
use std::fs;
use std::io::Read;
use kinect::k4a_sys_wrapper;

/// Store either raw bytes, or wrap a k4a::Image
enum UnderlyingStorage {
  Bytes {
    bytes: Vec<u8>,
    width: usize,
    height: usize
  },
  K4aImage(k4a_sys_wrapper::Image),
}

/// Loaded images from the filesystem
pub struct CameraImageBytes {
  storage: UnderlyingStorage,
}

impl CameraImageBytes {
  pub fn from_file(filename: &str, width: usize, height: usize) -> AnyhowResult<Self> {
    let mut file = File::open(filename)?;
    let metadata = fs::metadata(&filename)?;

    let mut buffer = vec![0u8; metadata.len() as usize];
    file.read(&mut buffer)?;

    let storage = UnderlyingStorage::Bytes {
      bytes: buffer,
      width,
      height,
    };

    Ok(Self {
      storage,
    })
  }

  pub fn from_k4a_image(image: &k4a_sys_wrapper::Image) -> Self {
    // NB: We need to increase the refcount.
    // K4a manages the memory under the hood.
    let image = image.clone();
    let storage = UnderlyingStorage::K4aImage(image);
    Self {
      storage,
    }
  }

  pub fn len(&self) -> usize {
    match &self.storage {
      UnderlyingStorage::Bytes { bytes, .. } => bytes.len(),
      UnderlyingStorage::K4aImage(image) => image.get_size(),
    }
  }

  pub fn as_ptr(&self) -> *const u8 {
    match &self.storage {
      UnderlyingStorage::Bytes{ ref bytes, .. } => {
        bytes.as_ptr()
      },
      UnderlyingStorage::K4aImage(ref image) => {
        image.get_buffer() as *const u8
      },
    }
  }

  pub fn get_buffer(&self) -> *const u8 {
    self.as_ptr()
  }

  pub fn get_width_pixels(&self) -> usize {
    match &self.storage {
      UnderlyingStorage::Bytes { width, .. } => *width,
      UnderlyingStorage::K4aImage(image) => image.get_width_pixels(),
    }
  }

  pub fn get_height_pixels(&self) -> usize {
    match &self.storage {
      UnderlyingStorage::Bytes { height, .. } => *height,
      UnderlyingStorage::K4aImage(image) => image.get_height_pixels(),
    }
  }
}
