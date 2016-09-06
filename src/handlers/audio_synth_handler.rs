// Copyright (c) 2015 Brandon Thomas <bt@brand.io>
// TODO: This looks really bad now. Needs cleanup.

use config::Config;
use crypto::digest::Digest;
use crypto::sha1::Sha1;
use hound::{WavReader, WavSpec, WavWriter};
use iron::Handler;
use iron::headers::{ETag, EntityTag, Headers, IfNoneMatch};
use iron::mime::Mime;
use iron::prelude::*;
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
use std::str::FromStr;
use std::sync::Arc;
use std::sync::RwLock;
use super::error_filter::build_error;
use synthesizer::Synthesizer;
use urlencoded::UrlEncodedQuery;
use words::split_sentence;

const SENTENCE_PARAM : &'static str = "s";
const SPEAKER_PARAM : &'static str = "v";
const SPEED_PARAM : &'static str = "spd";
const USE_PHONEMES_PARAM: &'static str = "up";
const USE_DIPHONES_PARAM: &'static str = "ud";
const USE_WORDS_PARAM: &'static str = "uw";
const VOLUME_PARAM : &'static str = "vol";
const MONOPHONE_PADDING_START_PARAM : &'static str = "mps";
const MONOPHONE_PADDING_END_PARAM : &'static str = "mpe";
const POLYPHONE_PADDING_END_PARAM : &'static str = "ppe";

/// Represents a request to this endpoint.
#[derive(Clone, Debug)]
struct SpeakRequest {
  /** The sentence to be spoken. */
  pub sentence: String,

  /** The voice to use to render the audio. */
  pub speaker: String,

  /** An optional volume multiplier. */
  pub volume: Option<f32>,

  /** An optional speed multiplier. */
  pub speed: Option<f32>,

  /** Whether to use phonemes. */
  pub use_phonemes: bool,

  /** Whether to use diphones. */
  pub use_diphones: bool,

  /** Whether to use words. */
  pub use_words: bool,

  /** Padding before a monophone. */
  pub monophone_padding_start: Option<u16>,

  /** Padding after a monophone. */
  pub monophone_padding_end: Option<u16>,

  /** Padding after a polyphone. */
  pub polyphone_padding_end: Option<u16>,
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

  /// Server configs.
  config: Config,

  /// Root of where files can be served from.
  /// A PathBuf since `Path` can only be created as a borrow.
  directory: PathBuf,
}

impl SpeakRequest {
  pub fn parse(http_request: &mut Request)
      -> Result<SpeakRequest, SpeakerRequestError> {

    let sentence_error = Err(SpeakerRequestError::SentenceInvalid);
    let speaker_error = Err(SpeakerRequestError::SpeakerInvalid);

    // Get the request sentence and speaker.
    // TODO: OMFG WTF CLEANUP THIS GARBAGE.
    match http_request.get_ref::<UrlEncodedQuery>() {
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

        let speed : Option<f32> = match map.get(SPEED_PARAM) {
          None => { None },
          Some(list) => {
            match list.get(0) {
              None => { None },
              Some(s) => {
                match s.trim().parse::<f32>() {
                  Err(_) => None,
                  Ok(i) => {
                    let diff = i - 1.0;
                    if diff < 0.005 && diff > -0.005 {
                      None // Don't waste CPU calculating.
                    } else {
                      Some(i)
                    }
                  }
                }
              },
            }
          },
        };

        let use_phonemes = match map.get(USE_PHONEMES_PARAM) {
          None => { true },
          Some(list) => {
            match list.get(0) {
              None => { return speaker_error; },
              Some(s) => {
                match FromStr::from_str(s) {
                  Ok(b) => b,
                  Err(_) => { return speaker_error; },
                }
              },
            }
          },
        };

        let use_diphones = match map.get(USE_DIPHONES_PARAM) {
          None => { true },
          Some(list) => {
            match list.get(0) {
              None => { return speaker_error; },
              Some(s) => {
                match FromStr::from_str(s) {
                  Ok(b) => b,
                  Err(_) => { return speaker_error; },
                }
              },
            }
          },
        };

        let use_words = match map.get(USE_WORDS_PARAM) {
          None => { true },
          Some(list) => {
            match list.get(0) {
              None => { return speaker_error; },
              Some(s) => {
                match FromStr::from_str(s) {
                  Ok(b) => b,
                  Err(_) => { return speaker_error; },
                }
              },
            }
          },
        };

        let mps : Option<u16> = match map.get(MONOPHONE_PADDING_START_PARAM) {
          None => { None },
          Some(list) => {
            match list.get(0) {
              None => { None },
              Some(s) => {
                match s.trim().parse::<u16>() {
                  Err(_) => None,
                  Ok(i) => {
                    if i == 0 {
                      None
                    } else {
                      Some(i)
                    }
                  }
                }
              },
            }
          },
        };

        let mpe : Option<u16> = match map.get(MONOPHONE_PADDING_END_PARAM) {
          None => { None },
          Some(list) => {
            match list.get(0) {
              None => { None },
              Some(s) => {
                match s.trim().parse::<u16>() {
                  Err(_) => None,
                  Ok(i) => {
                    if i == 0 {
                      None
                    } else {
                      Some(i)
                    }
                  }
                }
              },
            }
          },
        };

        let ppe : Option<u16> = match map.get(POLYPHONE_PADDING_END_PARAM) {
          None => { None },
          Some(list) => {
            match list.get(0) {
              None => { None },
              Some(s) => {
                match s.trim().parse::<u16>() {
                  Err(_) => None,
                  Ok(i) => {
                    if i == 0 {
                      None
                    } else {
                      Some(i)
                    }
                  }
                }
              },
            }
          },
        };

        Ok(SpeakRequest {
          sentence: sen,
          speaker: spk,
          volume: volume,
          speed: speed,
          use_phonemes: use_phonemes,
          use_diphones: use_diphones,
          use_words: use_words,
          monophone_padding_start: mps,
          monophone_padding_end: mpe,
          polyphone_padding_end: ppe,
        })
      },
    }
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

    info!("Speak Request ({}): {}.", request.speaker, request.sentence);
    info!("Request: {:?}", request);

    // FIXME: Varies with spaces, formatting, etc.
    let hash = self.sha_digest(&request);
    let entity_tag = EntityTag::new(true, hash.to_owned());

    info!("Request Header Caching Sha: {}", hash);

    if self.config.use_caching_headers {
      // Don't generate file if caching header is matched.
      if request_hash == entity_tag.to_string() {
        info!("Caching headers match; responding with NotModified.");
        return Ok(Response::with(status::NotModified));
      }
    }

    let result = self.create_audio(request);

    let mime_type = "audio/wav".parse::<Mime>().unwrap();

    let mut response = Response::with((mime_type, status::Ok, result));
    response.headers.set(ETag(entity_tag));

    Ok(response)
  }
}

impl AudioSynthHandler {
  pub fn new(synthesizer: Arc<RwLock<Synthesizer>>, config: Config,
             directory: &str) -> AudioSynthHandler {
    AudioSynthHandler {
      synthesizer: synthesizer,
      config: config,
      directory: Path::new(directory).to_path_buf(),
    }
  }

  // TODO: Return errors.
  /// Create audio from the sentence.
  fn create_audio(&self, request: SpeakRequest) -> Vec<u8> {
    match self.synthesizer.read() {
      Err(_) => Vec::new(), // TODO Actual error.
      Ok(synth) => {
        let generated = synth.generate(&request.sentence,
                                       &request.speaker,
                                       request.use_words,
                                       request.use_phonemes,
                                       request.use_diphones,
                                       request.volume,
                                       request.speed,
                                       request.monophone_padding_start,
                                       request.monophone_padding_end,
                                       request.polyphone_padding_end);
        match generated {
          Err(e) => {
            println!("Error synthesizing: {:?}", e);
            Vec::new() // TODO FIXME
          },
          Ok(wav) => wav,
        }
      }
    }
  }

  fn sha_digest(&self, request: &SpeakRequest) -> String {
    let mut hasher = Sha1::new();

    hasher.input_str(&request.speaker);
    hasher.input_str(&request.sentence);

    if request.volume.is_some() {
      let vol = request.volume.unwrap();

      // This isn't perfect hashing for floats, but is mostly
      // what I want.
      let hashed = (vol * 1000.0) as i16;
      let hi = (hashed >> 8 & 0xff) as u8;
      let lo = (hashed & 0xff) as u8;
      hasher.input(&[hi, lo]);
    } else {
      hasher.input(&[0u8]);
    }

    let mut use_byte = 0u8;
    if request.use_phonemes { use_byte |= (1 << 1); }
    if request.use_diphones { use_byte |= (1 << 2); }
    if request.use_words { use_byte |= (1 << 3); }

    println!("Use byte: {}", use_byte);

    hasher.input(&[use_byte]);

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

