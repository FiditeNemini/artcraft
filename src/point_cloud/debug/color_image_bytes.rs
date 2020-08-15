use anyhow::Result as AnyhowResult;
use std::fs::File;
use std::fs;
use std::io::Read;
use kinect::k4a_sys_wrapper;

/// Store either raw bytes, or wrap a k4a::Image
enum UnderlyingStorage {
  Bytes(Vec<u8>),
  K4aImage(k4a_sys_wrapper::Image),
}

/// Loaded color images from the filesystem
pub struct ColorImageBytes {
  storage: UnderlyingStorage,
}

impl ColorImageBytes {
  pub fn from_file(filename: &str) -> AnyhowResult<Self> {
    let mut file = File::open(filename)?;
    let metadata = fs::metadata(&filename)?;

    let mut buffer = vec![0u8; metadata.len() as usize];
    file.read(&mut buffer)?;

    let storage = UnderlyingStorage::Bytes(buffer);

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
      UnderlyingStorage::Bytes(bytes) => bytes.len(),
      UnderlyingStorage::K4aImage(image) => image.get_size(),
    }
  }

  pub fn as_ptr(&self) -> *const u8 {
    match &self.storage {
      UnderlyingStorage::Bytes(ref bytes) => {
        bytes.as_ptr()
      },
      UnderlyingStorage::K4aImage(ref image) => {
        image.get_buffer() as *const u8
      },
    }
  }
}
