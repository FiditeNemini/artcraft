use anyhow::Result as AnyhowResult;
use std::fs::OpenOptions;
use std::io::Write;
use std::ptr;

/// Raw memory copy into a file
pub fn write_to_file_from_byte_ptr(filename: &str, byte_src: *const u8, size_bytes: usize) -> AnyhowResult<()> {
  let mut file = OpenOptions::new()
      .write(true)
      .create(true)
      .open(filename)?;

  let mut vec = vec![0u8; size_bytes];

  unsafe {
    let vec_ptr = vec.as_mut_ptr();
    //ptr::write_bytes(vec_ptr, color_src, size_bytes);
    ptr::copy_nonoverlapping(byte_src, vec_ptr, size_bytes);
  }

  file.write(&vec)?;
  Ok(())
}
