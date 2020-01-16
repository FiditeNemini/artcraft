use arpabet::Arpabet;
use arpabet::phoneme::{Phoneme,VowelStress,Vowel,Consonant};
use arpabet::Polyphone;
use arpabet::extensions::Punctuation;
use arpabet::extensions::SentenceToken;

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
  let copied = text.to_string().to_ascii_lowercase();
  let mut encoded_buffer : Vec<i64> = Vec::new();

  let split = copied.split_whitespace();

  let space = u8::from(Punctuation::Space) as i64;
  let start= u8::from(Punctuation::StartToken) as i64;
  let end = u8::from(Punctuation::EndToken) as i64;

  encoded_buffer.push(start);

  for word in split {
    match arpabet.get_polyphone(word) {
      None => continue,
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
        encoded_buffer.push(space);
      },
    }
  }

  encoded_buffer.push(end);

  encoded_buffer
}
