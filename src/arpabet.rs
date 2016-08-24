// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use error::SynthError;
use std::collections::HashMap;
use regex::Regex;
use std::fs::File;
use std::io::BufReader;
use std::io::BufRead;
use std::io::Read;

pub type Word = String;
pub type Phoneme = String;
pub type Polyphone = Vec<Phoneme>;

pub struct ArpabetDictionary {
  /// A map of lowercase words to polyphone breakdown (phones are uppercase).
  /// eg. 'jungle' -> [JH, AH1, NG, G, AH0, L]
  dictionary: HashMap<Word, Polyphone>
}

impl ArpabetDictionary {
  /// Read CMU's Arpabet Dictionary.
  /// See http://www.speech.cs.cmu.edu/cgi-bin/cmudict
  pub fn load_from_file(filename: &str) -> Result<ArpabetDictionary, SynthError> {
    let mut f = try!(File::open(filename));
    let mut reader = BufReader::new(f);

    let mut map = HashMap::new();
    let mut buffer = String::new();

    // Format resembles the following,
    // ABBREVIATE  AH0 B R IY1 V IY0 EY2 T
    let re = Regex::new(r"^(\w+)\s+(.*)\n$").unwrap();

    while try!(reader.read_line(&mut buffer)) > 0 {
      match re.captures(&buffer) {
        None => {},
        Some(caps) => {
          let word_match = caps.at(1);
          let phonemes_match = caps.at(2);

          if word_match.is_some() && phonemes_match.is_some() {
            let word = word_match.unwrap().to_lowercase();
            let split = phonemes_match.unwrap().split(" ");
            let v1 = split.collect::<Vec<&str>>();
            let v2 = v1.iter().map(|s| s.to_string()).collect::<Vec<String>>();
            map.insert(word, v2);
          }
        },
      }
      buffer.clear();
    }

    if map.is_empty() {
      Err(SynthError::EmptyFile)
    } else {
      Ok(ArpabetDictionary { dictionary: map })
    }
  }

  /// Get a polyphone from the dictionary.
  pub fn get_polyphone(&self, word: &str) -> Option<Polyphone> {
    self.dictionary.get(word).and_then(|p| {
      Some(p.iter().map(|s| s.to_string()).collect::<Vec<String>>())
    })
  }
}

