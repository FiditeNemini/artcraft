// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use lang::phonemes::Phoneme;
use lang::phonemes::Stress;

/*
Arpabet has 54 different units:
- Vowels:
  - 10 monophthongs (AO, AA, IY, UW, EH, IH, UH, AH, AX, AE)
  - 5 diphthongs (EY, AY, OW, AW, OY)
  - 8 R-colored vowels (ER, AXR, EH R, UH R, AO R, AA R, IH|IY R, AW R)
- Consonants:
  - 6 Stops (P, B, T, D, K, G)
  - 2 Affricates (CH, JH)
  - 9 Fricatives (F, V, TH, DH, S, Z, SH, ZH, HH)
  - 6 Nasals (M, EM, N, EN, NG, ENG)
  - 5 Liquids (L, EL, R, DX, MX)
  - 3 Semivowels (Y, W, Q)
*/

pub type Polysyllable = Vec<Vec<String>>;

/// Traits on syllables, in case I decide to change the underlying
/// representation.
pub trait Polysyllabic {
  /// Number of monophones in a polysyllable (each syllable has n-many
  /// monophones).
  fn monophone_count(&self) -> usize;
}

/// Break an arpabet string into syllables comprised of arpabet monophones.
pub fn arpabet_to_syllables(input: &Vec<String>) -> Option<Polysyllable> {
  let mut phones = Vec::new();

  for atom in input {
    match Phoneme::from_str(atom) {
      None => {
        return None;
      },
      Some(phone) => { phones.push(phone); },
    }
  }

  let mut syllables = Vec::new();
  let mut syllable = Vec::new();

  let mut building_syllable = false;
  let mut syllable_has_vowel = false;
  let mut consonants_after_vowel = 0; // Count consonants after vowel

  for phone in phones {
    if !building_syllable {
      // Starting the very first syllable of the word.
      building_syllable = true;
      consonants_after_vowel = 0;
      if phone.is_vowel() {
        syllable_has_vowel = true;
      }
      syllable.push(phone);
      continue;
    }

    if syllable_has_vowel {
      if phone.is_vowel() {
        // Must create a new syllable so vowels don't run together!

        // Find out where to allocate any run of consonants from the
        // previous (current) syllable.
        if consonants_after_vowel > 0 {
          let movement = consonant_allocation(&syllable,
                                              consonants_after_vowel);

          match movement {
            ConsonantAlloc::MoveNone => {
              syllables.push(syllable);
              syllable = Vec::new();
            },
            ConsonantAlloc::MoveOne => {
              let one = syllable.pop();
              syllables.push(syllable);
              syllable = Vec::new();
              syllable.push(one.unwrap());
            },
            ConsonantAlloc::MoveTwo => {
              let one = syllable.pop();
              let two = syllable.pop();
              syllables.push(syllable);
              syllable = Vec::new();
              syllable.push(two.unwrap());
              syllable.push(one.unwrap());
            },
          }

          syllable.push(phone);
          syllable_has_vowel = true;
          consonants_after_vowel = 0;
          continue;
        }

        syllables.push(syllable);
        syllable = Vec::new();
        syllable.push(phone);
        syllable_has_vowel = true;
        consonants_after_vowel = 0;
        continue;
      } else {
        consonants_after_vowel += 1;
      }
    }

    if phone.is_vowel() {
      // The first vowel of the first syllable.
      syllable_has_vowel = true;
      consonants_after_vowel = 0;
    }

    // Continue building current syllable.
    syllable.push(phone);
  }

  if syllable.len() > 0 {
    syllables.push(syllable);
  }

  // Convert back to string.
  // FIXME: So inefficient! Linked lists would probably be best here.
  let mut output_syllables = Vec::new();
  for syllable in syllables {
    let mut output_syllable = Vec::new();
    for s in syllable {
      output_syllable.push(s.as_str().to_string());
    }
    output_syllables.push(output_syllable);
  }

  info!(target: "syllable", "Syllables: {:?}", output_syllables);

  Some(output_syllables)
}

// How many consonants to keep for a leading vowel.
enum ConsonantAlloc {
  MoveNone,
  MoveOne,
  MoveTwo,
}

// Heuristics for how to handle the consonants between vowels.
// Determine which vowel they get allocated to.
#[inline]
fn consonant_allocation(syllable: &Vec<Phoneme>,
                        consonants_after_vowel: usize)
                        -> ConsonantAlloc {

  match consonants_after_vowel {
    4 => {
      // There are four consonants between vowels.
      // Of the four consonants, how many does the last vowel retain?
      /*let mut movement = ConsonantAlloc::KeepTwo;

      let first_consonant = syllable.get(syllable.len() - 4);
      let second_consonant = syllable.get(syllable.len() - 3);
      let third_consonant = syllable.get(syllable.len() - 2);
      let fourth_consonant = syllable.get(syllable.len() - 1);

      if first_consonant.is_some()
          && second_consonant.is_some()
          && third_consonant.is_some()
          && fourth_consonant.is_some() {
        let first_consonant = first_consonant.unwrap();
        let second_consonant = second_consonant.unwrap();
        let third_consonant = third_consonant.unwrap();
        let fourth_consonant = fourth_consonant.unwrap();

        movement = match *first_consonant {
          _ => ConsonantAlloc::KeepTwo,
        };
      }

      movement*/
      ConsonantAlloc::MoveTwo
    },
    3 => {
      let first_consonant = syllable.get(syllable.len() - 3);
      let second_consonant = syllable.get(syllable.len() - 2);
      let third_consonant = syllable.get(syllable.len() - 1);

      if first_consonant.is_some()
          && second_consonant.is_some()
          && third_consonant.is_some() {
        let first_consonant = first_consonant.unwrap();
        let second_consonant = second_consonant.unwrap();
        let third_consonant = third_consonant.unwrap();

        return match *first_consonant {
          Phoneme::M => {
            match *second_consonant {
              Phoneme::P => {
                match *third_consonant {
                  Phoneme::L => ConsonantAlloc::MoveTwo, // M | P L ...
                  Phoneme::R => ConsonantAlloc::MoveTwo, // M | P R ...
                  Phoneme::T => ConsonantAlloc::MoveOne, // M P | T ...
                  _ => ConsonantAlloc::MoveNone,
                }
              },
              _ => ConsonantAlloc::MoveNone,
            }
          },
          Phoneme::Z => ConsonantAlloc::MoveTwo, // Z _ _ ...
          _ => ConsonantAlloc::MoveNone,
        };
      }

      ConsonantAlloc::MoveNone
    },
    2 => {
      // Usually we allocate one consonant per vowel, which seems to work most
      // of the time.
      let first_consonant = syllable.get(syllable.len() - 2);
      let second_consonant = syllable.get(syllable.len() - 1);

      if first_consonant.is_some()
          && second_consonant.is_some() {
        let first_consonant = first_consonant.unwrap();
        let second_consonant = second_consonant.unwrap();

        return match *first_consonant {
          Phoneme::K => {
            match *second_consonant {
              Phoneme::Y => ConsonantAlloc::MoveTwo, // K Y ..
              _ => ConsonantAlloc::MoveOne,
            }
          },
          Phoneme::S => {
            match *second_consonant {
              Phoneme::T => ConsonantAlloc::MoveNone, // .. S T
              _ => ConsonantAlloc::MoveOne,
            }
          }
          Phoneme::T => {
            match *second_consonant {
              Phoneme::R => ConsonantAlloc::MoveTwo, // T R ..
              _ => ConsonantAlloc::MoveOne,
            }
          },
          _ => ConsonantAlloc::MoveOne,
        };
      }

      ConsonantAlloc::MoveOne
    },
    1 => {
      // Usually we want to assign the single consonant to the next vowel.
      let previous_vowel = syllable.get(syllable.len() - 2);
      let previous_consonant = syllable.get(syllable.len() - 1);

      if previous_vowel.is_some() && previous_consonant.is_some() {
        let previous_vowel = previous_vowel.unwrap();
        let previous_consonant = previous_consonant.unwrap();

        return match *previous_vowel {
          Phoneme::Aa { .. } => {
            match *previous_consonant {
              Phoneme::L => ConsonantAlloc::MoveNone, // AA L .. ("All")
              _ => ConsonantAlloc::MoveOne,
            }
          }
          Phoneme::Ae { .. } => {
            match *previous_consonant {
              Phoneme::S => ConsonantAlloc::MoveNone, // AE S .. ("Ass")
              _ => ConsonantAlloc::MoveOne,
            }
          },
          Phoneme::Ah { stress: Stress::Secondary } => {
            match *previous_consonant {
              // AH2 L .. ("A(u)l", eg (n)ull-ify)
              Phoneme::L => ConsonantAlloc::MoveNone,
              _ => ConsonantAlloc::MoveOne,
            }
          },
          Phoneme::Ao { .. } => {
            match *previous_consonant {
              Phoneme::R => ConsonantAlloc::MoveNone, // AO R .. ("Orr")
              _ => ConsonantAlloc::MoveOne,
            }
          },
          Phoneme::Ih { .. } => {
            match *previous_consonant {
              //Phoneme::K => ConsonantAlloc::MoveNone, // IH K .. ("Ick")
              Phoneme::N => ConsonantAlloc::MoveNone, // IH N .. ("Inn")
              Phoneme::S => ConsonantAlloc::MoveNone, // IH S .. ("Iss")
              _ => ConsonantAlloc::MoveOne,
            }
          },
          _ => ConsonantAlloc::MoveOne,
        };
      }

      ConsonantAlloc::MoveOne
    },
    _ => ConsonantAlloc::MoveNone,
  }
}

impl Polysyllabic for Polysyllable {
  fn monophone_count(&self) -> usize {
    let mut count = 0;
    for syllable in self {
      count += syllable.len();
    }
    count
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_easy_cases() {
    // Test a bunch of random easy words from ARPABET.

    // Reduction
    assert_eq!(syl("R IH0|D AH1 K|SH AH0 N"), conv("R IH0 D AH1 K SH AH0 N"));

    // Technological
    //assert_eq!(syl("T EH2 K|N AH0|L AA1 JH|IH0|K AH0 L"),
    //           conv("T EH2 K N AH0 L AA1 JH IH0 K AH0 L"));
    assert_eq!(syl("T EH2 K|N AH0|L AA1|JH IH0|K AH0 L"),
               conv("T EH2 K N AH0 L AA1 JH IH0 K AH0 L"));

    // Disappear
    assert_eq!(syl("D IH2 S|AH0|P IH1 R"), conv("D IH2 S AH0 P IH1 R"));

    // Disorientation
    assert_eq!(syl("D IH0 S|AO2 R|IY0|AH0 N|T EY1|SH AH0 N"),
               conv("D IH0 S AO2 R IY0 AH0 N T EY1 SH AH0 N"));

    // Mountaineer
    assert_eq!(syl("M AW1 N|T IH0 N|IH2 R"), conv("M AW1 N T IH0 N IH2 R"));

    // Ridiculously
    //assert_eq!(syl("R AH0|D IH1 K|Y AH0|L AH0 S|L IY0"),
    //           conv("R AH0 D IH1 K Y AH0 L AH0 S L IY0"));
    assert_eq!(syl("R AH0|D IH1|K Y AH0|L AH0 S|L IY0"),
               conv("R AH0 D IH1 K Y AH0 L AH0 S L IY0"));

    // Because
    assert_eq!(syl("B IH0|K AO1 Z"), conv("B IH0 K AO1 Z"));

    // Passenger
    assert_eq!(syl("P AE1 S|AH0 N|JH ER0"), conv("P AE1 S AH0 N JH ER0"));

    // Wisconsin
    assert_eq!(syl("W IH0 S|K AA1 N|S AH0 N"), conv("W IH0 S K AA1 N S AH0 N"));

    // Kernaghan
    //assert_eq!(syl("K ER0 N|AE1|G AH0 N"), conv("K ER0 N AE1 G AH0 N"));

    // Diametrically
    assert_eq!(syl("D AY2|AH0|M EH1|T R IH0|K AH0|L IY0"),
               conv("D AY2 AH0 M EH1 T R IH0 K AH0 L IY0"));

    // Diaper
    assert_eq!(syl("D AY1|P ER0"), conv("D AY1 P ER0"));

    // Number-one
    assert_eq!(syl("N AH2 M|B ER0|W AH1 N"), conv("N AH2 M B ER0 W AH1 N"));

    // Nullification
    assert_eq!(syl("N AH2 L|AH0|F AH0|K EY1|SH AH0 N"),
               conv("N AH2 L AH0 F AH0 K EY1 SH AH0 N"));

    // Flabbergasted
    assert_eq!(syl("F L AE1|B ER0|G AE2 S T|IH0 D"),
               conv("F L AE1 B ER0 G AE2 S T IH0 D"));

    // Molecules TODO
    assert_eq!(syl("M AA1 L|AH0|K Y UW2 L Z"), conv("M AA1 L AH0 K Y UW2 L Z"));

    // Nicaraguans
    assert_eq!(syl("N IH2|K ER0|AA1 G|W AH0 N Z"),
               conv("N IH2 K ER0 AA1 G W AH0 N Z"));

    // Niceness
    assert_eq!(syl("N AY1 S|N AH0 S"), conv("N AY1 S N AH0 S"));

    // Repetition
    //assert_eq!(syl("R EH2 P|AH0|T IH1 SH|AH0 N"),
    //           conv("R EH2 P AH0 T IH1 SH AH0 N"));
    assert_eq!(syl("R EH2|P AH0|T IH1|SH AH0 N"),
               conv("R EH2 P AH0 T IH1 SH AH0 N"));

    // Repercussion
    //assert_eq!(syl("R IY2|P ER0|K AH1 SH|AH0 N"),
    //           conv("R IY2 P ER0 K AH1 SH AH0 N"));
    assert_eq!(syl("R IY2|P ER0|K AH1|SH AH0 N"),
               conv("R IY2 P ER0 K AH1 SH AH0 N"));

    // Limits
    //assert_eq!(syl("L IH1 M|AH0 T S"), conv("L IH1 M AH0 T S"));
    assert_eq!(syl("L IH1|M AH0 T S"), conv("L IH1 M AH0 T S"));

    /*
    assert_eq!(syl(""), conv(""));
    */
  }

  #[test]
  fn test_three_consonants() {
    // Test words with three consonants between vowels

    // Employable (vs. empty)
    assert_eq!(syl("EH0 M|P L OY1|AH0|B AH0 L"),
               conv("EH0 M P L OY1 AH0 B AH0 L"));

    // Empty (vs. employable)
    assert_eq!(syl("EH1 M P|T IY0"), conv("EH1 M P T IY0"));

    // Temperamental
    assert_eq!(syl("T EH2 M|P R AH0|M EH1 N|T AH0 L"),
               conv("T EH2 M P R AH0 M EH1 N T AH0 L"));

    // Wisecracks
    assert_eq!(syl("W AY1 Z|K R AE2 K S"), conv("W AY1 Z K R AE2 K S"));

    /*
    assert_eq!(syl(""), conv(""));
    */
  }

  #[test]
  fn test_four_consonants() {
    // TODO ENABLE - These don't work yet.

    // Explain
    assert_eq!(syl("IH0 K S|P L EY1 N"), conv("IH0 K S P L EY1 N"));

    // Landscape
    assert_eq!(syl("L AE1 N D|S K EY2 P"), conv("L AE1 N D S K EY2 P"));
  }

  //#[test]
  fn test_difficult() {
    // TODO ENABLE - These don't work yet.

    // Talking
    assert_eq!(syl("T AO1 K|IH0 NG"), conv("T AO1 K IH0 NG"));

    // Archipelago
    assert_eq!(syl("AA2 R K|AH0|P EH1 L|AH0|G OW2"),
               conv("AA2 R K AH0 P EH1 L AH0 G OW2"));
  }

  #[test]
  fn polysyllablic_monophone_count() {
    fn syllable(input: Vec<Vec<&str>>) -> Polysyllable {
      let mut out = Vec::new();
      for syllable in input {
        let new_syllable = syllable.iter().map(|s| s.to_string()).collect();
        out.push(new_syllable);
      }
      out
    }

    let polyphone = syllable(vec![vec![]]);
    assert_eq!(0, polyphone.monophone_count());

    let polyphone = syllable(vec![vec!["A"]]);
    assert_eq!(1, polyphone.monophone_count());

    let polyphone = syllable(vec![vec!["A", "B", "C"], vec!["D"]]);
    assert_eq!(4, polyphone.monophone_count());

    let polyphone = syllable(vec![vec!["A", "B", "C"], vec!["D", "E"],
                             vec!["F", "G"]]);
    assert_eq!(7, polyphone.monophone_count());
  }

  // Shorter for tests
  fn conv(input: &str) -> Option<Vec<Vec<String>>> {
    arpabet_to_syllables(&pho(input))
  }

  // Construct an arpabet polyphone
  fn pho(words: &str) -> Vec<String> {
    words.split_whitespace().map(|w| w.to_string()).collect()
  }

  // Construct syllables constructed of n-phones.
  fn syl(words: &str) -> Option<Vec<Vec<String>>> {
    let syllables: Vec<&str> = words.split("|").collect();
    let mut syllables_of_phonemes = Vec::new();

    for syllable in syllables {
      let item = syllable.split_whitespace().map(|w| w.to_string()).collect();
      syllables_of_phonemes.push(item);
    }
    Some(syllables_of_phonemes)
  }
}
