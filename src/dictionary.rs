// Copyright (c) 2016 Brandon Thomas <bt@brand.io>

use std::collections::HashMap;
use std::fs::DirEntry;
use std::fs::File;
use std::fs;
use std::io::Read;
use std::io;
use std::path::{Path, PathBuf};

pub type VoiceName = String;

#[derive(RustcDecodable, RustcEncodable)]
pub struct VocabularyLibrary {
  /**
   * A map of several vocabularies with their associated speaker.
   */
  pub library: HashMap<VoiceName, Vocabulary>
}

#[derive(RustcDecodable, RustcEncodable)]
pub struct Vocabulary {
  /**
   * A list of all the words in a vocabulary.
   * This does not include duplicates, punctuation, etc.
   */
  pub words: Vec<String>
}

impl VocabularyLibrary {
  /** Read all of the vocabularies under a directory. */
  pub fn read_from_directory(directory: &Path) ->
      Result<VocabularyLibrary, io::Error> {
    let paths = try!(fs::read_dir(directory));
    let mut map = HashMap::new();

    for path in paths {
      let entry = try!(path);
      let filetype = try!(entry.file_type());

      if !filetype.is_dir() {
        continue;
      }

      let dirname = try!(get_filename(&entry));

      if ignorable_file(&dirname) || ignorable_dir(&dirname) {
        continue;
      }

      // FIXME: Opening FS reads in a loop is bad. Feel bad.
      let mut vocabulary = try!(Vocabulary::read_from_directory(
          entry.path().as_path()));

      if vocabulary.words.is_empty() {
        continue;
      }

      map.insert(dirname, vocabulary);
    }

    Ok(VocabularyLibrary { library: map })
  }
}

impl Vocabulary {
  /** Read in the vocabulary from a directory. */
  pub fn read_from_directory(directory: &Path) ->
      Result<Vocabulary, io::Error> {

    let word_directory = directory.join("words/");
    let paths = try!(fs::read_dir(word_directory));
    let mut words = Vec::new();

    for path in paths {
      let entry = try!(path);
      let filetype = try!(entry.file_type());

      if filetype.is_dir() {
        continue;
      }

      let filename = try!(get_filename(&entry));
      let word = filename.replace(".wav", "");

      if ignorable_file(&word) {
        continue;
      }

      words.push(word);
    }

    words.sort();

    Ok(Vocabulary { words: words })
  }
}

fn get_filename(entry: &DirEntry) -> Result<String, io::Error> {
  match entry.file_name().into_string() {
    Err(err) => {
      Err(io::Error::new(io::ErrorKind::Other, "Error reading filename"))
    },
    Ok(filename) => Ok(filename.to_string()),
  }
}

/** Files and directories we choose to skip. */
fn ignorable_file(filename: &str) -> bool {
  filename.starts_with("_") || filename.ends_with("_")
}

fn ignorable_dir(filename: &str) -> bool {
  filename == "misc"
}

