use std::path::Path;

use errors::AnyhowResult;

pub struct VideoDimensions {
  pub width: u64,
  pub height: u64,
}

pub fn ffprobe_get_dimensions(
  video_path: impl AsRef<Path>
) -> AnyhowResult<Option<VideoDimensions>>
{
  let result = ffprobe::ffprobe(video_path)?;

  let maybe_dimensions = result.streams.iter()
      .filter(|stream| stream.codec_type.as_deref() == Some("video"))
      .find_map(|stream| {
        if let (Some(width), Some(height)) = (stream.width, stream.height) {
          Some((width, height))
        } else {
          None
        }
      });

  match maybe_dimensions {
    None => Ok(None),
    Some((width, height)) => Ok(Some(VideoDimensions {
      width: width.unsigned_abs(),
      height: height.unsigned_abs(),
    })),
  }
}

#[cfg(test)]
pub mod tests {
  use testing::test_file_path::test_file_path;

  use crate::ffprobe_get_dimensions::ffprobe_get_dimensions;

  #[test]
  pub fn test_decode_mp4() {
    let filename = test_file_path("test_data/video/mp4/golden_sun_garoh.mp4")
        .expect("path should exist");

    let info = ffprobe_get_dimensions(filename)
        .expect("should be able to read with ffprobe")
        .expect("dimensions should not be empty");

    assert_eq!(info.width, 640);
    assert_eq!(info.height, 480);
  }
}
