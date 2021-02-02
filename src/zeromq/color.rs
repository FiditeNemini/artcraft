#[derive(Copy, Clone, Debug)]
pub enum Color {
  Black,
  White,
  Red,
  Green,
  Blue,
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
      Color::Custom {r, g, b, a} => *a,
    }
  }
}
