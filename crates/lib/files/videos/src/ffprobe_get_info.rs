use std::path::Path;
use std::str::FromStr;

use errors::{anyhow, AnyhowResult};

pub struct VideoInfo {
  pub dimensions: Option<VideoDimensions>,
  pub duration: Option<VideoDuration>,
}

pub struct VideoDimensions {
  pub width: u64,
  pub height: u64,
}

pub struct VideoDuration {
  /// We have to convert ffprobe's seconds (with decimal) into milliseconds.
  /// We use a u32 as this can hold 49 days of milliseconds.
  pub millis: u32,

  /// This is the original value returned by ffprobe (for debugging).
  pub seconds_original: String,
}

pub fn ffprobe_get_info(
  video_path: impl AsRef<Path>
) -> AnyhowResult<VideoInfo>
{
  let result = ffprobe::ffprobe(video_path)?;

  let maybe_dimensions = result.streams.iter()
      .filter(|stream| stream.codec_type.as_deref() == Some("video"))
      .find_map(|stream| {
        if let (Some(width), Some(height)) = (stream.width, stream.height) {
          Some(VideoDimensions {
            width: width.unsigned_abs(),
            height: height.unsigned_abs(),
          })
        } else {
          None
        }
      });

  let maybe_duration = result.streams.iter()
      .filter(|stream| stream.codec_type.as_deref() == Some("video"))
      .find_map(|stream| stream.duration.clone());

  let maybe_duration = match maybe_duration {
    None => None,
    Some(duration) => {
      let millis = parse_seconds(&duration)?;
      Some(VideoDuration {
        millis,
        seconds_original: duration,
      })
    }
  };

  Ok(VideoInfo {
    dimensions: maybe_dimensions,
    duration: maybe_duration,
  })
}

fn parse_seconds(ffprobe_seconds: &str) -> AnyhowResult<u32> {
  let (seconds, decimal_seconds) = ffprobe_seconds.split_once('.')
      .ok_or_else(|| anyhow!("no decimal in seconds: {}", ffprobe_seconds))?;

  let seconds = u32::from_str(seconds)?;
  let milliseconds = seconds.saturating_mul(1000);

  let decimal_seconds = f32::from_str(&format!("0.{decimal_seconds}"))?;
  let remaining_millis = (decimal_seconds * 1000.0).round() as u32;

  let total_milliseconds = milliseconds.saturating_add(remaining_millis);
  Ok(total_milliseconds)
}

#[cfg(test)]
pub mod tests {
  use testing::test_file_path::test_file_path;

  use crate::ffprobe_get_info::ffprobe_get_info;

  #[test]
  pub fn test_decode_mp4() {
    let filename = test_file_path("test_data/video/mp4/golden_sun_garoh.mp4")
        .expect("path should exist");

    let info = ffprobe_get_info(filename)
        .expect("should be able to read with ffprobe");

    let dimensions = info.dimensions.expect("video should have dimensions");

    assert_eq!(dimensions.width, 640);
    assert_eq!(dimensions.height, 480);

    assert_eq!(info.duration.unwrap().millis, 15133);
  }

  #[test]
  pub fn test_seconds_decode() {
    // Duration: 00:00:26.23, start: 0.000000, bitrate: 1007 kb/s
    let seconds = "26.226200";
    let millis = super::parse_seconds(seconds)
        .expect("should be able to parse seconds");
    assert_eq!(millis, 26226);
  }
}
