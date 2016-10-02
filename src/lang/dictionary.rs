// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use speaker::Speaker;
use std::collections::HashSet;
use std::collections::HashMap;

pub type Word = String;

pub struct Dictionary {
  /// Words that exist in this dictionary.
  words: HashSet<Word>,
}

pub struct UniversalDictionary {
  /// There is a single arpabet dictionary that works for all speakers.
  arpabet_dictionary: Dictionary,
  /// There are speaker-specific word dictionaries.
  speaker_dictionaries: HashMap<Speaker, Dictionary>,
}

impl Dictionary {
  pub fn new(words: HashSet<Word>) -> Dictionary {
    Dictionary { words: words }
  }

  pub fn empty() -> Dictionary {
    Dictionary { words: HashSet::new() }
  }

  /// Returns true if the dictionary contains the word.
  pub fn contains(&self, word: &str) -> bool {
    self.words.contains(word)
  }

  /// For testing only.
  #[allow(dead_code)]
  fn insert(mut self, word: &str) -> Self {
    self.words.insert(word.to_string());
    self
  }
}

impl UniversalDictionary {
  pub fn new() -> UniversalDictionary {
    UniversalDictionary {
      arpabet_dictionary: Dictionary::empty(),
      speaker_dictionaries: HashMap::new(),
    }
  }

  pub fn set_arpabet_dictionary(&mut self, arpabet_dictionary: Dictionary)
      -> &mut Self {
    self.arpabet_dictionary = arpabet_dictionary;
    self
  }

  pub fn set_speaker_dictionary(&mut self,
                                speaker: Speaker,
                                dictionary: Dictionary)
      -> &mut Self {
    self.speaker_dictionaries.insert(speaker, dictionary);
    self
  }

  /// Returns true if anyone can say the word.
  pub fn contains(&self, word: &str) -> bool {
    self.arpabet_dictionary.contains(word)
  }

  /// Returns true if the speaker can say the word.
  pub fn contains_for(&self, speaker: &Speaker, word: &str) -> bool {
    self.arpabet_dictionary.contains(word) ||
        self.speaker_dictionaries.get(speaker)
            .map(|dict| { dict.contains(word) })
            .unwrap_or(false)
  }
}

#[cfg(test)]
mod tests {
  use speaker::Speaker;
  use super::*;

  #[test]
  fn universal_dictionary_contains_for_speaker() {
    let alice = Speaker::new("alice".to_string());
    let bob = Speaker::new("bob".to_string());

    let arpa = Dictionary::empty()
        .insert("foo")
        .insert("bar");

    let alice_dict = Dictionary::empty()
        .insert("111")
        .insert("222");

    let bob_dict = Dictionary::empty()
        .insert("aaa")
        .insert("bbb");

    let mut uni = UniversalDictionary::new();
    uni.set_arpabet_dictionary(arpa)
        .set_speaker_dictionary(alice.clone(), alice_dict)
        .set_speaker_dictionary(bob.clone(), bob_dict);


    assert_eq!(true, uni.contains_for(&alice, "foo"));
    assert_eq!(true, uni.contains_for(&alice, "bar"));
    assert_eq!(false, uni.contains_for(&alice, "baz"));
    assert_eq!(true, uni.contains_for(&alice, "111"));
    assert_eq!(true, uni.contains_for(&alice, "222"));
    assert_eq!(false, uni.contains_for(&alice, "aaa"));
    assert_eq!(false, uni.contains_for(&alice, "bbb"));

    assert_eq!(true, uni.contains_for(&bob, "foo"));
    assert_eq!(false, uni.contains_for(&bob, "111"));
    assert_eq!(true, uni.contains_for(&bob, "aaa"));
    assert_eq!(false, uni.contains_for(&bob, "absent"));

    let nobody = Speaker::new("nobody".to_string());

    assert_eq!(true, uni.contains_for(&nobody, "foo"));
    assert_eq!(false, uni.contains_for(&nobody, "111"));
    assert_eq!(false, uni.contains_for(&nobody, "aaa"));
    assert_eq!(false, uni.contains_for(&nobody, "absent"));
  }
}

