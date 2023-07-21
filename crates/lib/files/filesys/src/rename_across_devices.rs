use std::path::Path;

/// Rename a file.
/// Ordinary rename will fail in Linux if it is across physical devices.
/// This function will perform a copy followed by delete in that case.
pub fn rename_across_devices<P: AsRef<Path>, Q: AsRef<Path>>(from: P, to: Q) -> std::io::Result<()> {
  let result = std::fs::rename(&from, &to);

  let err = match result.as_ref() {
    Ok(_) => return Ok(()), // Rename succeeded.
    Err(err) => err,
  };

  match err.raw_os_error() {
    Some(18) => {
      // NO-OP: pass-through
      // NB: We can clean this up in the future when `err.kind() == ErrorKind::CrossDevices`
      // stabilizes. For now we can assume code "18" means we're trying to rename across devices.
    }
    _ => {
      // Something else happened. Return original error.
      return result;
    }
  }

  let _num_bytes = std::fs::copy(&from, &to)?;

  std::fs::remove_file(&from)?;

  Ok(())
}
