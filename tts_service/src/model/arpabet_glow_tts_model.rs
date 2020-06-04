use crate::model::model_container::ModelContainer;
use anyhow::{Result, Error};
use std::path::Path;
use std::thread;
use std::time::Duration;
use tch::Tensor;
use crate::text::arpabet::text_to_arpabet_encoding_glow_tts;

pub struct ArpabetGlowTtsModel {
  model_container: ModelContainer,
}

impl ArpabetGlowTtsModel {
  pub fn load(filename: &Path) -> Result<Self> {
    let model_container = ModelContainer::load(filename)?;
    Ok(Self {
      model_container,
    })
  }

  pub fn encoded_arpabet_to_mel(&self, arpabet_sentence: &str) -> Tensor {
    println!("\narpabet sentence: {}\n", arpabet_sentence);

    let split = arpabet_sentence.split_whitespace();

    let mut encodings = Vec::new(); // TODO EFFICIENCY

    for item in split.into_iter() {
      let encoding = symbol_to_encoding(item);
      if encoding > -1 {
        encodings.push(encoding);
        encodings.push(11); // Space
      }
    }

    if encodings.len() > 0 {
      encodings.pop();
    }

    println!("Encodings: {:?}", encodings);

    /*
    @DH@IH1@S @IH1@Z @DH@AH0 @S@AO1@NG @DH@AE1@T @N@EH1@V@ER0 @EH1@N@D@Z

   x_tst tensor([[
     91, 109, 131,
     11, 109, 146,
     11,  91,  73,
     11, 131,  78, 120,
     11,  91,  70, 133,
     11, 119,  94, 143,  97,
     11,  94, 119,  90, 146]],
       device='cuda:0')
     */
    //let text : Vec<i64> = vec![118, 86, 11, 119, 102, 118, 11, 109, 146, 11, 90, 66, 119, 73, 117, 90, 11, 133, 130, 74, 118, 129, 11, 73, 119, 90, 11, 86, 11, 102, 70, 118, 11, 91, 73, 11, 129, 130, 94, 146, 108, 90, 73, 119, 133, 11, 74, 143, 11, 91, 73, 11, 145, 140, 119, 86, 133, 73, 90, 11, 56, 57, 38, 57, 42, 56, 6, 11, 145, 141, 11, 132, 137, 90, 11, 130, 108, 131, 129, 94, 116, 133, 11, 118, 113];



    let x_tst = Tensor::of_slice(&encodings.as_slice());

    println!("\n\nTensor size: {:?}", x_tst.size());

    let x_tst_2 = x_tst.unsqueeze(0);

    println!("\n\nTensor unsqueezed size: {:?}", x_tst_2.size());

    //let lengths = [27i64];
    let lengths = [encodings.len() as i64];
    let x_tst_lengths = Tensor::of_slice(&lengths);

    self.model_container.forward2(&x_tst_2, &x_tst_lengths)
  }
}

// TODO: This is gross af
fn symbol_to_encoding(symbol: &str) -> i64 {
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
    "@AA" => 64,
    "@AA0" => 65,
    "@AA1" => 66,
    "@AA2" => 67,
    "@AE" => 68,
    "@AE0" => 69,
    "@AE1" => 70,
    "@AE2" => 71,
    "@AH" => 72,
    "@AH0" => 73,
    "@AH1" => 74,
    "@AH2" => 75,
    "@AO" => 76,
    "@AO0" => 77,
    "@AO1" => 78,
    "@AO2" => 79,
    "@AW" => 80,
    "@AW0" => 81,
    "@AW1" => 82,
    "@AW2" => 83,
    "@AY" => 84,
    "@AY0" => 85,
    "@AY1" => 86,
    "@AY2" => 87,
    "@B" => 88,
    "@CH" => 89,
    "@D" => 90,
    "@DH" => 91,
    "@EH" => 92,
    "@EH0" => 93,
    "@EH1" => 94,
    "@EH2" => 95,
    "@ER" => 96,
    "@ER0" => 97,
    "@ER1" => 98,
    "@ER2" => 99,
    "@EY" => 100,
    "@EY0" => 101,
    "@EY1" => 102,
    "@EY2" => 103,
    "@F" => 104,
    "@G" => 105,
    "@HH" => 106,
    "@IH" => 107,
    "@IH0" => 108,
    "@IH1" => 109,
    "@IH2" => 110,
    "@IY" => 111,
    "@IY0" => 112,
    "@IY1" => 113,
    "@IY2" => 114,
    "@JH" => 115,
    "@K" => 116,
    "@L" => 117,
    "@M" => 118,
    "@N" => 119,
    "@NG" => 120,
    "@OW" => 121,
    "@OW0" => 122,
    "@OW1" => 123,
    "@OW2" => 124,
    "@OY" => 125,
    "@OY0" => 126,
    "@OY1" => 127,
    "@OY2" => 128,
    "@P" => 129,
    "@R" => 130,
    "@S" => 131,
    "@SH" => 132,
    "@T" => 133,
    "@TH" => 134,
    "@UH" => 135,
    "@UH0" => 136,
    "@UH1" => 137,
    "@UH2" => 138,
    "@UW" => 139,
    "@UW0" => 140,
    "@UW1" => 141,
    "@UW2" => 142,
    "@V" => 143,
    "@W" => 144,
    "@Y" => 145,
    "@Z" => 146,
    "@ZH" => 147,
    _ => -1,
  }
}

