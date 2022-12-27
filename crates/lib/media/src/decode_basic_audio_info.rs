use errors::AnyhowResult;
use std::io::Cursor;
use symphonia::core::audio::SampleBuffer;
use symphonia::core::formats::{FormatOptions, FormatReader};
use symphonia::core::io::{MediaSourceStream, ReadOnlySource};
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;

// Returned if nothing could be decoded
const NO_AUDIO_INFO : BasicAudioInfo = BasicAudioInfo { duration_millis: None, codec_name: None, required_full_decode: false };

#[derive(Clone)]
pub struct BasicAudioInfo {
  pub duration_millis: Option<u64>,
  pub codec_name: Option<String>,
  pub required_full_decode: bool,
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

  let mut format = probed.format;

  let default_track = match format.default_track() {
    None => return Ok(NO_AUDIO_INFO.clone()),
    Some(default_track) => default_track,
  };

  let mut maybe_track_duration = default_track.codec_params.time_base
      .zip(default_track.codec_params.n_frames)
      .map(|(time_base, n_frames)| {
        // NB: This yields the duration of the track
        time_base.calc_time(n_frames)
      })
      .map(|time| {
        let duration_millis = time.seconds * 1000;
        let frac_millis = (time.frac * 1000.0).trunc() as u64;
        duration_millis + frac_millis
      });

  let codec_registry = symphonia::default::get_codecs();

  let maybe_codec_name = codec_registry.get_codec(default_track.codec_params.codec)
      .map(|codec_descriptor| codec_descriptor.short_name.to_string());

  let mut required_full_decode = false;

  if maybe_track_duration.is_none() {
    // NB: The number of samples could not be determined, so we need to decode the file.
    // See https://github.com/pdeljanov/Symphonia/issues/18#issuecomment-770157948

    maybe_track_duration = read_duration(&mut format)?;
    required_full_decode = true;
  }

  Ok(BasicAudioInfo {
    duration_millis: maybe_track_duration,
    codec_name: maybe_codec_name,
    required_full_decode,
  })
}

fn read_duration(format: &mut Box<dyn FormatReader>) -> AnyhowResult<Option<u64>> {
  // NB: Code adapted from symphonia repo example code.
  let track = match format.default_track() {
    None => return Ok(None),
    Some(track) => track,
  };

  let decoder_opts = Default::default();

  // Create a decoder for the track.
  let mut decoder = symphonia::default::get_codecs()
      .make(&track.codec_params, &decoder_opts)?;

  let channel_count = match track.codec_params.channels {
    None => return Ok(None),
    Some(channels) => channels.count(),
  };

  let sample_rate = match track.codec_params.sample_rate {
    None => return Ok(None),
    Some(sample_rate) => sample_rate,
  };

  // Store the track identifier, we'll use it to filter packets.
  let track_id = track.id;

  let mut sample_count = 0;
  let mut sample_buf = None;

  loop {
    // Get the next packet from the format reader.
    let packet = match format.next_packet() {
      Ok(packet) => packet,
      Err(_e) => break,
    };

    // If the packet does not belong to the selected track, skip it.
    if packet.track_id() != track_id {
      continue;
    }

    // Decode the packet into audio samples, ignoring any decode errors.
    match decoder.decode(&packet) {
      Ok(audio_buf) => {
        // The decoded audio samples may now be accessed via the audio buffer if per-channel
        // slices of samples in their native decoded format is desired. Use-cases where
        // the samples need to be accessed in an interleaved order or converted into
        // another sample format, or a byte buffer is required, are covered by copying the
        // audio buffer into a sample buffer or raw sample buffer, respectively. In the
        // example below, we will copy the audio buffer into a sample buffer in an
        // interleaved order while also converting to a f32 sample format.

        // If this is the *first* decoded packet, create a sample buffer matching the
        // decoded audio buffer format.
        if sample_buf.is_none() {
          // Get the audio buffer specification.
          let spec = *audio_buf.spec();

          // Get the capacity of the decoded buffer. Note: This is capacity, not length!
          let duration = audio_buf.capacity() as u64;

          // Create the f32 sample buffer.
          sample_buf = Some(SampleBuffer::<f32>::new(duration, spec));
        }

        // Copy the decoded audio buffer into the sample buffer in an interleaved format.
        if let Some(buf) = &mut sample_buf {
          buf.copy_interleaved_ref(audio_buf);

          // The samples may now be access via the `samples()` function.
          sample_count += buf.samples().len();
        }
      }
      Err(symphonia::core::errors::Error::DecodeError(_)) => (),
      Err(_) => break,
    }
  }

  let channel_samples = sample_count / channel_count;
  let duration_millis = ((channel_samples as f32) / (sample_rate as f32) * 1000.0) as u64;

  Ok(Some(duration_millis))
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
    assert_eq!(info.required_full_decode, false);
    Ok(())
  }

  #[test]
  fn decode_flac_info_with_wrong_extension() -> AnyhowResult<()> {
    let path = test_file("test_data/audio/flac/zelda_ocarina_small_item.flac");
    let bytes = std::fs::read(path)?;
    let incorrect_mimetype = Some("audio/wav");
    let incorrect_extension = Some("wav");
    let info = decode_basic_audio_info(&bytes, incorrect_mimetype, incorrect_extension)?;
    assert_eq!(info.codec_name, Some("flac".to_string()));
    assert_eq!(info.duration_millis, Some(5120));
    assert_eq!(info.required_full_decode, false);
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
    assert_eq!(info.required_full_decode, false);
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
    assert_eq!(info.required_full_decode, false);
    Ok(())
  }

  #[test]
  fn decode_ogg_info() -> AnyhowResult<()> {
    // According to ffprobe (which ever so slightly disagrees with our calculation),
    //   Duration: 00:00:04.90, start: 0.000000, bitrate: 83 kb/s
    //   length          : 4.94
    let path = test_file("test_data/audio/ogg/banjo-kazooie_jiggy_appearance.ogg");
    let bytes = std::fs::read(path)?;
    let info = decode_basic_audio_info(&bytes, None, None)?;
    assert_eq!(info.codec_name, Some("vorbis".to_string()));
    assert_eq!(info.duration_millis, Some(4903)); // NB: This disagrees with ffprobe, but it's pretty close.
    assert_eq!(info.required_full_decode, true);
    Ok(())
  }

  #[test]
  fn decode_wav_info_pcm_s16le() -> AnyhowResult<()> {
    let path = test_file("test_data/audio/wav/sm64_mario_its_me.wav");
    let bytes = std::fs::read(path)?;
    let info = decode_basic_audio_info(&bytes, None, None)?;
    assert_eq!(info.codec_name, Some("pcm_s16le".to_string()));
    assert_eq!(info.duration_millis, Some(1891));
    assert_eq!(info.required_full_decode, false);
    Ok(())
  }
}
