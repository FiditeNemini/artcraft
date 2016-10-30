// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use hound::WavSpec;
use hound::WavWriter;
use lang::arpabet::Arpabet;
use speaker::Speaker;
use std::io::BufWriter;
use std::io::Cursor;
use synthesis::audio::WavBytes;
use synthesis::audiobank::Audiobank;
use synthesis::effects::pause::generate_pause;
use synthesis::effects::speed::change_speed;
use synthesis::effects::volume::change_volume;
use synthesis::error::SynthesisError;
use synthesis::tokens::*;
use synthesis::word_synthesizer::WordSynthesizer;

/// Parameters for synthesis unrelated to the body of text or the speaker.
pub struct SynthesisParams {
  pub use_words: bool,
  pub use_n_phones: bool,
  pub use_syllables: bool,
  pub use_bare_monophones: bool,
  pub use_ends: bool,
  pub volume: Option<f32>,
  pub speed: Option<f32>,
  pub padding_between_phones: Option<u16>,
  pub polyphone_padding_start: Option<u16>,
  pub polyphone_padding_end: Option<u16>,
  pub word_padding_start: Option<u16>,
  pub word_padding_end: Option<u16>,
}

/**
 * Generates wave files from text input.
 */
pub struct Synthesizer {
  audiobank: Audiobank,
  word_synthesizer: WordSynthesizer,
}

impl Synthesizer {
  /// CTOR
  pub fn new(arpabet_dictionary: Arpabet, audiobank: Audiobank) -> Self {
    let word_synthesizer = WordSynthesizer::new(
      arpabet_dictionary,
      audiobank.clone() // FIXME
    );
    Synthesizer {
      audiobank: audiobank,
      word_synthesizer: word_synthesizer,
    }
  }

  /**
   * Generate a spoken wav from text input.
   */
  pub fn generate(&self,
                  tokens: Vec<SynthToken>,
                  speaker: &Speaker,
                  params: SynthesisParams)
                  -> Result<WavBytes, SynthesisError> {

    if tokens.len() == 0 {
      return Err(SynthesisError::BadInput {
        description: "There were no words to synthesize."
      });
    }

    let mut concatenated_waveform : Vec<i16> = Vec::new();

    try!(self.pad_audio(&mut concatenated_waveform));

    for token in tokens {
      match token {
        SynthToken::Filler { value: _v } => {
          // TODO: Variable length filler content.
          try!(self.synthesize_word(
            &mut concatenated_waveform,
            &speaker,
            "um",
            &params));
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
          try!(self.synthesize_word(
            &mut concatenated_waveform,
            &speaker,
            &v.value,
            &params));
        }
      }
    }

    try!(self.pad_audio(&mut concatenated_waveform));

    // FIXME: Super inefficient pieces.
    if params.speed.is_some() {
      concatenated_waveform = change_speed(concatenated_waveform,
                                           params.speed.unwrap());
    }

    if params.volume.is_some() {
      concatenated_waveform = change_volume(concatenated_waveform,
                                            params.volume.unwrap());
    }

    // This is the prototype we use for audio headers.
    // TODO: Cache waveform headers.
    // TODO: Add custom headers with "author" etc. metadata.
    let spec = try!(self.audiobank.get_misc_spec("pause"));

    Ok(self.write_buffer(&spec, concatenated_waveform))
  }

  /// Add a word to the output waveform.
  fn synthesize_word(&self,
                     concatenated_waveform: &mut Vec<i16>,
                     speaker: &Speaker,
                     word: &str,
                     params: &SynthesisParams)
                     -> Result<(), SynthesisError> {

    let mut added = false;
    if params.use_words {
      // TODO: Prefix buffer and suffix buffer.
      added = self.word_synthesizer.append_word_sample(
        speaker,
        word,
        params.word_padding_start,
        params.word_padding_end,
        concatenated_waveform)
          .is_ok(); // Dictionary lookup is allowed to fail.
    }

    if !added {
      if params.use_n_phones {
        // TODO: Prefix buffer and suffix buffer.
        // TODO: Param for monophone padding.
        added = try!(self.word_synthesizer.append_n_phones(
          speaker,
          word,
          params.use_ends,
          params.polyphone_padding_start,
          params.polyphone_padding_end,
          params.padding_between_phones,
          concatenated_waveform)
            .map(|_| true));
      } else if params.use_bare_monophones {
        // TODO: Prefix buffer and suffix buffer.
        // TODO: Param for monophone padding.
        added = try!(self.word_synthesizer.append_monophones(
          speaker,
          word,
          params.polyphone_padding_start,
          params.polyphone_padding_end,
          params.padding_between_phones,
          concatenated_waveform)
            .map(|_| true));
      }
    }

    if added {
      Ok(())
    } else {
      Err(SynthesisError::CannotSynthesizeWord)
    }
  }

  /// Add "silence" padding to the waveform.
  /// This is necessary for smooth playback in the frontend UI.
  fn pad_audio(&self, buffer: &mut Vec<i16>) -> Result<(), SynthesisError> {
    if self.concatenate_misc(buffer, "padding_ends") {
      Ok(())
    } else {
      Err(SynthesisError::CannotLoadAudioFile)
    }
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
