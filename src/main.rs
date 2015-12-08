extern crate hound;
extern crate iron;
extern crate router;
extern crate rustc_serialize;
extern crate urlencoded;

pub mod handlers;
pub mod words;

use std::env;
use std::fs::File;
use std::io::BufReader;
use std::path::{Path, PathBuf};

use iron::prelude::*;
use router::Router;
use hound::{WavReader, WavSpec, WavWriter};

use handlers::vocab_list_handler::VocabListHandler;
use handlers::audio_synth_handler::AudioSynthHandler;

fn main() {
  //create_from_argv();
  start_server();
}

fn start_server() {
  let audio_path = "./sounds/trump";

  let mut router = Router::new();
  router.get("/speak", AudioSynthHandler::new(audio_path));
  router.get("/words", VocabListHandler::new(audio_path));

  println!("Starting server...");
  Iron::new(router).http("0.0.0.0:9000").unwrap();
}

fn create_from_argv() {
  let dictionary = words_from_argv();

  // Note: Keeping a list of buffered file readers is stupid and is simply 
  // being done for this example. I'll create a multithreaded shared LRU cache
  // that reads from the disk and uses the dictionary word as the lookup key.
  let mut file_readers : Vec<WavReader<BufReader<File>>> = Vec::new();

  for word in dictionary.iter() {
    let filename = get_filename(word);
    println!("Opening file : {}", filename.to_str().unwrap());
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

  let spec = get_spec(&dictionary[0]);

  write_file("output.wav", &spec, all_samples);
}

fn words_from_argv() -> Vec<String> {
  let mut words = Vec::new();

  match env::args().nth(1) {
    None => {},
    Some(arg) => {
      let mut split = arg.split(" ");
      for s in split {
        words.push(s.to_string());
      }
    }
  }

  words
}

fn get_filename(word: &str) -> PathBuf {
  // TODO: Const or startup param.
  let sound_directory = Path::new("./sounds/trump");
  sound_directory.join(format!("{}.wav", word))
}

fn get_spec(word: &str) -> WavSpec {
  let filename = get_filename(word);
  let reader = WavReader::open(filename).unwrap();
  reader.spec()
}

fn write_file(filename: &str, spec: &WavSpec, samples: Vec<i16>) {
  let mut writer = WavWriter::create(filename, *spec).unwrap();
  println!("Writing file : {}", filename);

  for s in samples {
    writer.write_sample(s).unwrap();
  }
}

