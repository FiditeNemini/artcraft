// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use error::SynthError;
use hound::WavReader;
use hound::WavSpec;
use hound::WavWriter;
use std::path::Path;
use std::path::PathBuf;

/** 
 * Fetch wav audio files from the audio bank.
 *
 * The file database has a well-defined structure:
 *
 *   /sounds
 *     /{speaker_name}
 *       /_words
 *         /all.wav
 *         /words.wav
 *       /_phonemes
 *         /IY0.wav
 *         /IY0.wav
 *
 * TODO: Caching of wav files in memory.
 * TODO: Path generation is _insecure_.
 */
pub struct Audiobank {
  /// Root path to the files.
  audio_path: PathBuf,
}

impl Audiobank {
  /// CTOR.
  pub fn new(audio_path: &str) -> Audiobank {
    Audiobank {
      audio_path: Path::new(audio_path).to_path_buf(),
    }
  }

  /**
   * Get the wav data for the (speaker,word), or None if it does not exist.
   */
  pub fn get_word(&self, speaker: &str, word: &str) -> Option<Vec<i16>> {

    println!("Audio Path: {:?}", self.audio_path);

    let path = self.audio_path.join(format!("{}/", speaker))
        .join("_words/")
        .join(format!("{}.wav", word));

    println!("Path: {:?}", path);

    let mut reader = match WavReader::open(path) {
      Err(_) => { return None; },
      Ok(reader) => reader,
    };

    // TODO: Inefficient.
    let mut all_samples = Vec::new();
    let samples = reader.samples::<i16>();
    for sample in samples {
      all_samples.push(sample.unwrap());
    }

    Some(all_samples)
  }

  /**
   * Get the wav data for the (speaker,phoneme), or None if it does not exist.
   */
  pub fn get_phoneme(&self, speaker: &str, phoneme: &str) -> Option<Vec<i16>> {
    let path = self.audio_path.join(format!("{}/", speaker))
        .join("_phonemes/")
        .join(format!("{}.wav", phoneme));

    println!("Path: {:?}", path);

    let mut reader = match WavReader::open(path) {
      Err(_) => { return None; },
      Ok(reader) => reader,
    };

    // TODO: Inefficient.
    let mut all_samples = Vec::new();
    let samples = reader.samples::<i16>();
    for sample in samples {
      all_samples.push(sample.unwrap());
    }

    Some(all_samples)
  }

  // TODO: This should be removed. We should cache the wav headers.
  pub fn get_spec(&self, speaker: &str, word: &str) -> Result<WavSpec, SynthError> {
    let path = self.audio_path.join(format!("{}/", speaker))
        .join("_words/")
        .join(format!("{}.wav", word));

    println!("Path: {:?}", path);

    let reader = try!(WavReader::open(path));
    Ok(reader.spec())
  }
}

