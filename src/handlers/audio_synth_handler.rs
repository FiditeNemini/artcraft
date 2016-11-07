// Copyright (c) 2015 Brandon Thomas <bt@brand.io>

use config::Config;
use crypto::digest::Digest;
use crypto::sha1::Sha1;
use iron::Handler;
use iron::IronError;
use iron::Plugin;
use iron::headers::ETag;
use iron::headers::EntityTag;
use iron::headers::IfNoneMatch;
use iron::mime::Mime;
use iron::prelude::IronResult;
use iron::prelude::Request;
use iron::prelude::Response;
use iron::status;
use lang::parser::Parser;
use speaker::Speaker;
use std::collections::HashMap;
use std::i16;
use std::str::FromStr;
use std::sync::Arc;
use std::sync::RwLock;
use super::error_filter::build_error;
use synthesis::error::SynthesisError;
use synthesis::synthesizer::SynthesisParams;
use synthesis::synthesizer::Synthesizer;
use time::PreciseTime;
use urlencoded::UrlEncodedQuery;

const SENTENCE_PARAM : &'static str = "s";
const SPEAKER_PARAM : &'static str = "v";
const SPEED_PARAM : &'static str = "spd";
const USE_MONOPHONES_PARAM: &'static str = "um";
const USE_SYLLABLES_PARAM: &'static str = "us";
const USE_N_PHONES_PARAM: &'static str = "un";
const USE_WORDS_PARAM: &'static str = "uw";
const USE_ENDS_PARAM: &'static str = "ue";
const VOLUME_PARAM : &'static str = "vol";
const PADDING_BETWEEN_PHONES_PARAM: &'static str = "pbp";
const POLYPHONE_PADDING_START_PARAM : &'static str = "pps";
const POLYPHONE_PADDING_END_PARAM : &'static str = "ppe";
const WORD_PADDING_START_PARAM : &'static str = "wps";
const WORD_PADDING_END_PARAM : &'static str = "wpe";

type QueryParams = HashMap<String, Vec<String>>;

/// Represents a request to this endpoint.
#[derive(Clone, Debug)]
struct SpeakRequest {
  /** The sentence to be spoken. */
  pub sentence: String,

  /** The voice to use to render the audio. */
  pub speaker: Speaker,

  /** An optional volume multiplier. */
  pub volume: Option<f32>,

  /** An optional speed multiplier. */
  pub speed: Option<f32>,

  /** Whether to use words. */
  pub use_words: bool,

  /** Whether to use n-phones. */
  pub use_n_phones: bool,

  /** Whether to use bare monophones. */
  pub use_bare_monophones: bool,

  /** Whether to use syllable boundaries. */
  pub use_syllables: bool,

  /** Whether to use "ends": start, end, etc. */
  pub use_ends: bool,

  /** Padding between monophones or n-phone clusters. */
  pub padding_between_phones: Option<u16>,

  /** Padding before a polyphone. */
  pub polyphone_padding_start: Option<u16>,

  /** Padding after a polyphone. */
  pub polyphone_padding_end: Option<u16>,

  /// Silent padding before a word (not one constructed from phones).
  pub word_padding_start: Option<u16>,

  /// Silent padding after a word (not one constructed from phones).
  pub word_padding_end: Option<u16>,
}

enum SpeakerRequestError {
  //SentenceMissing,
  SentenceInvalid,
  //SpeakerMissing,
  SpeakerInvalid,
  //VolumeInvalid,
}

/// Synthesizes audio from input.
pub struct AudioSynthHandler {
  /// Sentence parser.
  parser: Parser,

  /// The TTS synthesizer.
  synthesizer: Arc<RwLock<Synthesizer>>,

  /// Server configs.
  config: Config,
}

impl SpeakRequest {
  /// Parse a speak request from a raw HTTP request.
  pub fn parse(http_request: &mut Request)
      -> Result<SpeakRequest, SpeakerRequestError> {
    let params = match http_request.get_ref::<UrlEncodedQuery>() {
      Ok(multimap) => multimap,
      Err(_) => {
        return Err(SpeakerRequestError::SentenceInvalid);
      },
    };

    let sen = match get_str(params, SENTENCE_PARAM) {
      Some(s) => s.to_string(),
      None => {
        return Err(SpeakerRequestError::SentenceInvalid);
      },
    };

    let spk = match get_str(params, SPEAKER_PARAM) {
      Some(s) => Speaker::new(s.to_string()),
      None => {
        return Err(SpeakerRequestError::SpeakerInvalid);
      },
    };

    let volume = get_f32(params, VOLUME_PARAM);

    let speed = get_f32(params, SPEED_PARAM).and_then(|f| {
      // Don't waste CPU calculating speed if it isn't supplied.
      let diff = f - 1.0;
      if diff > -0.005 && diff < 0.005 {
        None
      } else {
        Some(f)
      }
    });

    let use_monophones = get_bool(params, USE_MONOPHONES_PARAM).unwrap_or(true);
    let use_n_phones = get_bool(params, USE_N_PHONES_PARAM).unwrap_or(true);
    let use_syllables = get_bool(params, USE_SYLLABLES_PARAM).unwrap_or(true); // new hotness
    let use_words = get_bool(params, USE_WORDS_PARAM).unwrap_or(true);
    let use_ends = get_bool(params, USE_ENDS_PARAM).unwrap_or(true);

    let pbp = get_u16(params, PADDING_BETWEEN_PHONES_PARAM).or(None);
    let pps = get_u16(params, POLYPHONE_PADDING_START_PARAM).or(Some(600));
    let ppe = get_u16(params, POLYPHONE_PADDING_END_PARAM).or(Some(600));
    let wps = get_u16(params, WORD_PADDING_START_PARAM).or(Some(600));
    let wpe = get_u16(params, WORD_PADDING_END_PARAM).or(Some(600));

    Ok(SpeakRequest {
      sentence: sen,
      speaker: spk,
      volume: volume,
      speed: speed,
      use_bare_monophones: use_monophones,
      use_n_phones: use_n_phones,
      use_syllables: use_syllables,
      use_words: use_words,
      use_ends: use_ends,
      padding_between_phones: pbp,
      polyphone_padding_start: pps,
      polyphone_padding_end: ppe,
      word_padding_start: wps,
      word_padding_end: wpe,
    })
  }

  /// Generate a SHA checksum of the request.
  /// This can be used as a caching header for the client.
  fn sha_digest(&self) -> String {
    let mut hasher = Sha1::new();

    hasher.input_str(&self.speaker.to_string());
    hasher.input_str(&self.sentence);

    if self.volume.is_some() {
      let vol = self.volume.unwrap();

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
    if self.use_bare_monophones { use_byte |= 1 << 1; }
    if self.use_n_phones { use_byte |= 1 << 2; }
    if self.use_syllables { use_byte |= 1 << 3; }
    if self.use_words { use_byte |= 1 << 4; }
    if self.use_ends { use_byte |= 1 << 5; }

    hasher.input(&[use_byte]);

    hasher.result_str()
  }
}

impl Handler for AudioSynthHandler {
  /// Process request.
  fn handle(&self, req: &mut Request) -> IronResult<Response> {
    let sentence_error = build_error(status::BadRequest,
        &format!("Missing `{}` parameter.", SENTENCE_PARAM));

    let request = match SpeakRequest::parse(req) {
      Err(_) => { return sentence_error },
      Ok(s) => s,
    };

    info!(target: "handler", "Speak Request: {:?}", request);
    info!(target: "raw_sentence", "{:?}", request.sentence);

    // Get the request ETag. TODO: Cleanup
    let request_hash = {
      match req.headers.get::<IfNoneMatch>() {
        None => { "".to_string() },
        Some(etag) => { etag.to_string() }
      }
    };

    // FIXME: Varies with spaces, formatting, etc.
    let hash = request.sha_digest();
    let entity_tag = EntityTag::new(true, hash.to_owned());

    info!(target: "handler", "Request Header Caching Sha: {}", hash);

    if self.config.use_caching_headers.unwrap_or(true) {
      // Don't generate file if caching header is matched.
      if request_hash == entity_tag.to_string() {
        info!(target: "handler",
              "Caching headers match; responding with NotModified.");
        return Ok(Response::with(status::NotModified));
      }
    }

    let start = PreciseTime::now();
    let result = try!(self.create_audio(request));

    info!(target: "timing",
          "Total parsing and synthesis took: {}", start.to(PreciseTime::now()));

    let mime_type = "audio/wav".parse::<Mime>().unwrap();

    let mut response = Response::with((mime_type, status::Ok, result));
    response.headers.set(ETag(entity_tag));

    Ok(response)
  }
}

impl AudioSynthHandler {
  pub fn new(parser: Parser,
             synthesizer: Arc<RwLock<Synthesizer>>,
             config: Config) -> AudioSynthHandler {
    AudioSynthHandler {
      parser: parser,
      synthesizer: synthesizer,
      config: config,
    }
  }

  /// Create audio from the sentence.
  fn create_audio(&self, request: SpeakRequest)
                  -> Result<Vec<u8>, SynthesisError> {
    let synth = match self.synthesizer.read() {
      Err(_) => { return Err(SynthesisError::LockError); },
      Ok(synth) => synth,
    };

    let params = SynthesisParams {
      use_words: request.use_words,
      use_bare_monophones: request.use_bare_monophones,
      use_n_phones: request.use_n_phones,
      use_syllables: request.use_syllables,
      use_ends: request.use_ends,
      volume: request.volume,
      speed: request.speed,
      padding_between_phones: request.padding_between_phones,
      polyphone_padding_start: request.polyphone_padding_start,
      polyphone_padding_end: request.polyphone_padding_end,
      word_padding_start: request.word_padding_start,
      word_padding_end: request.word_padding_end,
    };

    let tokens = self.parser.parse(&request.sentence);
    synth.generate(tokens, &request.speaker, params)
  }
}

fn get_str<'a>(params: &'a QueryParams, param_name: &str)
               -> Option<&'a String> {
  params.get(param_name)
      .and_then(|v| v.get(0))
}

fn get_bool(params: &QueryParams, param_name: &str) -> Option<bool> {
  get_str(params, param_name)
      .map(|s| s.trim())
      .map(|s| FromStr::from_str(s))
      .and_then(|res| res.ok())
}

fn get_u16(params: &QueryParams, param_name: &str) -> Option<u16> {
  get_str(params, param_name)
      .map(|s| s.trim())
      .map(|s| s.parse::<u16>())
      .and_then(|res| res.ok())
      .and_then(|d| if d == 0 { None } else { Some(d) } )
}

fn get_f32(params: &QueryParams, param_name: &str) -> Option<f32> {
  get_str(params, param_name)
      .map(|s| s.trim())
      .map(|s| s.parse::<f32>())
      .and_then(|res| res.ok())
}

impl From<SynthesisError> for IronError {
  fn from(error: SynthesisError) -> IronError {
    let mime = "text/plain".parse::<Mime>().unwrap();
    let response = (mime, status::InternalServerError, "Service Error");
    IronError::new(error, response)
  }
}

#[cfg(test)]
mod tests {
  use speaker::Speaker;
  use super::SpeakRequest;

  #[test]
  fn test_request_hash() {
    let request_1 = SpeakRequest {
      sentence: "same sentence".to_string(),
      speaker: Speaker::new("speaker".to_string()),
      volume: Some(2.0),
      speed: Some(1.5),
      use_bare_monophones: true,
      use_n_phones: false,
      use_syllables: true,
      use_words: false,
      use_ends: false,
      padding_between_phones: Some(300),
      polyphone_padding_start: None,
      polyphone_padding_end: None,
      word_padding_start: None,
      word_padding_end: None,
    };

    let request_2 = SpeakRequest {
      sentence: "same sentence".to_string(),
      speaker: Speaker::new("speaker".to_string()),
      volume: Some(2.0),
      speed: Some(1.5),
      use_bare_monophones: true,
      use_n_phones: false,
      use_syllables: true,
      use_words: false,
      use_ends: false,
      padding_between_phones: Some(300),
      polyphone_padding_start: None,
      polyphone_padding_end: None,
      word_padding_start: None,
      word_padding_end: None,
    };

    assert!(request_1.sha_digest() == request_2.sha_digest());

    let request_2 = SpeakRequest {
      sentence: "same sentence".to_string(),
      speaker: Speaker::new("speaker".to_string()),
      volume: None,
      speed: Some(1.5),
      use_bare_monophones: false,
      use_n_phones: true,
      use_syllables: false,
      use_words: true,
      use_ends: false,
      padding_between_phones: Some(300),
      polyphone_padding_start: None,
      polyphone_padding_end: None,
      word_padding_start: None,
      word_padding_end: Some(400),
    };

    assert!(request_1.sha_digest() != request_2.sha_digest());

    let request_2 = SpeakRequest {
      sentence: "different sentence".to_string(),
      speaker: Speaker::new("speaker".to_string()),
      volume: Some(2.0),
      speed: Some(1.5),
      use_bare_monophones: true,
      use_n_phones: false,
      use_syllables: true,
      use_words: false,
      use_ends: false,
      padding_between_phones: Some(300),
      polyphone_padding_start: None,
      polyphone_padding_end: None,
      word_padding_start: None,
      word_padding_end: None,
    };

    assert!(request_1.sha_digest() != request_2.sha_digest());
  }
}
