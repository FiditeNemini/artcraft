// Copyright (c) 2015 Brandon Thomas <bt@brand.io>
// TODO: This looks really bad now. Needs cleanup.

use crypto::digest::Digest;
use crypto::sha1::Sha1;
use hound::{WavReader, WavSpec, WavWriter};
use iron::Handler;
use iron::mime::Mime;
//use iron::error::IronError;
use iron::prelude::*;
use iron::status;
use iron::headers::{ETag, EntityTag, Headers, IfNoneMatch};
use router::Router;
use rustc_serialize::json;
use urlencoded::UrlEncodedQuery;

use std::fs::File;
use std::fs;
use std::io;
use std::i16;
use std::io::BufReader;
use std::io::BufWriter;
use std::io::Cursor;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::error::Error;
use std::fmt::{self, Debug};

use words::split_sentence;
use super::error_filter::build_error;

const SPEAKER_PARAM : &'static str = "v";
const SENTENCE_PARAM : &'static str = "s";
const VOLUME_PARAM : &'static str = "vol";

/// Represents a request to this endpoint.
struct SpeakRequest {
  /** The sentence to be spoken. */
  pub sentence: String,

  /** The voice to use to render the audio. */
  pub speaker: String,

  /** An optional volume multiplier. */
  pub volume: Option<f32>,
}

enum SpeakerRequestError {
  SentenceMissing,
  SentenceInvalid,
  SpeakerMissing,
  SpeakerInvalid,
  VolumeInvalid,
}

/// Synthesizes audio from input.
pub struct AudioSynthHandler {
  /// Root of where files can be served from.
  /// A PathBuf since `Path` can only be created as a borrow.
  directory: PathBuf,
}

impl SpeakRequest {
  pub fn parse(http_request: &mut Request) -> Result<SpeakRequest, SpeakerRequestError> {

    let sentence_error = Err(SpeakerRequestError::SentenceInvalid);
    let speaker_error = Err(SpeakerRequestError::SpeakerInvalid);

    // Get the request sentence and speaker.
    // TODO: Cleanup
    let (sentence, speaker, volume) = match http_request.get_ref::<UrlEncodedQuery>() {
      Err(_) => { return sentence_error; },
      Ok(ref map) => {
        let sen = match map.get(SENTENCE_PARAM) {
          None => { return sentence_error; },
          Some(list) => { 
            match list.get(0) {
              None => { return sentence_error; },
              Some(s) => { s.to_string() },
            }
          },
        };

        let spk = match map.get(SPEAKER_PARAM) {
          None => { return speaker_error; },
          Some(list) => { 
            match list.get(0) {
              None => { return speaker_error; },
              Some(s) => { s.to_string() },
            }
          },
        };

        let volume : Option<f32> = match map.get(VOLUME_PARAM) {
          None => { None },
          Some(list) => { 
            match list.get(0) {
              None => { None },
              Some(s) => {
                match s.parse::<f32>() {
                  Err(_) => None,
                  Ok(i) => Some(i),
                }
              },
            }
          },
        };

        (sen, spk, volume)
      },
    };

    Ok(SpeakRequest {
      sentence: sentence,
      speaker: speaker,
      volume: volume,
    })
  }
}

impl Handler for AudioSynthHandler {
  /// Process request.
  fn handle(&self, req: &mut Request) -> IronResult<Response> {
    info!("GET /speak");

    let speaker_error = build_error(status::BadRequest, 
        &format!("Missing `{}` parameter.", SPEAKER_PARAM));

    let sentence_error = build_error(status::BadRequest, 
        &format!("Missing `{}` parameter.", SENTENCE_PARAM));

    // Get the request ETag. TODO: Cleanup
    let request_hash = {
      match req.headers.get::<IfNoneMatch>() {
        None => { "".to_string() },
        Some(etag) => { etag.to_string() }
      }
    };

    // TODO: Cleanup
    let request = match SpeakRequest::parse(req) {
      Ok(s) => s,
      Err(e) => {
        return sentence_error;
      },
    };

    info!("Speak Request ({}): {}", request.speaker, request.sentence);

    // FIXME: Varies with spaces, formatting, etc.
    let hash = self.sha_digest(&request.speaker, &request.sentence, request.volume);
    let entity_tag = EntityTag::new(true, hash.to_owned());

    if request_hash == entity_tag.to_string() {
      return Ok(Response::with(status::NotModified));
    }

    let result = self.create_audio(&request.speaker, &request.sentence, request.volume);
    let mime_type = "audio/wav".parse::<Mime>().unwrap();

    let mut response = Response::with((mime_type, status::Ok, result));
    response.headers.set(ETag(entity_tag));

    Ok(response)
  }
}

impl AudioSynthHandler {
  pub fn new(directory: &str) -> AudioSynthHandler {
    AudioSynthHandler { directory: Path::new(directory).to_path_buf() }
  }

  // TODO: Return errors.
  /// Create audio from the sentence.
  fn create_audio(&self, speaker: &str, sentence: &str, volume: Option<f32>)
      -> Vec<u8> {
    let mut words = split_sentence(sentence);

    if words.len() == 0 {
      // TODO: Raise error!
    }

    // This file adds extra silent padding at both ends.
    words.insert(0, "_blank".to_string());
    words.push("_blank".to_string());

    // Note: Keeping a list of buffered file readers is stupid and is simply 
    // being done for this example. I'll create a multithreaded shared LRU cache
    // that reads from the disk and uses the dictionary word as the lookup key.
    let mut file_readers : Vec<WavReader<BufReader<File>>> = Vec::new();

    // TODO: Cleanup.
    let speaker_path = match self.get_speaker_path(speaker) {
      Err(_) => { Path::new("").to_path_buf() }, // TODO: meh
      Ok(p) => p,
    };

    for word in words.iter() {
      let filename = self.get_file_path(speaker_path.as_path(), word);
      let reader = WavReader::open(filename).unwrap();
      file_readers.push(reader);
    }

    let mut all_samples : Vec<i16> = Vec::new();

    for mut reader in file_readers {
      let samples = reader.samples::<i16>();
      for sample in samples {
        all_samples.push(sample.unwrap());
      }
    }

    // FIXME: Super inefficient.
    let mut pcm_data : Vec<i16> = Vec::with_capacity(all_samples.len());
    for x in &all_samples {
      let data = raise_volume(*x, volume);
      pcm_data.push(data);
    }

    let spec = self.get_spec(speaker_path.as_path(), &words[0]);

    self.write_buffer(&spec, pcm_data)
  }


  fn sha_digest(&self, speaker: &str, sentence: &str, volume: Option<f32>) -> String {
    let mut hasher = Sha1::new();
    hasher.input_str(speaker);
    hasher.input_str(sentence);
    if volume.is_some() {
      let vol = volume.unwrap();

      // FIXME: This isn't perfect hashing for floats, but is mostly what I want.
      let hashed = (vol * 1000.0) as i16;
      let hi = (hashed >> 8 & 0xff) as u8;
      let lo = (hashed & 0xff) as u8;
      hasher.input(&[hi, lo]);
    }
    hasher.result_str().to_string()
  }

  fn get_speaker_path(&self, speaker: &str) -> Result<PathBuf, io::Error> {
    // FIXME: Hack so I can release tonight. Rewrite this whole controller plz.
    if speaker.contains("..") || 
        speaker.contains("/") || 
        speaker.contains("$") || 
        speaker.contains("~") {
          return Err(io::Error::new(io::ErrorKind::InvalidInput, "invalid path"));
        }

    let speaker_path = self.directory.as_path().join(Path::new(speaker));
    // FIXME: This is not the security measure you think it is:
    if !speaker_path.starts_with(&self.directory) {
      return Err(io::Error::new(io::ErrorKind::InvalidInput, "invalid path"));
    } 
    Ok(speaker_path)
  }

  fn get_file_path(&self, speaker_path: &Path, word: &str) -> PathBuf {
    speaker_path.join(format!("{}.wav", word))
  }

  fn get_spec(&self, speaker_path: &Path, word: &str) -> WavSpec {
    let filename = self.get_file_path(speaker_path, word);
    let reader = WavReader::open(filename).unwrap();
    reader.spec()
  }

  fn write_buffer(&self, spec: &WavSpec, samples: Vec<i16>) -> Vec<u8> {
    let mut bytes : Vec<u8> = Vec::new();
    let mut seek : Cursor<Vec<u8>> = Cursor::new(bytes);
    let mut buffer = BufWriter::new(seek);

    {
      let mut writer = WavWriter::new(&mut buffer, *spec);
      for s in samples {
        writer.write_sample(s).unwrap();
      }
      writer.finalize().unwrap(); // TODO: Error
    }

    match buffer.into_inner() {
      Err(_) => { Vec::new() }, // TODO: Error
      Ok(r) => { r.get_ref().to_vec() },
    }
  }
}

/// Raise the volume of a sample by changing its amplitude.
fn raise_volume(data: i16, volume: Option<f32>) -> i16 {
  // TODO: Cleanup, make more efficient.
  match volume {
    None => data,
    Some(vol) => {
      let f : f32 = data as f32 * vol;
      let g = f as i32;

      let h : i16 = if g > i16::MAX as i32 {
        i16::MAX
      } else if g < i16::MIN as i32 {
        i16::MIN
      } else {
        g as i16
      };

      h
    },
  }
}

