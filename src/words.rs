// Copyright (c) 2015 Brandon Thomas <bt@brand.io>

/// Split a sentence into words. Remove extra padding, etc.
pub fn split_sentence(sentence: &str) -> Vec<String> {
  let mut words = Vec::new();
  let split = sentence.split(" ");

  // TODO: Keep only \w, '-', '.', and apostrophe.
  for s in split {
    let trim = s.trim();
    if trim.len() == 0 {
      continue;
    }
    words.push(trim.to_lowercase());
  }

  words
}

