// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

#[derive(Debug)]
pub enum Stress {
  // 0
  None,
  // 1
  Primary,
  // 2
  Secondary
}

#[derive(Debug)]
pub enum Phoneme {
  // VOWELS
  // Monophthongs
  Aa { stress: Stress },
  Ae { stress: Stress },
  Ah { stress: Stress },
  Ao { stress: Stress },
  Ax { stress: Stress },
  Eh { stress: Stress },
  Ih { stress: Stress },
  Iy { stress: Stress },
  Uh { stress: Stress },
  Uw { stress: Stress },
  // Diphthongs
  Aw { stress: Stress },
  Ay { stress: Stress },
  Ey { stress: Stress },
  Ow { stress: Stress },
  Oy { stress: Stress },
  // R-Colored
  Er { stress: Stress },
  // CONSONANTS
  // Stops
  B,
  D,
  G,
  K,
  P,
  T,
  // Affricates
  Ch,
  Jh,
  // Fricatives
  Dh,
  F,
  Hh,
  S,
  Sh,
  Th,
  V,
  Z,
  Zh,
  // Nasals
  Em,
  En,
  Eng,
  M,
  N,
  Ng,
  // Liquids
  Dx,
  El,
  L,
  Mx,
  R,
  // Semivowels
  Q,
  W,
  Y,
}

impl Phoneme {
  pub fn from_str(string: &str) -> Option<Phoneme> {
    let phone = match string {
      // CONSONANTS
      // Stops
      "B" => Phoneme::B,
      "D" => Phoneme::D,
      "G" => Phoneme::G,
      "K" => Phoneme::K,
      "P" => Phoneme::P,
      "T" => Phoneme::T,
      // Affricates
      "CH" => Phoneme::Ch,
      "JH" => Phoneme::Jh,
      // Fricatives
      "DH" => Phoneme::Dh,
      "F" => Phoneme::F,
      "HH" => Phoneme::Hh,
      "S" => Phoneme::S,
      "SH" => Phoneme::Sh,
      "TH" => Phoneme::Th,
      "V" => Phoneme::V,
      "Z" => Phoneme::Z,
      "Zh" => Phoneme::Zh,
      // Nasals
      "EM" => Phoneme::Em,
      "EN" => Phoneme::En,
      "ENG" => Phoneme::Eng,
      "M" => Phoneme::M,
      "N" => Phoneme::N,
      "NG" => Phoneme::Ng,
      // Liquids
      "DX" => Phoneme::Dx,
      "EL" => Phoneme::El,
      "L" => Phoneme::L,
      "MX" => Phoneme::Mx,
      "R" => Phoneme::R,
      // Semivowels
      "Q" => Phoneme::Q,
      "W" => Phoneme::W,
      "Y" => Phoneme::Y,
      // VOWELS
      // Monophthongs
      "AA0" => Phoneme::Aa { stress: Stress::None },
      "AA1" => Phoneme::Aa { stress: Stress::Primary },
      "AA2" => Phoneme::Aa { stress: Stress::Secondary },
      "AE0" => Phoneme::Ae { stress: Stress::None },
      "AE1" => Phoneme::Ae { stress: Stress::Primary },
      "AE2" => Phoneme::Ae { stress: Stress::Secondary },
      "AH0" => Phoneme::Ah { stress: Stress::None },
      "AH1" => Phoneme::Ah { stress: Stress::Primary },
      "AH2" => Phoneme::Ah { stress: Stress::Secondary },
      "AO0" => Phoneme::Ao { stress: Stress::None },
      "AO1" => Phoneme::Ao { stress: Stress::Primary },
      "AO2" => Phoneme::Ao { stress: Stress::Secondary },
      "AX0" => Phoneme::Ax { stress: Stress::None },
      "AX1" => Phoneme::Ax { stress: Stress::Primary },
      "AX2" => Phoneme::Ax { stress: Stress::Secondary },
      "EH0" => Phoneme::Eh { stress: Stress::None },
      "EH1" => Phoneme::Eh { stress: Stress::Primary },
      "EH2" => Phoneme::Eh { stress: Stress::Secondary },
      "IH0" => Phoneme::Ih { stress: Stress::None },
      "IH1" => Phoneme::Ih { stress: Stress::Primary },
      "IH2" => Phoneme::Ih { stress: Stress::Secondary },
      "IY0" => Phoneme::Iy { stress: Stress::None },
      "IY1" => Phoneme::Iy { stress: Stress::Primary },
      "IY2" => Phoneme::Iy { stress: Stress::Secondary },
      "UH0" => Phoneme::Uh { stress: Stress::None },
      "UH1" => Phoneme::Uh { stress: Stress::Primary },
      "UH2" => Phoneme::Uh { stress: Stress::Secondary },
      "UW0" => Phoneme::Uw { stress: Stress::None },
      "UW1" => Phoneme::Uw { stress: Stress::Primary },
      "UW2" => Phoneme::Uw { stress: Stress::Secondary },
      // Diphthongs
      "AW0" => Phoneme::Aw { stress: Stress::None },
      "AW1" => Phoneme::Aw { stress: Stress::Primary },
      "AW2" => Phoneme::Aw { stress: Stress::Secondary },
      "AY0" => Phoneme::Ay { stress: Stress::None },
      "AY1" => Phoneme::Ay { stress: Stress::Primary },
      "AY2" => Phoneme::Ay { stress: Stress::Secondary },
      "EY0" => Phoneme::Ey { stress: Stress::None },
      "EY1" => Phoneme::Ey { stress: Stress::Primary },
      "EY2" => Phoneme::Ey { stress: Stress::Secondary },
      "OW0" => Phoneme::Ow { stress: Stress::None },
      "OW1" => Phoneme::Ow { stress: Stress::Primary },
      "OW2" => Phoneme::Ow { stress: Stress::Secondary },
      "OY0" => Phoneme::Oy { stress: Stress::None },
      "OY1" => Phoneme::Oy { stress: Stress::Primary },
      "OY2" => Phoneme::Oy { stress: Stress::Secondary },
      // R-Colored
      "ER0" => Phoneme::Er { stress: Stress::None },
      "ER1" => Phoneme::Er { stress: Stress::Primary },
      "ER2" => Phoneme::Er { stress: Stress::Secondary },
      _ => {
        return None;
      },
    };
    Some(phone)
  }

  pub fn as_str(&self) -> &'static str {
    match *self {
      // VOWELS
      // Monophthongs
      Phoneme::Aa { ref stress } => {
        match *stress {
          Stress::None => "AA0",
          Stress::Primary => "AA1",
          Stress::Secondary => "AA2",
        }
      },
      Phoneme::Ae { ref stress } => {
        match *stress {
          Stress::None => "AE0",
          Stress::Primary => "AE1",
          Stress::Secondary => "AE2",
        }
      },
      Phoneme::Ah { ref stress } => {
        match *stress {
          Stress::None => "AH0",
          Stress::Primary => "AH1",
          Stress::Secondary => "AH2",
        }
      },
      Phoneme::Ao { ref stress } => {
        match *stress {
          Stress::None => "AO0",
          Stress::Primary => "AO1",
          Stress::Secondary => "AO2",
        }
      },
      Phoneme::Ax { ref stress } => {
        match *stress {
          Stress::None => "AX0",
          Stress::Primary => "AX1",
          Stress::Secondary => "AX2",
        }
      },
      Phoneme::Eh { ref stress } => {
        match *stress {
          Stress::None => "EH0",
          Stress::Primary => "EH1",
          Stress::Secondary => "EH2",
        }
      },
      Phoneme::Ih { ref stress } => {
        match *stress {
          Stress::None => "IH0",
          Stress::Primary => "IH1",
          Stress::Secondary => "IH2",
        }
      },
      Phoneme::Iy { ref stress } => {
        match *stress {
          Stress::None => "IY0",
          Stress::Primary => "IY1",
          Stress::Secondary => "IY2",
        }
      },
      Phoneme::Uh { ref stress } => {
        match *stress {
          Stress::None => "UH0",
          Stress::Primary => "UH1",
          Stress::Secondary => "UH2",
        }
      },
      Phoneme::Uw { ref stress } => {
        match *stress {
          Stress::None => "UW0",
          Stress::Primary => "UW1",
          Stress::Secondary => "UW2",
        }
      },
      // Diphthongs
      Phoneme::Aw { ref stress } => {
        match *stress {
          Stress::None => "AW0",
          Stress::Primary => "AW1",
          Stress::Secondary => "AW2",
        }
      },
      Phoneme::Ay { ref stress } => {
        match *stress {
          Stress::None => "AY0",
          Stress::Primary => "AY1",
          Stress::Secondary => "AY2",
        }
      },
      Phoneme::Ey { ref stress } => {
        match *stress {
          Stress::None => "EY0",
          Stress::Primary => "EY1",
          Stress::Secondary => "EY2",
        }

      },
      Phoneme::Ow { ref stress } => {
        match *stress {
          Stress::None => "OW0",
          Stress::Primary => "OW1",
          Stress::Secondary => "OW2",
        }
      },
      Phoneme::Oy { ref stress } => {
        match *stress {
          Stress::None => "OY0",
          Stress::Primary => "OY1",
          Stress::Secondary => "OY2",
        }
      },
      // R-Colored
      Phoneme::Er { ref stress } => {
        match *stress {
          Stress::None => "ER0",
          Stress::Primary => "ER1",
          Stress::Secondary => "ER2",
        }
      },
      // CONSONANTS
      // Stops
      Phoneme::B => "B",
      Phoneme::D => "D",
      Phoneme::G => "G",
      Phoneme::K => "K",
      Phoneme::P => "P",
      Phoneme::T => "T",
      // Affricates
      Phoneme::Ch => "CH",
      Phoneme::Jh => "JH",
      // Fricatives
      Phoneme::Dh => "DH",
      Phoneme::F => "F",
      Phoneme::Hh => "HH",
      Phoneme::S => "S",
      Phoneme::Sh => "SH",
      Phoneme::Th => "TH",
      Phoneme::V => "V",
      Phoneme::Z => "Z",
      Phoneme::Zh => "ZH",
      // Nasals
      Phoneme::Em => "EM",
      Phoneme::En => "EN",
      Phoneme::Eng => "ENG",
      Phoneme::M => "M",
      Phoneme::N => "N",
      Phoneme::Ng => "NG",
      // Liquids
      Phoneme::Dx => "DX",
      Phoneme::El => "EL",
      Phoneme::L => "L",
      Phoneme::Mx => "MX",
      Phoneme::R => "R",
      // Semivowels
      Phoneme::Q => "Q",
      Phoneme::W => "W",
      Phoneme::Y => "Y",
    }
  }

  /// Whether the phoneme is a vowel.
  pub fn is_vowel(&self) -> bool {
    match *self {
      // Monophthongs
      Phoneme::Aa { stress: _ } |
      Phoneme::Ae { stress: _ } |
      Phoneme::Ah { stress: _ } |
      Phoneme::Ao { stress: _ } |
      Phoneme::Ax { stress: _ } |
      Phoneme::Eh { stress: _ } |
      Phoneme::Ih { stress: _ } |
      Phoneme::Iy { stress: _ } |
      Phoneme::Uh { stress: _ } |
      Phoneme::Uw { stress: _ } |
      // Diphthong
      Phoneme::Aw { stress: _ } |
      Phoneme::Ay { stress: _ } |
      Phoneme::Ey { stress: _ } |
      Phoneme::Ow { stress: _ } |
      Phoneme::Oy { stress: _ } |
      // R-Colored
      Phoneme::Er { stress: _ } => true,
      _ => false,
    }
  }
}
