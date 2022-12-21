use std::io::Cursor;
use symphonia::core::formats::FormatOptions;
use symphonia::core::io::{MediaSourceStream, ReadOnlySource};
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;

pub struct BasicAudioInfo {
  pub duration_millis: Option<u64>,
}

pub fn decode_basic_audio_info(
  audio_bytes: &[u8],
  maybe_mimetype: Option<&str>,
  maybe_extension: Option<&str>,
) -> symphonia::core::errors::Result<BasicAudioInfo> {

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

  // TODO: FIX
  let duration = format.default_track()
      .map(|track| {
        let timebase= track.codec_params.time_base.unwrap();
        let n_frames = track.codec_params.n_frames.unwrap();
        timebase.calc_time(n_frames)
      })
      .unwrap();

  let duration_millis = duration.seconds * 1000;
  let frac_millis = (duration.frac * 1000.0).trunc() as u64;
  let duration_millis = duration_millis + frac_millis;

  Ok(BasicAudioInfo {
    duration_millis: Some(duration_millis),
  })
}