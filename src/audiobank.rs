// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use error::SynthError;
use hound::WavReader;
use hound::WavSpec;
use std::path::Path;
use std::path::PathBuf;

pub type SampleBytes = Vec<i16>;

/**
 * Fetch wav audio files from the audio bank.
 *
 * The file database has a well-defined structure:
 *
 *   /sounds
 *     /{speaker_name}
 *       /1-phones
 *         /_begin (starting syllable of word)
 *           /IY0.wav
 *           ...
 *         /_end (ending syllable of word)
 *           /IY0.wav
 *           ...
 *         /_middle (syllables only in the middle)
 *           ...
 *         /_question (syllables that end in an interrogative tone)
 *           ...
 *         /IY0.wav
 *         /IY1.wav
 *         ...
 *       /2-phones
 *         /_begin
 *           /F_R.wav
 *         /_end
 *           /IH0_NG.wav
 *         /AW1_N.wav
 *       /words
 *         /all.wav
 *         /words.wav
 *
 * TODO: Caching of wav files in memory.
 * TODO: Path generation is _insecure_.
 */
pub struct Audiobank {
  /// Root path to the files.
  audio_path: PathBuf,
}

#[derive(Debug)]
pub enum SamplePreference {
  /// Prefer a word-opening syllable.
  Begin,
  /// Prefer syllable sampled from the middle of a word.
  Middle,
  /// Prefer syllable taken from the end of a word.
  End,
  /// Prefer a syllable taken from the end of a question.
  EndQuestion,
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
  pub fn get_word(&self, speaker: &str, word: &str) -> Option<SampleBytes> {
    if check_path(speaker).is_err() || check_path(word).is_err() {
      return None;
    }

    let path = self.audio_path.join(format!("{}/", speaker))
        .join("words/")
        .join(format!("{}.wav", word));

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
   * Get an n-phone in the form "{1st}_{2nd}_{...}_{nth}.wav".
   *  - speaker: the voice to use
   *  - n_phone: the phoneme slice, eg ['AH1', 'NG'].
   *  - sample_preference: which end of a word to prefer.
   *  - use_ends: use special "begin"/"end" etc. n-phones.
   */
  pub fn get_n_phone(&self,
                     speaker: &str,
                     n_phone: &[String],
                     sample_preference: SamplePreference,
                     use_ends: bool)
      -> Option<SampleBytes> {

    let (directory, filename) = match n_phone.len() {
      1 => {
        (
          "1-phones/",
          format!("{}.wav", n_phone[0]),
        )
      },
      2 => {
        (
          "2-phones/",
          format!("{}_{}.wav", n_phone[0], n_phone[1]),
        )
      },
      3 => {
        (
          "3-phones/",
          format!("{}_{}_{}.wav", n_phone[0], n_phone[1], n_phone[2]),
        )
      },
      4 => {
        (
          "4-phones/",
          format!("{}_{}_{}_{}.wav",
                  n_phone[0], n_phone[1], n_phone[2], n_phone[3]),
        )
      },
      5 => {
        (
          "5-phones/",
          format!("{}_{}_{}_{}_{}.wav",
                  n_phone[0], n_phone[1], n_phone[2], n_phone[3], n_phone[4]),
        )
      },
      _ => {
        return None; // Don't support more than 5-phones.
      }
    };

    // FIXME: This is a lame check.
    if check_path(speaker).is_err()
        || check_path(&filename).is_err() {
      return None;
    }

    // Try to obtain our sample from the end we prefer first.
    if use_ends {
      let mut pref_path = self.audio_path.join(format!("{}/", speaker))
          .join(directory);

      pref_path = match sample_preference {
        SamplePreference::Begin => { pref_path.join("_begin") },
        SamplePreference::Middle => { pref_path.join("_middle") },
        SamplePreference::End => { pref_path.join("_end") },
        SamplePreference::EndQuestion => { pref_path.join("_question") },
      };

      pref_path = pref_path.join(&filename);

      match self.read_wave_file(&pref_path) {
        Some(p) => {
          info!(target: "synthesis",
                "Used {:?} for {:?}", sample_preference, n_phone);
          return Some(p)
        },
        None => {},
      }
    }

    let path = self.audio_path.join(format!("{}/", speaker))
        .join(directory)
        .join(filename);

    self.read_wave_file(&path)
  }

  /**
   * Get the wav data for the (speaker,phoneme), or None if it does not
   * exist.
   */
  pub fn get_phoneme(&self, speaker: &str, phoneme: &str)
      -> Option<Vec<i16>> {
    if check_path(speaker).is_err() || check_path(phoneme).is_err() {
      return None;
    }

    let path = self.audio_path.join(format!("{}/", speaker))
        .join("1-phones/")
        .join(format!("{}.wav", phoneme));

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

  /// Phoneme for "beginning" of a word.
  pub fn get_begin_phoneme(&self, speaker: &str, phoneme: &str)
      -> Option<Vec<i16>> {
    if check_path(speaker).is_err() || check_path(phoneme).is_err() {
      return None;
    }

    let path = self.audio_path.join(format!("{}/", speaker))
        .join("1-phones/_begin")
        .join(format!("{}.wav", phoneme));

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

  /// Phoneme for "end" of a word.
  pub fn get_end_phoneme(&self, speaker: &str, phoneme: &str)
      -> Option<Vec<i16>> {
    if check_path(speaker).is_err() || check_path(phoneme).is_err() {
      return None;
    }

    let path = self.audio_path.join(format!("{}/", speaker))
        .join("1-phones/_end")
        .join(format!("{}.wav", phoneme));

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
   * Get the miscellaneous sound effect file.
   */
  pub fn get_misc(&self, name: &str) -> Option<Vec<i16>> {
    if check_path(name).is_err() {
      return None;
    }

    let path = self.audio_path.join("misc/")
        .join(format!("{}.wav", name));

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
  pub fn get_spec(&self, speaker: &str, word: &str)
      -> Result<WavSpec, SynthError> {
    try!(check_path(speaker));
    try!(check_path(word));

    let path = self.audio_path.join(format!("{}/", speaker))
        .join("_words/")
        .join(format!("{}.wav", word));

    let reader = try!(WavReader::open(path));
    Ok(reader.spec())
  }

  // TODO: This should be removed. We should cache the wav headers.
  pub fn get_misc_spec(&self, name: &str) -> Result<WavSpec, SynthError> {
    try!(check_path(name));

    let path = self.audio_path.join("misc/")
        .join(format!("{}.wav", name));

    let reader = try!(WavReader::open(path));
    Ok(reader.spec())
  }

  /// Read a waveform.
  fn read_wave_file(&self, path: &PathBuf) -> Option<Vec<i16>> {
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
}

fn check_path(path: &str) -> Result<(), SynthError> {
  // FIXME: Hack so I can release soon. Rewrite this whole logic plz.
  if path.contains("..") ||
      path.contains("/") ||
      path.contains("$") ||
      path.contains("~")
  {
    Err(SynthError::BadInput { description: "invalid path" })
  } else {
    Ok(())
  }
}

