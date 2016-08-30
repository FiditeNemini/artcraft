// Copyright (c) 2015 Brandon Thomas <bt@brand.io>
// TODO: This looks really bad now. Needs cleanup.

use crypto::digest::Digest;
use crypto::sha1::Sha1;
use hound::{WavReader, WavSpec, WavWriter};
use iron::Handler;
use iron::headers::{ETag, EntityTag, Headers, IfNoneMatch};
use iron::mime::Mime;
use iron::prelude::*;
//use params::Params;
use iron::status;
use router::Router;
use rustc_serialize::json;
use std::error::Error;
use std::fmt::{self, Debug};
use std::fs::File;
use std::fs;
use std::i16;
use std::io::BufReader;
use std::io::BufWriter;
use std::io::Cursor;
use std::io::Read;
use std::io;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::RwLock;
use super::error_filter::build_error;
use synthesizer::Synthesizer;
use urlencoded::UrlEncodedQuery;
use words::split_sentence;

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

  /** Whether to use words. */
  pub use_words: bool,

  /** Whether to use phonemes. */
  pub use_phonemes: bool,
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
  /// The TTS synthesizer.
  synthesizer: Arc<RwLock<Synthesizer>>,

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

    /*let (use_words, use_phonemes) = match http_request.get_ref::<Params>() {
      None => {
        (false, false)
      },
      Some(map) => {
        match map.find("use_words") {
          Some(_e) => {
            println!(">>> FOUND");
          },
          _ => {
            println!(">>> NOT FOUND");
          },
        }
        (true, true)
      },
    };*/

    Ok(SpeakRequest {
      sentence: sentence,
      speaker: speaker,
      volume: volume,
      use_words: false,
      use_phonemes: true,
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

    let result = self.create_audio(&request.speaker, &request.sentence,
                                   request.use_words, request.use_phonemes,
                                   request.volume);

    let mime_type = "audio/wav".parse::<Mime>().unwrap();

    let mut response = Response::with((mime_type, status::Ok, result));
    response.headers.set(ETag(entity_tag));

    Ok(response)
  }
}

impl AudioSynthHandler {
  pub fn new(synthesizer: Arc<RwLock<Synthesizer>>, directory: &str) -> AudioSynthHandler {
    AudioSynthHandler {
      synthesizer: synthesizer,
      directory: Path::new(directory).to_path_buf(),
    }
  }

  // TODO: Return errors.
  /// Create audio from the sentence.
  fn create_audio(&self, speaker: &str, sentence: &str, use_words: bool,
                  use_phonemes: bool, volume: Option<f32>) -> Vec<u8> {
    match self.synthesizer.read() {
      Err(_) => Vec::new(), // TODO Actual error.
      Ok(synth) => {
        match synth.generate(sentence, speaker, use_words, use_phonemes, volume) {
          Err(e) => {
            println!("Error synthesizing: {:?}", e);
            Vec::new() // TODO FIXME
          },
          Ok(wav) => wav,
        }
      }
    }
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
}

