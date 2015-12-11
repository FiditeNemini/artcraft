// Copyright (c) 2015 Brandon Thomas <bt@brand.io>

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
use std::io::BufReader;
use std::io::BufWriter;
use std::io::Cursor;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::error::Error;
use std::fmt::{self, Debug};

use words::split_sentence;
use super::error_filter::build_error;

const QUERY_PARAM : &'static str = "q";

/// Synthesizes audio from input.
pub struct AudioSynthHandler {
  /// Root of where files can be served from.
  /// A PathBuf since `Path` can only be created as a borrow.
  directory: PathBuf,
}

impl Handler for AudioSynthHandler {
  /// Process request.
  fn handle(&self, req: &mut Request) -> IronResult<Response> {
    info!("GET /speak");

    let error = build_error(status::BadRequest, "Missing `q` parameter.");

    // Get the request ETag. TODO: Cleanup
    let request_hash = {
      match req.headers.get::<IfNoneMatch>() {
        None => { "".to_string() },
        Some(etag) => { etag.to_string() }
      }
    };
    
    // Get the request sentence.
    let sentence = match req.get_ref::<UrlEncodedQuery>() {
      Err(_) => { return error; },
      Ok(ref map) => {
        match map.get(QUERY_PARAM) {
          None => { return error; },
          Some(list) => { 
            match list.get(0) {
              None => { return error; },
              Some(s) => { s },
            }
          },
        }
      },
    };

    info!("Speak Request: {}", sentence);

    // FIXME: Varies with spaces, formatting, etc.
    let hash = self.sha_digest(sentence);
    let entity_tag = EntityTag::new(true, hash.to_owned());

    if request_hash == entity_tag.to_string() {
      return Ok(Response::with(status::NotModified));
    }

    let result = self.create_audio(sentence);
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
  fn create_audio(&self, sentence: &str) -> Vec<u8> {
    let words = split_sentence(sentence);

    if words.len() == 0 {
      // TODO: Raise error!
    }

    // Note: Keeping a list of buffered file readers is stupid and is simply 
    // being done for this example. I'll create a multithreaded shared LRU cache
    // that reads from the disk and uses the dictionary word as the lookup key.
    let mut file_readers : Vec<WavReader<BufReader<File>>> = Vec::new();

    for word in words.iter() {
      let filename = self.get_file_path(word);
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

    let spec = self.get_spec(&words[0]);

    self.write_buffer(&spec, all_samples)
  }


  fn sha_digest(&self, sentence: &str) -> String {
    let mut hasher = Sha1::new();
    hasher.input_str(sentence);
    hasher.result_str().to_string()
  }

  fn get_file_path(&self, word: &str) -> PathBuf {
    let sound_directory = self.directory.as_path();
    sound_directory.join(format!("{}.wav", word))
  }

  fn get_spec(&self, word: &str) -> WavSpec {
    let filename = self.get_file_path(word);
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

