// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use arpabet::ArpabetDictionary;
use audiobank::Audiobank;
use effects::pause::generate_pause;
use effects::speed::change_speed;
use effects::volume::change_volume;
use error::SynthError;
use hound::WavSpec;
use hound::WavWriter;
use std::io::BufWriter;
use std::io::Cursor;
use words::split_sentence;

pub type WavBytes = Vec<u8>;

/**
 * Generates wave files from text input.
 */
pub struct Synthesizer {
  // TODO: For now we rely on word files existing on the filesystem
  // at runtime. This is pretty lame.
  ///// Word dictionary
  //word_dictionary: Vocabulary,

  /// Arpabet dictionary, (Word) -> (PhonemeList)
  arpabet_dictionary: ArpabetDictionary,

  /// WAV Audiobank for sound generation.
  audiobank: Audiobank,
}

impl Synthesizer {
  /// CTOR
  pub fn new(arpabet_dictionary: ArpabetDictionary, audiobank: Audiobank) -> Synthesizer {
    Synthesizer {
      arpabet_dictionary: arpabet_dictionary,
      audiobank: audiobank,
    }
  }

  /**
   * Generate a spoken wav from text input.
   */
  pub fn generate(&self,
                  sentence: &str,
                  speaker: &str,
                  use_words: bool,
                  use_phonemes: bool,
                  volume: Option<f32>,
                  speed: Option<f32>,
                  monophone_padding_start: Option<u16>,
                  monophone_padding_end: Option<u16>,
                  polyphone_padding_end: Option<u16>)
      -> Result<WavBytes, SynthError> {

    let mut words = split_sentence(sentence);

    if words.len() == 0 {
      return Err(SynthError::BadInput {
        description: "There were no words to synthesize."
      });
    }

    let mut concatenated_waveform : Vec<i16> = Vec::new();

    if !self.concatenate_misc(&mut concatenated_waveform, "padding_ends") {
      return Err(SynthError::BadInput {
        description: "Cannot prefix with padding."
      });
    }

    // FIXME: Flight of the seagulls here.
    for word in words.iter() {
      let mut word_added = false;

      if use_words {
        word_added = self.concatenate_word(&mut concatenated_waveform, speaker, word);
      }

      if !word_added && use_phonemes {
        word_added = self.concatenate_polyphone(&mut concatenated_waveform,
                                                speaker,
                                                word,
                                                monophone_padding_start,
                                                monophone_padding_end,
                                                polyphone_padding_end);
      }
    }

    if !self.concatenate_misc(&mut concatenated_waveform, "padding_ends") {
      return Err(SynthError::BadInput {
        description: "Cannot suffix with padding."
      });
    }

    // FIXME: Super inefficient pieces.
    if speed.is_some() {
      concatenated_waveform = change_speed(concatenated_waveform, speed.unwrap());
    }

    if volume.is_some() {
      concatenated_waveform = change_volume(concatenated_waveform, volume.unwrap());
    }

    // TODO: Cache waveform headers.
    let spec = try!(self.audiobank.get_misc_spec("pause"));

    Ok(self.write_buffer(&spec, concatenated_waveform))
  }

  /// Concatenate a word to the waveform we're building. Returns
  /// whether or not the word was successfully found and concatenated.
  fn concatenate_word(&self, concatenated_waveform: &mut Vec<i16>,
                      speaker: &str, word: &str) -> bool {
    match self.audiobank.get_word(speaker, word) {
      Some(waveform_data) => {
        // The word exists in the database.
        concatenated_waveform.extend(waveform_data);
        true
      },
      None => {
        false
      },
    }
  }

  /// Concatenate a polyphone corresponding to the word to the
  /// waveform we're building. Returns whether or not the word was
  /// successfully found and concatenated.
  fn concatenate_polyphone(&self,
                           concatenated_waveform: &mut Vec<i16>,
                           speaker: &str,
                           word: &str,
                           monophone_padding_start: Option<u16>,
                           monophone_padding_end: Option<u16>,
                           polyphone_padding_end: Option<u16>) -> bool {

    let polyphone = match self.arpabet_dictionary.get_polyphone(word) {
      Some(p) => { p },
      None => {
        info!("Word '{}' does not exist in polyphone database.", word);
        // XXX: Adding static as a cue to denote that the given
        // word->polyphone mapping doesn't exist in the database.
        match self.audiobank.get_misc("record_static") {
          None => {},
          Some(waveform_data) => {
            concatenated_waveform.extend(waveform_data);
          },
        }
        return false;
      },
    };

    info!("Word '{}' maps to polyphone '{:?}'", word, polyphone);

    // Insert space before polyphone.
    match self.audiobank.get_misc("pause") {
      None => {},
      Some(pause) => { concatenated_waveform.extend(pause); },
    }

    for phoneme in polyphone {
      match self.audiobank.get_phoneme(speaker, &phoneme) {
        None => {
          // XXX: Adding beep to denote that the given monophone
          // doesn't exist in the database.
          match self.audiobank.get_misc("beep") {
            None => {},
            Some(waveform_data) => {
              concatenated_waveform.extend(waveform_data);
            },
          }
          continue;
        },
        Some(waveform_data) => {
          if monophone_padding_start.is_some() {
            let pause = generate_pause(monophone_padding_start.unwrap());
            concatenated_waveform.extend(pause);
          }

          concatenated_waveform.extend(waveform_data);

          if monophone_padding_end.is_some() {
            let pause = generate_pause(monophone_padding_end.unwrap());
            concatenated_waveform.extend(pause);
          }
        },
      }
    }

    // Insert space after polyphone.
    if polyphone_padding_end.is_some() {
      let pause = generate_pause(polyphone_padding_end.unwrap());
      concatenated_waveform.extend(pause);
    }

    true
  }

  /// Concatenate a sound effect to the waveform we're building. Returns
  /// whether or not the effect was successfully found and concatenated.
  fn concatenate_misc(&self, concatenated_waveform: &mut Vec<i16>,
                      misc_name: &str) -> bool {
    match self.audiobank.get_misc(misc_name) {
      None => { false },
      Some(pause) => {
        concatenated_waveform.extend(pause);
        true
      },
    }
  }

  /// Write out final wave data.
  fn write_buffer(&self, spec: &WavSpec, samples: Vec<i16>) -> WavBytes {
    let bytes : Vec<u8> = Vec::new();
    let seek : Cursor<Vec<u8>> = Cursor::new(bytes);
    let mut buffer = BufWriter::new(seek);

    {
      let mut writer = WavWriter::new(&mut buffer, *spec);
      for s in samples {
        writer.write_sample(s).unwrap();
      }
      writer.finalize().unwrap(); // TODO: Error
    }

    match buffer.into_inner() {
      Err(_) => { Vec::new() }, // TODO: Error
      Ok(r) => { r.get_ref().to_vec() },
    }
  }
}

