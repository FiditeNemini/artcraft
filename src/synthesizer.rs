// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use arpabet::ArpabetDictionary;
use audiobank::Audiobank;
use error::SynthError;
use hound::WavSpec;
use hound::WavWriter;
use std::i16;
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
  pub fn generate(&self, sentence: &str, speaker: &str, 
                  volume: Option<f32>) -> Result<WavBytes, SynthError> {

    let mut words = split_sentence(sentence);

    if words.len() == 0 {
      return Err(SynthError::BadInput { 
        description: "There were no words to synthesize."
      });
    }

    // This file adds extra silent padding at both ends.
    words.insert(0, "_blank".to_string());
    words.push("_blank".to_string());
    
    let mut concatenated_waveform : Vec<i16> = Vec::new();

    // FIXME: Flight of the seagulls here.
    for word in words.iter() {
      match self.audiobank.get_word(speaker, word) {
        Some(waveform_data) => {
          // The word exists in the database.
          concatenated_waveform.extend(waveform_data);
        },
        None => {
          // The word does not exist in the database, so use phonemes instead.
          match self.arpabet_dictionary.get_polyphone(word) {
            None => {
              // TODO: ERROR (maybe add static based on word length!)
              match self.audiobank.get_misc("record_static") {
                None => {},
                Some(waveform_data) => {
                  concatenated_waveform.extend(waveform_data);
                },
              }
              continue;
            },
            Some(polyphone) => {
              info!("Word '{}' maps to polyphone '{:?}'", word, polyphone);

              for phoneme in polyphone {
                match self.audiobank.get_phoneme(speaker, &phoneme) {
                  None => {
                    // TODO: ERROR (maybe add static based on word length!)
                    match self.audiobank.get_misc("beep") {
                      None => {},
                      Some(waveform_data) => {
                        concatenated_waveform.extend(waveform_data);
                      },
                    }
                    continue;
                  },
                  Some(waveform_data) => {
                    concatenated_waveform.extend(waveform_data);
                  },
                }
              }
            },
          }
        },
      }
    }

    // Adjust the volume of the waveform.
    // FIXME: Super inefficient.
    let mut pcm_data : Vec<i16> = Vec::with_capacity(concatenated_waveform.len());
    for x in &concatenated_waveform {
      let data = raise_volume(*x, volume);
      pcm_data.push(data);
    }

    // TODO: Cache waveform headers.
    let spec = try!(self.audiobank.get_spec(speaker, &words[0]));

    Ok(self.write_buffer(&spec, pcm_data))
  }

  fn write_buffer(&self, spec: &WavSpec, samples: Vec<i16>) -> Vec<u8> {
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

/// Raise the volume of a sample by changing its amplitude.
fn raise_volume(data: i16, volume: Option<f32>) -> i16 {
  // TODO: Cleanup, make more efficient.
  match volume {
    None => data,
    Some(vol) => {
      let f : f32 = data as f32 * vol;
      let g = f as i32;

      let h : i16 = if g > i16::MAX as i32 {
        i16::MAX
      } else if g < i16::MIN as i32 {
        i16::MIN
      } else {
        g as i16
      };

      h
    },
  }
}

