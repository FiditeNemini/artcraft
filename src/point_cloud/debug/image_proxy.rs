use anyhow::Result as AnyhowResult;
use crate::files::write_to_file_from_byte_ptr::write_to_file_from_byte_ptr;
use k4a_sys_temp as k4a_sys;
use kinect::ImageFormat;
use kinect;
use std::fs::File;
use std::fs;
use std::io::Read;
use std::ptr::null_mut;

/// Store either raw bytes, or wrap a k4a::Image
/// This is meant to be plumbed through the system instead of a k4a::Image (depth or color image)
#[derive(Clone)]
pub struct ImageProxy {
  storage: UnderlyingStorage,
}

/// The underlying data store
#[derive(Clone)]
enum UnderlyingStorage {
  /// Our own serialization
  Bytes {
    bytes: Vec<u8>,
    width: usize,
    height: usize,
    stride_bytes: usize,
    format: ImageFormat,
  },
  /// From the Kinect camera
  K4aImage(kinect::Image),
}

impl ImageProxy {

  pub fn from_file(
    filename: &str,
    width: usize,
    height: usize,
    stride_bytes: usize,
    format: ImageFormat) -> AnyhowResult<Self>
  {
    let mut file = File::open(filename)?;
    let metadata = fs::metadata(&filename)?;

    let mut buffer = vec![0u8; metadata.len() as usize];
    file.read(&mut buffer)?;

    let storage = UnderlyingStorage::Bytes {
      bytes: buffer,
      width,
      height,
      stride_bytes,
      format,
    };

    Ok(Self {
      storage,
    })
  }

  pub fn from_k4a_image(image: &kinect::Image) -> Self {
    // NB: We need to increase the refcount.
    // K4a manages the memory under the hood.
    let image = image.clone();
    let storage = UnderlyingStorage::K4aImage(image);
    Self {
      storage,
    }
  }

  pub fn consume_k4a_image(image: kinect::Image) -> Self {
    let storage = UnderlyingStorage::K4aImage(image);
    Self {
      storage,
    }
  }

  pub fn is_k4a(&self) -> bool {
    match &self.storage {
      UnderlyingStorage::Bytes { .. } => false,
      UnderlyingStorage::K4aImage(_) => true,
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

  pub fn get_stride_bytes(&self) -> usize {
    match &self.storage {
      UnderlyingStorage::Bytes { stride_bytes, .. } => *stride_bytes,
      UnderlyingStorage::K4aImage(image) => image.get_stride_bytes(),
    }
  }

  pub fn get_format(&self) -> ImageFormat {
    match &self.storage {
      UnderlyingStorage::Bytes { format, .. } => *format,
      UnderlyingStorage::K4aImage(image) => image.get_format(),
    }
  }

  pub fn get_handle(&self) -> k4a_sys::k4a_image_t {
    match &self.storage {
      UnderlyingStorage::Bytes { bytes, width, height, stride_bytes, format } => {
        // TODO: We're not handing over ownership of the buffer!
        //  The k4a_image cannot be used after this ImageProxy dies!
        let mut handle = null_mut();

        //println!("fake.get_handle(): {:?}, {}, {}x{}", format, stride_bytes, width, height);

        unsafe {
          k4a_sys::k4a_image_create_from_buffer(
            format.to_k4a(),
            *width as i32,
            *height as i32,
            *stride_bytes as i32,
            bytes.as_ptr() as *mut u8, // TODO: Technically we won't write.
            bytes.len(),
            None,
            null_mut(),
            &mut handle,
          );
        }

        handle
      },
      UnderlyingStorage::K4aImage(image) => {
        //println!("real.get_handle(): {:?}, {}, {}x{}", image.get_format(), image.get_stride_bytes(), image.get_width_pixels(), image.get_height_pixels());
        image.get_handle()
      },
    }
  }

  pub fn debug_save_file(&self, filename: &str) -> AnyhowResult<()> {
    match &self.storage {
      UnderlyingStorage::Bytes { .. } => unimplemented!("No need to debug save raw bytes"),
      UnderlyingStorage::K4aImage(image) => {
        let byte_src = image.get_buffer();
        let size_bytes = image.get_size();
        write_to_file_from_byte_ptr(filename, byte_src, size_bytes)
      }
    }
  }
}
