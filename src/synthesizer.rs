// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use arpabet::ArpabetDictionary;
use audiobank::Audiobank;
use audiobank::SampleBytes;
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
  pub fn new(arpabet_dictionary: ArpabetDictionary, audiobank: Audiobank)
      -> Synthesizer {
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
                  use_diphones: bool,
                  use_n_phones: bool,
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
        word_added = self.concatenate_word(&mut concatenated_waveform,
                                           speaker,
                                           word);
      }

      if !word_added && use_n_phones {
        // New phoneme algorithm
        word_added = self.concatenate_n_phone(&mut concatenated_waveform,
                                              speaker,
                                              word,
                                              polyphone_padding_end);
      }
      if !word_added && use_phonemes {
        // Old phoneme algorithm
        word_added = self.concatenate_polyphone(&mut concatenated_waveform,
                                                speaker,
                                                word,
                                                use_diphones,
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
                           use_diphones: bool,
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
        match self.audiobank.get_diphone(speaker, first, second) {
          None => {},
          Some(diphone_data) => {
            info!("Read diphone: {}, {}", first, second);
            skip_next = true;
            concatenated_waveform.extend(diphone_data);
            continue;
          },
        }
      }

      // Attempt to read a "begin" or "end" monophone.
      let mut read_results = if i == 0 {
        self.audiobank.get_begin_phoneme(speaker, &phoneme)
      } else if i == end {
        self.audiobank.get_end_phoneme(speaker, &phoneme)
      } else {
        None
      };

      // Read a regular monophone.
      if read_results.is_none() {
        read_results = self.audiobank.get_phoneme(speaker, &phoneme);
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
                         speaker: &str,
                         word: &str,
                         polyphone_padding_end: Option<u16>) -> bool {

    let samples = match self.get_n_phone_samples(speaker, word) {
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
  fn get_n_phone_samples(&self, speaker: &str, word: &str)
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
    let mut debug : Vec<Option<String>> = Vec::with_capacity(polyphone.len());

    for i in 0..polyphone.len() {
      fulfilled.push(false);
      chunks.push(None);
      debug.push(None);
    }

    // 4-phone
    if polyphone.len() >= 4 {
      let range = polyphone.len() - 3;
      for i in 0..range {
        if fulfilled[i] {
          continue;
        }

        let candidate_n_phone = &polyphone[i..i+4];

        let phone = self.audiobank.get_n_phone(speaker, candidate_n_phone);

        if phone.is_some() {
          chunks[i] = phone;
          debug[i] = Some(polyphone[i..i+4].join("_"));

          for j in i..i+4 {
            fulfilled[j] = true;
          }
        }
      }
    }

    // 3-phone
    if polyphone.len() >= 3 {
      let range = polyphone.len() - 2;
      for i in 0..range {
        if fulfilled[i] {
          continue;
        }

        let candidate_n_phone = &polyphone[i..i+3];

        let phone = self.audiobank.get_n_phone(speaker, candidate_n_phone);

        if phone.is_some() {
          chunks[i] = phone;
          debug[i] = Some(polyphone[i..i+3].join("_"));
          for j in i..i+3 {
            fulfilled[j] = true;
          }
        }
      }
    }

    // 2-phone
    if polyphone.len() >= 2 {
      let range = polyphone.len() - 1;
      for i in 0..range {
        //println!("i: {}, range: {}", i, range);
        if fulfilled[i] {
          continue;
        }

        let candidate_n_phone = &polyphone[i..i+2];

        let phone = self.audiobank.get_n_phone(speaker, candidate_n_phone);

        if phone.is_some() {
          chunks[i] = phone;
          debug[i] = Some(polyphone[i..i+2].join("_"));
          for j in i..i+2 {
            fulfilled[j] = true;
          }
        }
      }
    }

    // 1-phone
    for i in 0..polyphone.len() {
      if fulfilled[i] {
        continue;
      }

      let phone = self.audiobank.get_phoneme(speaker, &polyphone[i]);

      if phone.is_some() {
        chunks[i] = phone;
        debug[i] = Some(polyphone[i].to_string());
        fulfilled[i] = true;
      }
    }

    for x in fulfilled {
      if !x {
        return None;
      }
    }

    let mut debug_str : Vec<String> = debug.into_iter()
      .map(|x| if x.is_some() { x.unwrap() } else { "None".to_string() })
      .collect();

    info!("Comprised of: {:?}", debug_str);

    let results : Vec<SampleBytes> = chunks.into_iter()
      .filter_map(|x| x) // Woo, already Option<T>!
      .collect();

    info!("Results Length: {} of {} phones", results.len(), polyphone.len());

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

