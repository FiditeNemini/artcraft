use arpabet::Arpabet;
use arpabet::phoneme::Phoneme;
use arpabet::extensions::Punctuation as ArpabetPunctuation;
use sentence::{SentenceTokenizer, Token, Punctuation};
use numerics::Numerics;

/// Convert text to the encoding used in Nvidia/Tacotron2 natively.
pub fn text_to_standard_encoding(text: &str) -> Vec<i64> {
  let copied = text.to_string().to_ascii_lowercase();
  let mut text_buffer : Vec<i64> = Vec::new();

  for ch in copied.chars() {
    // TODO: HORRIBLE EXPERIMENTAL HACK.
    // Write a formal module to clean and process text
    let mut v = ch as i64 - 59;
    if v < 1 {
      v = 11; // NB: Space
    }
    text_buffer.push(v);
  }

  text_buffer
}

/// This is the encoding that Glow TTS uses.
pub fn text_to_arpabet_encoding_glow_tts(arpabet: &Arpabet, text: &str) -> Vec<i64> {
  let sentence_tokenizer = SentenceTokenizer::new();
  let numerics = Numerics::default();

  let text = text.to_ascii_lowercase();

  let tokens = sentence_tokenizer.tokenize(&text);
  info!("Sentence Tokens: {:?}", tokens);

  let mut needs_space = false;
  let mut encoded_buffer : Vec<i64> = Vec::new();

  // useful encodings
  let space = character_to_glow_tts_encoding(" ");
  let period = character_to_glow_tts_encoding(".");
  let comma = character_to_glow_tts_encoding(",");
  let question = character_to_glow_tts_encoding("?");
  let exclamation = character_to_glow_tts_encoding("!");

  for token in tokens {
    match token {
      Token::ApostrophenatedWord(word)
      | Token::HyphenatedWord(word)
      | Token::Word(word) => {
        if needs_space {
          encoded_buffer.push(space);
          needs_space = false;
        }

        match arpabet.get_polyphone(&word) {
          None => {
            encoded_buffer.push(space);
            needs_space = true;
          },
          Some(polyphone) => {
            let encodings : Vec<i64> = polyphone.iter()
                .map(|phoneme| arpabet_phoneme_to_glow_tts_encoding(&phoneme))
                .collect();

            encoded_buffer.extend(&encodings);
            needs_space = true;
          },
        }
      },
      Token::Integer(integer_string) => {
        if needs_space {
          encoded_buffer.push(space);
          needs_space = false;
        }
        let number_words = integer_string.parse::<i64>()
            .ok()
            .and_then(|number| numerics.convert_number(number).ok())
            .unwrap_or(Vec::new());

        for word in number_words {
          if needs_space {
            encoded_buffer.push(space);
            needs_space = false;
          }
          if arpabet_lookup_and_encode_word(&word, &arpabet, &mut encoded_buffer) {
            needs_space = true;
          }
        }
      },
      Token::Punctuation(punctuation) => {
        match punctuation {
          Punctuation::Period => {
            encoded_buffer.push(period);
            needs_space = true;
          },
          Punctuation::Comma | Punctuation::Semicolon => {
            encoded_buffer.push(comma);
            needs_space = true;
          },
          Punctuation::Question => {
            encoded_buffer.push(question);
            needs_space = true;
          },
          Punctuation::Exclamation => {
            encoded_buffer.push(exclamation);
            needs_space = true;
          },
          Punctuation::Colon | Punctuation::Dash => {
            encoded_buffer.push(comma); // TODO/FIXME: THIS IS WRONG
            needs_space = false;
          },
        }
      },
      Token::Unknown(word) => {
        for ch in word.chars() {
          // TODO: INEFFICIENT
          let enc = character_to_glow_tts_encoding(&ch.to_string());
          if enc > -1 {
            encoded_buffer.push(enc);
            needs_space = true;
          }
        }
      },
      // TODO: We need to handle these now.
      Token::RealNumber(_) => continue,
      Token::CommaFormattedInteger(_) => continue,
      Token::CommaFormattedRealNumber(_) => continue,
      Token::Hashtag(_) => continue,
      Token::UsernameMention(_) => continue,
      Token::Url(_) => continue,
    }
  }

  encoded_buffer
}

/// Convert text to the encoding used in my Arpabet extension
pub fn text_to_arpabet_encoding(arpabet: &Arpabet, text: &str) -> Vec<i64> {
  let sentence_tokenizer = SentenceTokenizer::new();
  let numerics = Numerics::default();

  let text = text.to_ascii_lowercase();

  let tokens = sentence_tokenizer.tokenize(&text);
  println!("Sentence Tokens: {:?}", tokens);

  // Token encodings
  let space = u8::from(ArpabetPunctuation::Space) as i64;
  let start= u8::from(ArpabetPunctuation::StartToken) as i64;
  let end = u8::from(ArpabetPunctuation::EndToken) as i64;

  // TODO: These don't sound great.
  let question = u8::from(ArpabetPunctuation::Question) as i64;
  let period = u8::from(ArpabetPunctuation::Period) as i64;
  let exclamation = u8::from(ArpabetPunctuation::Exclamation) as i64;
  let comma = u8::from(ArpabetPunctuation::Comma) as i64;
  let interjection = u8::from(ArpabetPunctuation::Interjection) as i64;

  let mut encoded_buffer : Vec<i64> = Vec::new();
  encoded_buffer.push(start); // start token

  let mut needs_space = false;

  for token in tokens {
    match token {
      Token::ApostrophenatedWord(word)
          | Token::HyphenatedWord(word)
          | Token::Word(word) => {
        if needs_space {
          encoded_buffer.push(space);
          needs_space = false;
        }
        if arpabet_lookup_and_encode_word(&word, &arpabet, &mut encoded_buffer) {
          needs_space = true;
        }
      },
      Token::Integer(integer_string) => {
        if needs_space {
          encoded_buffer.push(space);
          needs_space = false;
        }
        let number_words = integer_string.parse::<i64>()
            .ok()
            .and_then(|number| numerics.convert_number(number).ok())
            .unwrap_or(Vec::new());

        for word in number_words {
          if needs_space {
            encoded_buffer.push(space);
            needs_space = false;
          }
          if arpabet_lookup_and_encode_word(&word, &arpabet, &mut encoded_buffer) {
            needs_space = true;
          }
        }
      },
      Token::Punctuation(punctuation) => {
        match punctuation {
          Punctuation::Period => {
            encoded_buffer.push(period);
            needs_space = true;
          },
          Punctuation::Comma | Punctuation::Semicolon => {
            encoded_buffer.push(comma);
            needs_space = true;
          },
          Punctuation::Question => {
            encoded_buffer.push(question);
            needs_space = true;
          },
          Punctuation::Exclamation => {
            encoded_buffer.push(exclamation);
            needs_space = true;
          },
          Punctuation::Colon | Punctuation::Dash => {
            encoded_buffer.push(interjection);
            needs_space = true;
          },
        }
      },
      // TODO:
      Token::RealNumber(_) => continue,
      Token::CommaFormattedInteger(_) => continue,
      Token::CommaFormattedRealNumber(_) => continue,
      Token::Hashtag(_) => continue,
      Token::UsernameMention(_) => continue,
      Token::Url(_) => continue,
      Token::Unknown(_) => continue, // skip, we don't know what this is yet.
    }
  }

  encoded_buffer.push(end); // end token
  encoded_buffer
}

fn arpabet_lookup_and_encode_word(word: &str, arpabet: &Arpabet, encoded_buffer: &mut Vec<i64>) -> bool {
  match arpabet.get_polyphone(&word) {
    None => false,
    Some(polyphone) => {
      let vec : Vec<i64> = polyphone.iter()
          .map(|phoneme| {
            match phoneme {
              Phoneme::Consonant(c) => u8::from(*c) as i64,
              Phoneme::Vowel(v) => u8::from(*v) as i64,
            }
          })
          .collect();

      encoded_buffer.extend(vec);
      true
    },
  }
}

fn arpabet_lookup_and_encode_word_glow_tts(word: &str, arpabet: &Arpabet, encoded_buffer: &mut Vec<i64>) -> bool {
  match arpabet.get_polyphone(&word) {
    None => false,
    Some(polyphone) => {
      let vec : Vec<i64> = polyphone.iter()
          .map(|phoneme| arpabet_phoneme_to_glow_tts_encoding(phoneme))
          .collect();

      encoded_buffer.extend(vec);
      true
    },
  }
}

fn arpabet_phoneme_to_glow_tts_encoding(phoneme: &Phoneme) -> i64 {
  match phoneme.to_str() {
    "AA" => 64,
    "AA0" => 65,
    "AA1" => 66,
    "AA2" => 67,
    "AE" => 68,
    "AE0" => 69,
    "AE1" => 70,
    "AE2" => 71,
    "AH" => 72,
    "AH0" => 73,
    "AH1" => 74,
    "AH2" => 75,
    "AO" => 76,
    "AO0" => 77,
    "AO1" => 78,
    "AO2" => 79,
    "AW" => 80,
    "AW0" => 81,
    "AW1" => 82,
    "AW2" => 83,
    "AY" => 84,
    "AY0" => 85,
    "AY1" => 86,
    "AY2" => 87,
    "B" => 88,
    "CH" => 89,
    "D" => 90,
    "DH" => 91,
    "EH" => 92,
    "EH0" => 93,
    "EH1" => 94,
    "EH2" => 95,
    "ER" => 96,
    "ER0" => 97,
    "ER1" => 98,
    "ER2" => 99,
    "EY" => 100,
    "EY0" => 101,
    "EY1" => 102,
    "EY2" => 103,
    "F" => 104,
    "G" => 105,
    "HH" => 106,
    "IH" => 107,
    "IH0" => 108,
    "IH1" => 109,
    "IH2" => 110,
    "IY" => 111,
    "IY0" => 112,
    "IY1" => 113,
    "IY2" => 114,
    "JH" => 115,
    "K" => 116,
    "L" => 117,
    "M" => 118,
    "N" => 119,
    "NG" => 120,
    "OW" => 121,
    "OW0" => 122,
    "OW1" => 123,
    "OW2" => 124,
    "OY" => 125,
    "OY0" => 126,
    "OY1" => 127,
    "OY2" => 128,
    "P" => 129,
    "R" => 130,
    "S" => 131,
    "SH" => 132,
    "T" => 133,
    "TH" => 134,
    "UH" => 135,
    "UH0" => 136,
    "UH1" => 137,
    "UH2" => 138,
    "UW" => 139,
    "UW0" => 140,
    "UW1" => 141,
    "UW2" => 142,
    "V" => 143,
    "W" => 144,
    "Y" => 145,
    "Z" => 146,
    "ZH" => 147,
    _ => -1,
  }
}

fn character_to_glow_tts_encoding(symbol: &str) -> i64 {
  match (symbol) {
    "_" => 0,
    "-" => 1,
    "!" => 2,
    "'" => 3,
    "(" => 4,
    ")" => 5,
    "," => 6,
    "." => 7,
    ":" => 8,
    ";" => 9,
    "?" => 10,
    " " => 11,
    "A" => 12,
    "B" => 13,
    "C" => 14,
    "D" => 15,
    "E" => 16,
    "F" => 17,
    "G" => 18,
    "H" => 19,
    "I" => 20,
    "J" => 21,
    "K" => 22,
    "L" => 23,
    "M" => 24,
    "N" => 25,
    "O" => 26,
    "P" => 27,
    "Q" => 28,
    "R" => 29,
    "S" => 30,
    "T" => 31,
    "U" => 32,
    "V" => 33,
    "W" => 34,
    "X" => 35,
    "Y" => 36,
    "Z" => 37,
    "a" => 38,
    "b" => 39,
    "c" => 40,
    "d" => 41,
    "e" => 42,
    "f" => 43,
    "g" => 44,
    "h" => 45,
    "i" => 46,
    "j" => 47,
    "k" => 48,
    "l" => 49,
    "m" => 50,
    "n" => 51,
    "o" => 52,
    "p" => 53,
    "q" => 54,
    "r" => 55,
    "s" => 56,
    "t" => 57,
    "u" => 58,
    "v" => 59,
    "w" => 60,
    "x" => 61,
    "y" => 62,
    "z" => 63,
    _ => -1,
  }
}
