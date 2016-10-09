// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use error::SynthError;
use regex::Regex;
use std::collections::HashMap;
use std::fs::File;
use std::io::BufRead;
use std::io::BufReader;

pub struct AbbreviationsMap {
  /// A map of abbreviation to the words the abbreviation stands for.
  /// eg. 'omg' -> ["oh", "my", "god"]
  dictionary: HashMap<String , Vec<String>>
}

impl AbbreviationsMap {

  /// Primarily for testing.
  pub fn empty() -> AbbreviationsMap {
    AbbreviationsMap { dictionary: HashMap::new() }
  }

  /// Primarily for testing.
  pub fn new(map: HashMap<String, Vec<String>>) -> AbbreviationsMap {
    AbbreviationsMap { dictionary: map }
  }

  /// Read custom abbreviation dictionary.
  /// Based on the CMU Arpabet dictionary format.
  pub fn load_from_file(filename: &str) -> Result<AbbreviationsMap, SynthError> {
    let f = try!(File::open(filename));
    let mut reader = BufReader::new(f);

    let mut map = HashMap::new();
    let mut buffer = String::new();

    // Format resembles the following,
    // "OMG  oh my god"
    let re = Regex::new(r"^([\w-']+)\s+(.*)\n$").unwrap();

    while try!(reader.read_line(&mut buffer)) > 0 {
      match re.captures(&buffer) {
        None => {},
        Some(caps) => {
          let abbr_match = caps.at(1);
          let words_match = caps.at(2);

          if abbr_match.is_some() && words_match.is_some() {
            let abbr = abbr_match.unwrap().to_lowercase();
            let split = words_match.unwrap().split(" ");
            let v1 = split.collect::<Vec<&str>>();
            let v2 = v1.iter()
                .map(|s| s.to_lowercase().to_string())
                .collect::<Vec<String>>();
            map.insert(abbr, v2);
          }
        },
      }
      buffer.clear();
    }

    if map.is_empty() {
      Err(SynthError::EmptyFile)
    } else {
      Ok(AbbreviationsMap { dictionary: map })
    }
  }

  /// Whether the abbreviation exists.
  pub fn is_abbreviation(&self, abbreviation: &str) -> bool {
    self.dictionary.contains_key(abbreviation)
  }

  /// Get an abbreviation from the map.
  pub fn get_words(&self, abbreviation: &str) -> Option<Vec<String>> {
    self.dictionary.get(abbreviation).and_then(|p| {
      Some(p.iter().map(|s| s.to_string()).collect::<Vec<String>>())
    })
  }
}

