// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use lang::arpabet::Arpabet;
use lang::syllables::arpabet_to_syllables;
use speaker::Speaker;
use synthesis::audio::SampleBytes;
use synthesis::audiobank::Audiobank;
use synthesis::audiobank::SamplePreference;
use synthesis::effects::pause::generate_pause;
use synthesis::error::SynthesisError;

/// The word synthesizer is responsible for generating "word" waveforms.
/// It does not control the strategy for how a word is synthesized.
pub struct WordSynthesizer {
  arpabet_dictionary: Arpabet,
  audiobank: Audiobank,
}

impl WordSynthesizer {
  /// CTOR
  pub fn new(arpabet_dictionary: Arpabet, audiobank: Audiobank) -> Self {
    WordSynthesizer {
      arpabet_dictionary: arpabet_dictionary,
      audiobank: audiobank,
    }
  }

  /// Append a word sample pulled from the whole-word sample database.
  pub fn append_word_sample(&self,
                            speaker: &Speaker,
                            word: &str,
                            padding_before_word: Option<u16>,
                            padding_after_word: Option<u16>,
                            buffer: &mut SampleBytes)
                            -> Result<(), SynthesisError> {
    let bytes = try!(self.audiobank.get_word(speaker, word)
        .ok_or(SynthesisError::WordSampleDne));

    if padding_before_word.is_some() {
      let pause = generate_pause(padding_before_word.unwrap());
      buffer.extend(pause);
    }

    buffer.extend(bytes);

    if padding_after_word.is_some() {
      let pause = generate_pause(padding_after_word.unwrap());
      buffer.extend(pause);
    }

    Ok(())
  }

  pub fn append_syllabic_n_phones(&self,
                                  speaker: &Speaker,
                                  word: &str,
                                  use_ends: bool,
                                  padding_before_polyphone: Option<u16>,
                                  padding_after_polyphone: Option<u16>,
                                  debug_padding_between_phones: Option<u16>,
                                  buffer: &mut SampleBytes)
                                  -> Result<(), SynthesisError> {

    let polyphone = try!(self.arpabet_dictionary.get_polyphone(word)
        .ok_or(SynthesisError::ArpabetEntryDne));

    // 2d vector.
    let syllables_of_phones = try!(arpabet_to_syllables(&polyphone)
        .ok_or(SynthesisError::SyllableBreakdownFailure));

    if padding_before_polyphone.is_some() {
      let pause = generate_pause(padding_before_polyphone.unwrap());
      buffer.extend(pause);
    }

    for syllable_phones in syllables_of_phones {
      let samples = try!(self.get_syllabic_n_phone_samples(speaker,
        syllable_phones, false, false));

      for sample in samples {
        buffer.extend(sample);
      }
    }

    if padding_after_polyphone.is_some() {
      let pause = generate_pause(padding_after_polyphone.unwrap());
      buffer.extend(pause);
    }

    Ok(())
  }

  /// Append a word sample generated from Arpabet polyphones.
  /// This uses the n-phone algorithm that builds samples from the
  /// longest-contiguous n-phones that complete the polyphone.
  pub fn append_n_phones(&self,
                         speaker: &Speaker,
                         word: &str,
                         use_ends: bool,
                         padding_before_polyphone: Option<u16>,
                         padding_after_polyphone: Option<u16>,
                         debug_padding_between_phones: Option<u16>,
                         buffer: &mut SampleBytes)
                         -> Result<(), SynthesisError> {
    let samples = try!(self.get_n_phone_samples(speaker, word, use_ends));

    if padding_before_polyphone.is_some() {
      let pause = generate_pause(padding_before_polyphone.unwrap());
      buffer.extend(pause);
    }

    if debug_padding_between_phones.is_some() {
      let mut padding = None;
      if debug_padding_between_phones.is_some() {
        let pause = generate_pause(debug_padding_between_phones.unwrap());
        padding = Some(pause)
      }

      let last = samples.len() - 1;
      for (i, sample) in samples.into_iter().enumerate() {
        buffer.extend(sample);
        if i < last {
          buffer.extend(padding.clone().unwrap());
        }
      }
    } else {
      for sample in samples {
        buffer.extend(sample);
      }
    }

    if padding_after_polyphone.is_some() {
      let pause = generate_pause(padding_after_polyphone.unwrap());
      buffer.extend(pause);
    }

    Ok(())
  }

  /// Similar to 'append_n_phones', but only uses single monophones.
  pub fn append_monophones(&self,
                           speaker: &Speaker,
                           word: &str,
                           padding_before_polyphone: Option<u16>,
                           padding_after_polyphone: Option<u16>,
                           debug_padding_between_phones: Option<u16>,
                           buffer: &mut SampleBytes)
                           -> Result<(), SynthesisError> {
    let samples = try!(self.get_monophone_samples(speaker, word,
      debug_padding_between_phones));

    if padding_before_polyphone.is_some() {
      let pause = generate_pause(padding_before_polyphone.unwrap());
      buffer.extend(pause);
    }

    buffer.extend(samples);

    if padding_after_polyphone.is_some() {
      let pause = generate_pause(padding_after_polyphone.unwrap());
      buffer.extend(pause);
    }

    Ok(())
  }

  /// TODO DOC
  /// TODO DOC
  fn get_syllabic_n_phone_samples(&self,
                                  speaker: &Speaker,
                                  syllable: Vec<String>,
                                  use_start: bool,
                                  use_end: bool)
                                  -> Result<Vec<SampleBytes>, SynthesisError> {

    let mut fulfilled : Vec<bool> = Vec::with_capacity(syllable.len());
    let mut chunks : Vec<Option<SampleBytes>> =
        Vec::with_capacity(syllable.len());

    // Use this to debug the synthesis.
    let mut debug : Vec<Option<String>> = Vec::with_capacity(syllable.len());

    for _ in 0..syllable.len() {
      fulfilled.push(false);
      chunks.push(None);
      debug.push(None);
    }

    // 5-phone
    if syllable.len() >= 5 {
      let range = syllable.len() - 4;
      for i in 0..range {
        if fulfilled[i]
            || fulfilled[i+1]
            || fulfilled[i+2]
            || fulfilled[i+3]
            || fulfilled[i+4] {
          continue;
        }

        let candidate_n_phone = &syllable[i..i+5];

        let sample_preference = match i {
          0 => { SamplePreference::Begin },
          _ if i == range - 1 => { SamplePreference::End },
          _ => { SamplePreference::Middle },
        };

        //println!("n-phone: {:?}", candidate_n_phone);
        let phone = self.audiobank.get_n_phone(speaker.as_str(),
          candidate_n_phone,
          sample_preference,
          use_end);

        if phone.is_some() {
          chunks[i] = phone;
          debug[i] = Some(syllable[i..i+5].join("_"));

          for j in i..i+5 {
            fulfilled[j] = true;
          }
        }
      }
    }

    //info!(target: "synthesis", "5-fulfilled: {:?}", fulfilled);

    // 4-phone
    if syllable.len() >= 4 {
      let range = syllable.len() - 3;
      for i in 0..range {
        if fulfilled[i]
            || fulfilled[i+1]
            || fulfilled[i+2]
            || fulfilled[i+3] {
          continue;
        }

        let candidate_n_phone = &syllable[i..i+4];

        let sample_preference = match i {
          0 => { SamplePreference::Begin },
          _ if i == range - 1 => { SamplePreference::End },
          _ => { SamplePreference::Middle },
        };

        //println!("n-phone: {:?}", candidate_n_phone);
        let phone = self.audiobank.get_n_phone(speaker.as_str(),
          candidate_n_phone,
          sample_preference,
          use_end);

        if phone.is_some() {
          chunks[i] = phone;
          debug[i] = Some(syllable[i..i+4].join("_"));

          for j in i..i+4 {
            fulfilled[j] = true;
          }
        }
      }
    }

    //info!(target: "synthesis", "4-fulfilled: {:?}", fulfilled);

    // 3-phone
    if syllable.len() >= 3 {
      let range = syllable.len() - 2;
      for i in 0..range {
        if fulfilled[i] || fulfilled[i+1] || fulfilled[i+2] {
          continue;
        }

        let candidate_n_phone = &syllable[i..i+3];

        let sample_preference = match i {
          0 => { SamplePreference::Begin },
          _ if i == range - 1 => { SamplePreference::End },
          _ => { SamplePreference::Middle },
        };

        let phone = self.audiobank.get_n_phone(speaker.as_str(),
          candidate_n_phone,
          sample_preference,
          use_end);

        if phone.is_some() {
          chunks[i] = phone;
          debug[i] = Some(syllable[i..i+3].join("_"));
          for j in i..i+3 {
            fulfilled[j] = true;
          }
        }
      }
    }

    //info!(target: "synthesis", "3-fulfilled: {:?}", fulfilled);

    // 2-phone
    if syllable.len() >= 2 {
      let range = syllable.len() - 1;
      for i in 0..range {
        if fulfilled[i] || fulfilled[i+1] {
          continue;
        }

        let candidate_n_phone = &syllable[i..i+2];

        let sample_preference = match i {
          0 => { SamplePreference::Begin },
          _ if i == range - 1 => { SamplePreference::End },
          _ => { SamplePreference::Middle },
        };

        let phone = self.audiobank.get_n_phone(speaker.as_str(),
          candidate_n_phone,
          sample_preference,
          use_end);

        if phone.is_some() {
          chunks[i] = phone;
          debug[i] = Some(syllable[i..i+2].join("_"));
          for j in i..i+2 {
            fulfilled[j] = true;
          }
        }
      }
    }

    //info!(target: "synthesis", "2-fulfilled: {:?}", fulfilled);

    // 1-phone
    for i in 0..syllable.len() {
      if fulfilled[i] {
        continue;
      }

      let sample_preference = match i {
        0 => { SamplePreference::Begin },
        _ if i == syllable.len() - 1 => { SamplePreference::End },
        _ => { SamplePreference::Middle },
      };

      let phone = self.audiobank.get_n_phone(speaker.as_str(),
        &syllable[i..i+1],
        sample_preference,
        use_end);

      if phone.is_some() {
        chunks[i] = phone;
        debug[i] = Some(syllable[i].to_string());
        fulfilled[i] = true;
      }
    }

    //info!(target: "synthesis", "1-fulfilled: {:?}", fulfilled);

    for x in fulfilled {
      if !x { return Err(SynthesisError::MonophoneDne); }
    }

    let debug_str : Vec<String> = debug.into_iter()
        .map(|x| if x.is_some() { x.unwrap() } else { "None".to_string() })
        .collect();

    //info!(target: "synthesis", "Comprised of: {:?}", debug_str);

    let results : Vec<SampleBytes> = chunks.into_iter()
        .filter_map(|x| x) // Woo, already Option<T>!
        .collect();

    info!(target: "synthesis", "Results Length: {} of {} phones",
    results.len(),
    syllable.len());

    Ok(results)
  }

  /// TODO DOC
  /// TODO DOC
  // TODO: Make this super easy to test (and write some tests).
  // TODO: Make this super efficient.
  fn get_n_phone_samples(&self,
                         speaker: &Speaker,
                         word: &str,
                         use_ends: bool)
                         -> Result<Vec<SampleBytes>, SynthesisError> {

    let polyphone = try!(self.arpabet_dictionary.get_polyphone(word)
        .ok_or(SynthesisError::ArpabetEntryDne));

    let mut fulfilled : Vec<bool> = Vec::with_capacity(polyphone.len());
    let mut chunks : Vec<Option<SampleBytes>> =
        Vec::with_capacity(polyphone.len());

    // Use this to debug the synthesis.
    let mut debug : Vec<Option<String>> = Vec::with_capacity(polyphone.len());

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
      if !x { return Err(SynthesisError::MonophoneDne); }
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

    Ok(results)
  }

  /// TODO DOC
  /// TODO DOC
  fn get_monophone_samples(&self,
                           speaker: &Speaker,
                           word: &str,
                           debug_padding_between_phones: Option<u16>)
                           -> Result<SampleBytes, SynthesisError> {

    let polyphone = try!(self.arpabet_dictionary.get_polyphone(word)
        .ok_or(SynthesisError::ArpabetEntryDne));

    let mut padding = None;
    if debug_padding_between_phones.is_some() {
      let pause = generate_pause(debug_padding_between_phones.unwrap());
      padding = Some(pause)
    }

    info!(target: "synthesis",
          "Word '{}' maps to polyphone '{:?}'", word, polyphone);

    let end = polyphone.len() - 1;
    let mut output_waveform = Vec::new();

    for i in 0..polyphone.len() {
      let phoneme = &polyphone[i];

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

      let waveform = try!(read_results.ok_or(SynthesisError::MonophoneDne));

      if padding.is_some() {
        output_waveform.extend(padding.clone().unwrap());
      }

      output_waveform.extend(waveform);
    }

    Ok(output_waveform)
  }
}
