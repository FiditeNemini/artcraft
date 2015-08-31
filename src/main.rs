extern crate hound;
extern crate cpal;

use std::path::{Path, PathBuf};
use std::iter::ExactSizeIterator;
use std::f32::consts::PI;
use std::i16;
use std::io::BufReader;
use std::fs::File;
use std::env;
use std::thread;

use hound::WavSpec;
use hound::WavReader;

fn main() {
  let dictionary = [
    "welcome",
    "to",
    "the",
    "internet",
    "meme",
    "generator",
  ];

  // Note: Keeping a list of buffered file readers is stupid and is simply 
  // being done for this example. I'll create a multithreaded shared LRU cache
  // that reads from the disk and uses the dictionary word as the lookup key.
  let mut file_readers : Vec<WavReader<BufReader<File>>> = Vec::new();

  for word in dictionary.iter() {
    let filename = get_filename(word);

    println!("opening file : {}", filename.to_str().unwrap());
    let mut reader = hound::WavReader::open(filename).unwrap();

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
}

fn get_filename(word: &str) -> PathBuf {
  let sound_directory = Path::new("./sounds"); // TODO: Const or startup param.
  sound_directory.join(format!("{}.wav", word))
}

fn get_spec(word: &str) -> WavSpec {
  let filename = get_filename(word);
  let mut reader = hound::WavReader::open(filename).unwrap();
  reader.spec()
}

fn write_file(filename: &str, spec: &WavSpec, samples: Vec<i16>) {
  let mut writer = hound::WavWriter::create(filename, *spec).unwrap();

  for s in samples {
    writer.write_sample(s).unwrap();
  }
}
