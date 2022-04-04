use crate::{AnyhowResult, ProgramArgs};
use log::{info, error, warn};
use std::fs::File;
use std::intrinsics::write_bytes;
use std::path::PathBuf;
use subprocess::Exec;
use tempfile::NamedTempFile;
use std::io::Write;

pub fn create_movie(wav_bytes: Vec<u8>, program_args: &ProgramArgs) -> AnyhowResult<NamedTempFile> {
  let mut output_wav_file = NamedTempFile::new_in("/tmp")?;
  let mut output_video_file = NamedTempFile::new_in("/tmp")?;

  output_wav_file.write_all(wav_bytes.as_ref())?;

  let wav_path = output_wav_file.path();
  let video_path = output_video_file.path();

  let sonic_image = &program_args.png_filename;

  // TODO: This is dangerous af.
  let command = format!("ffmpeg -loop 1 \
    -i {} \
    -i {} \
    -c:v libx264 -tune stillimage -c:a aac -b:a 192k \
    -pix_fmt yuv420p \
    -shortest \
    -f mp4 \
    -y \
    {}", sonic_image, wav_path.to_str().unwrap(), video_path.to_str().unwrap());

  info!("Command: {}", command);

  let _exit_status = Exec::shell(command).join()?;

  Ok(output_video_file)
}