// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use audiobank::Audiobank;
use audiobank::SampleBytes;
use audiobank::SamplePreference;
use effects::pause::generate_pause;
use effects::speed::change_speed;
use effects::volume::change_volume;
use error::SynthError;
use hound::WavSpec;
use hound::WavWriter;
use lang::arpabet::Arpabet;
use lang::parser::Parser;
use speaker::Speaker;
use std::io::BufWriter;
use std::io::Cursor;
use synthesis::tokens::*;

pub type WavBytes = Vec<u8>;

/// Parameters for synthesis unrelated to the body of text or the speaker.
pub struct SynthesisParams {
  pub use_words: bool,
  pub use_phonemes: bool,
  pub use_diphones: bool,
  pub use_n_phones: bool,
  pub use_ends: bool,
  pub volume: Option<f32>,
  pub speed: Option<f32>,
  pub monophone_padding_start: Option<u16>,
  pub monophone_padding_end: Option<u16>,
  pub polyphone_padding_end: Option<u16>,
  pub word_padding_start: Option<u16>,
  pub word_padding_end: Option<u16>,
}

/**
 * Generates wave files from text input.
 */
pub struct Synthesizer {
  // TODO: For now we rely on word files existing on the filesystem
  // at runtime. This is pretty lame.
  ///// Word dictionary
  //word_dictionary: Vocabulary,

  /// Arpabet, (Word) -> (PhonemeList)
  arpabet_dictionary: Arpabet,

  /// WAV Audiobank for sound generation.
  audiobank: Audiobank,

  /// Sentence parser
  parser: Parser,
}

impl Synthesizer {
  /// CTOR
  pub fn new(arpabet_dictionary: Arpabet,
             audiobank: Audiobank,
             parser: Parser) -> Synthesizer {
    Synthesizer {
      arpabet_dictionary: arpabet_dictionary,
      audiobank: audiobank,
      parser: parser,
    }
  }

  /**
   * Generate a spoken wav from text input.
   */
  pub fn generate(&self,
                  sentence: &str,
                  speaker: &Speaker,
                  params: SynthesisParams)
      -> Result<WavBytes, SynthError> {

    let tokens = self.parser.parse(sentence);

    if tokens.len() == 0 {
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

    for token in tokens {
      match token {
        SynthToken::Filler { value: _v } => {
          // TODO: Variable length filler content.
          self.handle_word_token(&mut concatenated_waveform,
            &speaker,
            "um",
            &params);
        },
        SynthToken::Pause { value: ref v } => {
          let pause_duration = match *v {
            Pause::Breath => 3000,
            Pause::HalfStop => 5000,
            Pause::FullStop => 10000,
          };
          let pause = generate_pause(pause_duration);
          concatenated_waveform.extend(pause);
        },
        SynthToken::Word { value: ref v } => {
          self.handle_word_token(&mut concatenated_waveform, &speaker, &v.value,
              &params);
        }
      }
    }

    if !self.concatenate_misc(&mut concatenated_waveform, "padding_ends") {
      return Err(SynthError::BadInput {
        description: "Cannot suffix with padding."
      });
    }

    // FIXME: Super inefficient pieces.
    if params.speed.is_some() {
      concatenated_waveform = change_speed(concatenated_waveform,
                                           params.speed.unwrap());
    }

    if params.volume.is_some() {
      concatenated_waveform = change_volume(concatenated_waveform,
                                            params.volume.unwrap());
    }

    // TODO: Cache waveform headers.
    let spec = try!(self.audiobank.get_misc_spec("pause"));

    Ok(self.write_buffer(&spec, concatenated_waveform))
  }

  fn handle_word_token(&self,
                       concatenated_waveform: &mut Vec<i16>,
                       speaker: &Speaker,
                       word: &str,
                       params: &SynthesisParams) {

    let mut word_added = false;

    if params.use_words {
      word_added = self.concatenate_word(concatenated_waveform,
        speaker,
        word,
        params.word_padding_start,
        params.word_padding_end);
    }

    if !word_added && params.use_n_phones {
      // New phoneme algorithm
      word_added = self.concatenate_n_phone(concatenated_waveform,
        speaker,
        word,
        params.polyphone_padding_end,
        params.use_ends);
    }
    if !word_added && params.use_phonemes {
      // Old phoneme algorithm
      self.concatenate_polyphone(concatenated_waveform,
        speaker,
        word,
        params.use_diphones,
        params.monophone_padding_start,
        params.monophone_padding_end,
        params.polyphone_padding_end);
    }
  }

  /// Concatenate a word to the waveform we're building. Returns
  /// whether or not the word was successfully found and concatenated.
  fn concatenate_word(&self,
                      concatenated_waveform: &mut Vec<i16>,
                      speaker: &Speaker,
                      word: &str,
                      word_padding_start: Option<u16>,
                      word_padding_end: Option<u16>) -> bool {
    match self.audiobank.get_word(speaker.as_str(), word) {
      None => {
        // The word does not exist in the database.
        false
      },
      Some(waveform_data) => {
        // The word exists in the database.
        if word_padding_start.is_some() {
          let pause = generate_pause(word_padding_start.unwrap());
          concatenated_waveform.extend(pause);
        }

        concatenated_waveform.extend(waveform_data);

        if word_padding_end.is_some() {
          let pause = generate_pause(word_padding_end.unwrap());
          concatenated_waveform.extend(pause);
        }

        true
      },
    }
  }

  /// Concatenate a polyphone corresponding to the word to the
  /// waveform we're building. Returns whether or not the word was
  /// successfully found and concatenated.
  fn concatenate_polyphone(&self,
                           concatenated_waveform: &mut Vec<i16>,
                           speaker: &Speaker,
                           word: &str,
                           use_diphones: bool,
                           monophone_padding_start: Option<u16>,
                           monophone_padding_end: Option<u16>,
                           polyphone_padding_end: Option<u16>) -> bool {

    let polyphone = match self.arpabet_dictionary.get_polyphone(word) {
      Some(p) => { p },
      None => {
        info!(target: "synthesis",
              "Word '{}' does not exist in polyphone database.", word);
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

    info!(target: "synthesis",
          "Word '{}' maps to polyphone '{:?}'", word, polyphone);

    // Insert space before polyphone.
    match self.audiobank.get_misc("pause") {
      None => {},
      Some(pause) => { concatenated_waveform.extend(pause); },
    }

    let end = polyphone.len() - 1;
    let mut skip_next = false;

    for i in 0..polyphone.len() {
      if skip_next {
        // We just read a diphone.
        skip_next = false;
        continue;
      }

      let phoneme = &polyphone[i];

      // Attempt to read a diphone.
      if use_diphones && i < end {
        let first = phoneme;
        let second = &polyphone[i+1];
        match self.audiobank.get_diphone(speaker.as_str(), first, second) {
          None => {},
          Some(diphone_data) => {
            info!(target: "synthesis",
                  "Read diphone: {}, {}", first, second);
            skip_next = true;
            concatenated_waveform.extend(diphone_data);
            continue;
          },
        }
      }

      // Attempt to read a "begin" or "end" monophone.
      let mut read_results = if i == 0 {
        self.audiobank.get_begin_phoneme(speaker.as_str(), &phoneme)
      } else if i == end {
        self.audiobank.get_end_phoneme(speaker.as_str(), &phoneme)
      } else {
        None
      };

      // Read a regular monophone.
      if read_results.is_none() {
        read_results = self.audiobank.get_phoneme(speaker.as_str(), &phoneme);
      }

      match read_results {
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

  // TODO: Doc and test.
  fn concatenate_n_phone(&self,
                         concatenated_waveform: &mut Vec<i16>,
                         speaker: &Speaker,
                         word: &str,
                         polyphone_padding_end: Option<u16>,
                         use_ends: bool) -> bool {

    let pref = SamplePreference::Begin;

    let samples = match self.get_n_phone_samples(speaker, word, pref, use_ends) {
      Some(s) => s,
      None => {
        return false;
      },
    };


    for sample in samples {
      concatenated_waveform.extend(sample);
    }

    // Insert space after polyphone.
    if polyphone_padding_end.is_some() {
      let pause = generate_pause(polyphone_padding_end.unwrap());
      concatenated_waveform.extend(pause);
    }

    true
  }


  // TODO: Make this super easy to test (and write some tests).
  // TODO: Make this super efficient.
  fn get_n_phone_samples(&self,
                         speaker: &Speaker,
                         word: &str,
                         _sample_preference: SamplePreference,
                         use_ends: bool)
      -> Option<Vec<SampleBytes>> {

    let polyphone = match self.arpabet_dictionary.get_polyphone(word) {
      None => {
        return None;
      },
      Some(p) => p,
    };

    let mut fulfilled : Vec<bool> = Vec::with_capacity(polyphone.len());
    let mut chunks : Vec<Option<SampleBytes>> =
        Vec::with_capacity(polyphone.len());

    // Use this to debug the synthesis.
    let mut debug : Vec<Option<String>> =
        Vec::with_capacity(polyphone.len());

    for _ in 0..polyphone.len() {
      fulfilled.push(false);
      chunks.push(None);
      debug.push(None);
    }

    // 5-phone
    if polyphone.len() >= 5 {
      let range = polyphone.len() - 4;
      for i in 0..range {
        if fulfilled[i]
            || fulfilled[i+1]
            || fulfilled[i+2]
            || fulfilled[i+3] 
            || fulfilled[i+4] {
          continue;
        }

        let candidate_n_phone = &polyphone[i..i+5];

        let sample_preference = match i {
          0 => { SamplePreference::Begin },
          _ if i == range - 1 => { SamplePreference::End },
          _ => { SamplePreference::Middle },
        };

        //println!("n-phone: {:?}", candidate_n_phone);
        let phone = self.audiobank.get_n_phone(speaker.as_str(),
                                               candidate_n_phone,
                                               sample_preference,
                                               use_ends);

        if phone.is_some() {
          chunks[i] = phone;
          debug[i] = Some(polyphone[i..i+5].join("_"));

          for j in i..i+5 {
            fulfilled[j] = true;
          }
        }
      }
    }

    info!(target: "synthesis", "5-fulfilled: {:?}", fulfilled);

    // 4-phone
    if polyphone.len() >= 4 {
      let range = polyphone.len() - 3;
      for i in 0..range {
        if fulfilled[i]
            || fulfilled[i+1]
            || fulfilled[i+2]
            || fulfilled[i+3] {
          continue;
        }

        let candidate_n_phone = &polyphone[i..i+4];

        let sample_preference = match i {
          0 => { SamplePreference::Begin },
          _ if i == range - 1 => { SamplePreference::End },
          _ => { SamplePreference::Middle },
        };

        //println!("n-phone: {:?}", candidate_n_phone);
        let phone = self.audiobank.get_n_phone(speaker.as_str(),
                                               candidate_n_phone,
                                               sample_preference,
                                               use_ends);

        if phone.is_some() {
          chunks[i] = phone;
          debug[i] = Some(polyphone[i..i+4].join("_"));

          for j in i..i+4 {
            fulfilled[j] = true;
          }
        }
      }
    }

    info!(target: "synthesis", "4-fulfilled: {:?}", fulfilled);

    // 3-phone
    if polyphone.len() >= 3 {
      let range = polyphone.len() - 2;
      for i in 0..range {
        if fulfilled[i] || fulfilled[i+1] || fulfilled[i+2] {
          continue;
        }

        let candidate_n_phone = &polyphone[i..i+3];

        let sample_preference = match i {
          0 => { SamplePreference::Begin },
          _ if i == range - 1 => { SamplePreference::End },
          _ => { SamplePreference::Middle },
        };

        let phone = self.audiobank.get_n_phone(speaker.as_str(),
                                               candidate_n_phone,
                                               sample_preference,
                                               use_ends);

        if phone.is_some() {
          chunks[i] = phone;
          debug[i] = Some(polyphone[i..i+3].join("_"));
          for j in i..i+3 {
            fulfilled[j] = true;
          }
        }
      }
    }

    info!(target: "synthesis", "3-fulfilled: {:?}", fulfilled);

    // 2-phone
    if polyphone.len() >= 2 {
      let range = polyphone.len() - 1;
      for i in 0..range {
        if fulfilled[i] || fulfilled[i+1] {
          continue;
        }

        let candidate_n_phone = &polyphone[i..i+2];

        let sample_preference = match i {
          0 => { SamplePreference::Begin },
          _ if i == range - 1 => { SamplePreference::End },
          _ => { SamplePreference::Middle },
        };

        let phone = self.audiobank.get_n_phone(speaker.as_str(),
                                               candidate_n_phone,
                                               sample_preference,
                                               use_ends);

        if phone.is_some() {
          chunks[i] = phone;
          debug[i] = Some(polyphone[i..i+2].join("_"));
          for j in i..i+2 {
            fulfilled[j] = true;
          }
        }
      }
    }

    info!(target: "synthesis", "2-fulfilled: {:?}", fulfilled);

    // 1-phone
    for i in 0..polyphone.len() {
      if fulfilled[i] {
        continue;
      }

      let sample_preference = match i {
        0 => { SamplePreference::Begin },
        _ if i == polyphone.len() - 1 => { SamplePreference::End },
        _ => { SamplePreference::Middle },
      };

      let phone = self.audiobank.get_n_phone(speaker.as_str(),
                                             &polyphone[i..i+1],
                                             sample_preference,
                                             use_ends);

      if phone.is_some() {
        chunks[i] = phone;
        debug[i] = Some(polyphone[i].to_string());
        fulfilled[i] = true;
      }
    }

    info!(target: "synthesis", "1-fulfilled: {:?}", fulfilled);

    for x in fulfilled {
      if !x {
        return None;
      }
    }

    let debug_str : Vec<String> = debug.into_iter()
      .map(|x| if x.is_some() { x.unwrap() } else { "None".to_string() })
      .collect();

    info!(target: "synthesis", "Comprised of: {:?}", debug_str);

    let results : Vec<SampleBytes> = chunks.into_iter()
      .filter_map(|x| x) // Woo, already Option<T>!
      .collect();

    info!(target: "synthesis", "Results Length: {} of {} phones",
          results.len(),
          polyphone.len());

    Some(results)
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

