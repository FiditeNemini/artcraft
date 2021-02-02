use std::time::{UNIX_EPOCH, SystemTime};

#[derive(Copy, Clone, Debug)]
pub enum Color {
  Black,
  White,
  Red,
  Green,
  Blue,
  Yellow, // Red + Green
  Teal, // Green + Blue
  Purple, // Red + Blue
  Custom { r: u8, g: u8, b: u8, a: u8 },
}

impl Color {
  pub fn get_u8_r(&self) -> u8 {
    match &self {
      Color::Black => 0,
      Color::White => 255,
      Color::Red => 255,
      Color::Green => 0,
      Color::Blue => 0,
      Color::Yellow => 255,
      Color::Teal => 0,
      Color::Purple => 255,
      Color::Custom {r, g, b, a} => *r,
    }
  }

  pub fn get_u8_g(&self) -> u8 {
    match &self {
      Color::Black => 0,
      Color::White => 255,
      Color::Red => 0,
      Color::Green => 255,
      Color::Blue => 0,
      Color::Yellow => 255,
      Color::Teal => 255,
      Color::Purple => 0,
      Color::Custom {r, g, b, a} => *g,
    }
  }

  pub fn get_u8_b(&self) -> u8 {
    match &self {
      Color::Black => 0,
      Color::White => 255,
      Color::Red => 0,
      Color::Green => 0,
      Color::Blue => 255,
      Color::Yellow => 0,
      Color::Teal => 255,
      Color::Purple => 255,
      Color::Custom {r, g, b, a} => *b,
    }
  }

  pub fn get_u8_a(&self) -> u8 {
    match &self {
      Color::Black => 255,
      Color::White => 255,
      Color::Red => 255,
      Color::Green => 255,
      Color::Blue => 255,
      Color::Yellow => 255,
      Color::Teal => 255,
      Color::Purple => 255,
      Color::Custom {r, g, b, a} => *a,
    }
  }
}

/// Fun function to retrieve a color based on the time.
pub fn get_time_based_color() -> Color {
  let start = SystemTime::now();
  let timestamp = start
      .duration_since(UNIX_EPOCH)
      .expect("Time should work.");

  let seconds = timestamp.as_secs();

  match seconds % 10 {
    0 | 1 => Color::Purple, //Color::Black,
    2 | 3 => Color::Blue,
    4 | 5 => Color::Red,
    6 | 7 => Color::Green,
    8 | 9 => Color::White,
    _ => Color::White,
  }
}
