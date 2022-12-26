use errors::AnyhowResult;
use std::io::Cursor;
use symphonia::core::formats::FormatOptions;
use symphonia::core::io::{MediaSourceStream, ReadOnlySource};
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;

pub struct BasicAudioInfo {
  pub duration_millis: Option<u64>,
  pub codec_name: Option<String>,
}

pub fn decode_basic_audio_info(
  audio_bytes: &[u8],
  maybe_mimetype: Option<&str>,
  maybe_extension: Option<&str>,
) -> AnyhowResult<BasicAudioInfo> {

  // FIXME(bt, 2022-12-21): This is horribly inefficient.
  let bytes = audio_bytes.to_vec();
  let reader = Cursor::new(bytes);
  let source = ReadOnlySource::new(reader);
  let mss = MediaSourceStream::new(Box::new(source), Default::default());

  let mut hint = Hint::new();
  if let Some(extension) = maybe_extension {
    hint.with_extension(extension);
  }
  if let Some(mimetype) = maybe_mimetype {
    hint.mime_type(mimetype);
  }

  // Use the default options for metadata and format readers.
  let meta_opts: MetadataOptions = Default::default();
  let fmt_opts: FormatOptions = Default::default();

  // Probe the media source.
  let probed = symphonia::default::get_probe()
      .format(&hint, mss, &fmt_opts, &meta_opts)?;

  let format = probed.format;

  let maybe_track_duration = format.default_track()
      .map(|track| {
        track.codec_params.time_base
            .zip(track.codec_params.n_frames)
            .map(|(time_base, n_frames)| {
              // NB: This yields the duration of the track
              time_base.calc_time(n_frames)
            })
      })
      .flatten()
      .map(|time| {
        let duration_millis = time.seconds * 1000;
        let frac_millis = (time.frac * 1000.0).trunc() as u64;
        duration_millis + frac_millis
      });

  let codec_registry = symphonia::default::get_codecs();

  let maybe_codec_name = format.default_track()
      .map(|track| track.codec_params.codec)
      .map(|codec_type| codec_registry.get_codec(codec_type))
      .flatten()
      .map(|codec_descriptor| codec_descriptor.short_name.to_string());

  Ok(BasicAudioInfo {
    duration_millis: maybe_track_duration,
    codec_name: maybe_codec_name,
  })
}

#[cfg(test)]
mod tests {
  use std::path::PathBuf;
  use errors::AnyhowResult;
  use crate::decode_basic_audio_info::decode_basic_audio_info;

  fn test_file(root_file_path: &str) -> PathBuf {
    // https://doc.rust-lang.org/cargo/reference/environment-variables.html
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push(format!("../../../{}", root_file_path));
    path
  }

  #[test]
  fn decode_flac_info() -> AnyhowResult<()> {
    let path = test_file("test_data/audio/flac/zelda_ocarina_small_item.flac");
    let bytes = std::fs::read(path)?;
    let info = decode_basic_audio_info(&bytes, None, None)?;
    assert_eq!(info.codec_name, Some("flac".to_string()));
    assert_eq!(info.duration_millis, Some(5120));
    Ok(())
  }

  // NB: Requires symphonia 'aac' and 'isomp4' feature flags
  #[test]
  fn decode_m4a_alac_info() -> AnyhowResult<()> {
    let path = test_file("test_data/audio/m4a/super_mario_bros_lost_life.m4a");
    let bytes = std::fs::read(path)?;
    let info = decode_basic_audio_info(&bytes, None, None)?;
    assert_eq!(info.codec_name, Some("alac".to_string()));
    assert_eq!(info.duration_millis, Some(5493));
    Ok(())
  }

  // NB: Requires symphonia 'mp3' feature flag
  #[test]
  fn decode_mp3_info() -> AnyhowResult<()> {
    let path = test_file("test_data/audio/mp3/super_mario_rpg_beware_the_forests_mushrooms.mp3");
    let bytes = std::fs::read(path)?;
    let info = decode_basic_audio_info(&bytes, None, None)?;
    assert_eq!(info.codec_name, Some("mp3".to_string()));
    assert_eq!(info.duration_millis, Some(15023));
    Ok(())
  }

  #[test]
  fn decode_ogg_info() -> AnyhowResult<()> {
    let path = test_file("test_data/audio/ogg/banjo-kazooie_jiggy_appearance.ogg");
    let bytes = std::fs::read(path)?;
    let info = decode_basic_audio_info(&bytes, None, None)?;
    assert_eq!(info.codec_name, Some("vorbis".to_string()));
    // assert_eq!(info.duration_millis, Some(5120)); // TODO/FIXME: No duration reported.
    Ok(())
  }

  #[test]
  fn decode_wav_info_pcm_s16le() -> AnyhowResult<()> {
    let path = test_file("test_data/audio/wav/sm64_mario_its_me.wav");
    let bytes = std::fs::read(path)?;
    let info = decode_basic_audio_info(&bytes, None, None)?;
    assert_eq!(info.codec_name, Some("pcm_s16le".to_string()));
    assert_eq!(info.duration_millis, Some(1891));
    Ok(())
  }
}
