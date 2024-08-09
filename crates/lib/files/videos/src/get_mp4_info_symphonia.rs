/*
use std::io::{Read, Seek};
use std::time::Duration;
use log::warn;
use mp4::TrackType;
use symphonia::core::codecs::{CODEC_TYPE_NULL, DecoderOptions};
use symphonia::core::formats::FormatOptions;
use symphonia::core::io::{MediaSource, MediaSourceStream};
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;
use errors::{anyhow, AnyhowResult};
use crate::get_mp4_info::Mp4Info;

pub fn get_mp4_info_symphonia<T: Seek + Read>(media_source: Box<dyn MediaSource>) -> AnyhowResult<Mp4Info> {
  let mss = MediaSourceStream::new(media_source, Default::default());

  let mut hint = Hint::new();
  hint.with_extension("mp4");

  // Use the default options for metadata and format readers.
  let meta_opts: MetadataOptions = Default::default();
  let fmt_opts: FormatOptions = Default::default();

  // Probe the media source.
  let probed = symphonia::default::get_probe()
      .format(&hint, mss, &fmt_opts, &meta_opts)
      .expect("unsupported format");

  // Get the instantiated format reader.
  let mut format = probed.format;

  format.metadata();

  // Find the first audio track with a known (decodeable) codec.
  let track = format
      .tracks()
      .iter()
      .find(|t| t.codec_params.codec != CODEC_TYPE_NULL)
      .ok_or_else(|| anyhow!("no supported audio tracks"))?;

  // Use the default options for the decoder.
  let dec_opts: DecoderOptions = Default::default();

  // Create a decoder for the track.
  let mut decoder = symphonia::default::get_codecs()
      .make(&track.codec_params, &dec_opts)?;

  // Store the track identifier, it will be used to filter packets.
  let track_id = track.id;




  Ok(Mp4Info {
    framerate,
    duration_millis: mp4.duration().as_millis(),
    width,
    height,
  })
}
*/