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

pub fn arpabet_to_syllables(input: &Vec<String>) -> Option<Vec<Vec<String>>> {
  let mut phones = Vec::new();

  for atom in input {
    match Phoneme::from_str(atom) {
      None => {
        println!("NONE: {}", atom); // TODO REMOVE
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
    println!("syllable_has_vowel = {}", syllable_has_vowel);
    println!("Phone: {:?}, {}", phone, phone.is_vowel());

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
        let mut leading_consonant = None;
        if consonants_after_vowel == 2 {
          // There are two consonants between vowels.
          // Split consonants - one per vowel.
          leading_consonant = syllable.pop();

          // But let's check some heuristics...
          // Advance means put the consonants on the NEXT syllable
          let mut advance = false;
          // Reattach means put the consonants on the PREVIOUS syllable
          let mut reattach = false;
          {
            // >>> 2-CONSONANT SEPARATION HEURISTICS <<<
            let first_consonant = syllable.last();
            if first_consonant.is_some() && leading_consonant.is_some() {
              // Sequence is:
              // Vowel, Consonant, Consonant, (Vowel - the current "phone")
              let first_consonant = first_consonant.unwrap();
              let second_consonant = leading_consonant.as_ref().unwrap();

              advance = match *first_consonant {
                Phoneme::K { .. } => {
                  match *second_consonant {
                    Phoneme::Y => true, // K Y ..
                    _ => false,
                  }
                },
                Phoneme::T { .. } => {
                  match *second_consonant {
                    Phoneme::R => true, // T R ..
                    _ => false,
                  }
                },
                _ => false,
              };

              if !advance {
                reattach = match *first_consonant {
                  Phoneme::S { .. } => {
                    match *second_consonant {
                      Phoneme::T => true, // .. S T
                      _ => false,
                    }
                  },
                  _ => false,
                };
              }
            }
          }

          if advance && leading_consonant.is_some() {
            // Let's actually move both consonants forward to the next syllable.
            let first_consonant = syllable.pop();
            if first_consonant.is_some() {
              syllables.push(syllable);
              syllable = Vec::new();
              syllable.push(first_consonant.unwrap()); // 1st
              syllable.push(leading_consonant.unwrap()); // 2nd
            }

            syllable.push(phone);
            syllable_has_vowel = true;
            consonants_after_vowel = 0;
            continue;
          }

          if reattach && leading_consonant.is_some() {
            // Keep both consonants on the last syllable.
            syllable.push(leading_consonant.unwrap());
            syllables.push(syllable);
            syllable = Vec::new();
            syllable.push(phone);
            syllable_has_vowel = true;
            consonants_after_vowel = 0;
            continue;
          }

        } else if consonants_after_vowel == 1 {
          // There's just one consonant between vowels.
          // Usually we want to assign the consonant to the next vowel.
          leading_consonant = syllable.pop();

          // But let's check some heuristics...
          let mut reattach = false;
          {
            // >>> 1-CONSONANT SEPARATION HEURISTICS <<<
            let previous_vowel = syllable.last();
            if previous_vowel.is_some() && leading_consonant.is_some() {
              // Sequence is: Vowel, Consonant, (Vowel - the current "phone")
              let previous_vowel = previous_vowel.unwrap();
              let previous_consonant = leading_consonant.as_ref().unwrap();

              reattach = match *previous_vowel {
                Phoneme::Aa { .. } => {
                  match *previous_consonant {
                    Phoneme::L => true, // AA L .. ("All")
                    _ => false,
                  }
                }
                Phoneme::Ae { .. } => {
                  match *previous_consonant {
                    Phoneme::S => true, // AE S .. ("Ass")
                    _ => false,
                  }
                },
                Phoneme::Ah { stress : Stress::Secondary } => {
                  match *previous_consonant {
                    Phoneme::L => true, // AH2 L .. ("A(u)l", eg (n)ull-ify)
                    _ => false,
                  }
                },
                Phoneme::Ao { .. } => {
                  match *previous_consonant {
                    Phoneme::R => true, // AO R .. ("Orr")
                    _ => false,
                  }
                },
                Phoneme::Ih { .. } => {
                  match *previous_consonant {
                    //Phoneme::K => true, // IH K .. ("Ick")
                    Phoneme::N => true, // IH N .. ("Inn")
                    Phoneme::S => true, // IH S .. ("Iss")
                    _ => false,
                  }
                },
                _ => false,
              };
            }
          }

          if reattach && leading_consonant.is_some() {
            // Nope, let's put the consonant back with the previous vowel.
            syllable.push(leading_consonant.unwrap());
            leading_consonant = None;
          }
        }

        syllables.push(syllable);

        syllable = Vec::new();
        if leading_consonant.is_some() {
          syllable.push(leading_consonant.unwrap());
        }

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

  println!("Syllables: {} - {:?}\n\n", syllables.len(), syllables);

  // Convert back to string.
  // FIXME: So inefficient!
  let mut output_syllables = Vec::new();
  for syllable in syllables {
    let mut output_syllable = Vec::new();
    for s in syllable {
      output_syllable.push(s.as_str().to_string());
    }
    output_syllables.push(output_syllable);
  }

  Some(output_syllables)
}


#[cfg(test)]
mod tests {
  use super::arpabet_to_syllables;

  #[test]
  fn test_easy_cases() {
    // Test a bunch of random words from ARPABET.

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
    assert_eq!(syl(""), conv(""));
    assert_eq!(syl(""), conv(""));
    assert_eq!(syl(""), conv(""));
    */
  }

  // TODO ENABLE
  //#[test]
  fn test_lots_of_consonants() {
    // Wisecracks
    assert_eq!(syl("W AY1 Z|K R AE2 K S"), conv("W AY1 Z K R AE2 K S"));

    // Temperamental
    assert_eq!(syl("T EH2 M|P R AH0|M EH1 N|T AH0 L"),
               conv("T EH2 M P R AH0 M EH1 N T AH0 L"));

    // Landscape
    assert_eq!(syl("L AE1 N D|S K EY2 P"), conv("L AE1 N D S K EY2 P"));
  }

  // TODO ENABLE
  //#[test]
  fn test_difficult() {
    // Explain
    assert_eq!(syl("IH0 K|S P L EY1 N"), conv("IH0 K S P L EY1 N"));
    // Talking
    assert_eq!(syl("T AO1 K|IH0 NG"), conv("T AO1 K IH0 NG"));

    // Archipelago
    assert_eq!(syl("AA2 R K|AH0|P EH1 L|AH0|G OW2"),
               conv("AA2 R K AH0 P EH1 L AH0 G OW2"));
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
