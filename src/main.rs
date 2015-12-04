extern crate hound;
extern crate iron;
extern crate router;

pub mod vocab_list_handler;

use std::fs::File;
use std::io::BufReader;
use std::path::{Path, PathBuf};

use iron::prelude::*;
use router::Router;
use hound::{WavReader, WavSpec, WavWriter};

use vocab_list_handler::VocabListHandler;

fn main() {
  let dictionary = [
    "absolutely",
    "that",
  ];

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

  let spec = get_spec(dictionary[0]);

  write_file("output.wav", &spec, all_samples);

  //start_server();
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

fn start_server() {
  println!("starting server");
  let mut router = Router::new();
  router.get("/vocab_list", VocabListHandler::new("./sounds/trump"));
  Iron::new(router).http("0.0.0.0:9000").unwrap();
}

