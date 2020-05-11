use arpabet::Arpabet;
use arpabet::phoneme::{Phoneme,VowelStress,Vowel,Consonant};
use arpabet::Polyphone;
use arpabet::extensions::Punctuation;
use arpabet::extensions::SentenceToken;
use sentence::{SentenceTokenizer, Token};
use numerics::{NumericsBuilder, Numerics};
use std::num::ParseIntError;

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

/// Convert text to the encoding used in my Arpabet extension
pub fn text_to_arpabet_encoding(arpabet: &Arpabet, text: &str) -> Vec<i64> {
  let sentence_tokenizer = SentenceTokenizer::new();
  let numerics = Numerics::default();

  let text = text.to_ascii_lowercase();

  let tokens = sentence_tokenizer.tokenize(&text);

  let space = u8::from(Punctuation::Space) as i64;
  let start= u8::from(Punctuation::StartToken) as i64;
  let end = u8::from(Punctuation::EndToken) as i64;

  let mut encoded_buffer : Vec<i64> = Vec::new();
  encoded_buffer.push(start); // start token

  for token in tokens {
    match token {
      Token::Word(word) => {
        if arpabet_lookup_and_encode_word(&word, &arpabet, &mut encoded_buffer) {
          encoded_buffer.push(space);
        }
      },
      Token::Integer(integer_string) => {
        let number_words = integer_string.parse::<i64>()
            .ok()
            .and_then(|number| numerics.convert_number(number).ok())
            .unwrap_or(Vec::new());

        for word in number_words {
          if arpabet_lookup_and_encode_word(&word, &arpabet, &mut encoded_buffer) {
            encoded_buffer.push(space);
          }
        }
      },
      Token::Punctuation(_) => continue,
      Token::CommaFormattedInteger(_) => continue,
      Token::CommaFormattedRealNumber(_) => continue,
      Token::Hashtag(_) => continue,
      Token::RealNumber(_) => continue,
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
