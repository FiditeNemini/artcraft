
/// A core color type
#[derive(Clone, Debug, Default, PartialEq)]
pub struct RgbaF32 {
  pub red: f32,
  pub green: f32,
  pub blue: f32,
  pub alpha: f32,
}

impl RgbaF32 {
  /// Black (alpha 1.0)
  pub fn black() -> Self {
    Self {
      red: 0.0,
      green: 0.0,
      blue: 0.0,
      alpha: 1.0,
    }
  }

  pub fn rgb(r: f32, g: f32, b: f32) -> Self {
    Self {
      red: r,
      green: g,
      blue: b,
      alpha: 1.0,
    }
  }

  pub fn gray(gray: f32) -> Self {
    Self {
      red: gray,
      green: gray,
      blue: gray,
      alpha: 1.0,
    }
  }
}

#[cfg(test)]
mod test {
  use crate::core_types::RgbaF32;

  #[test]
  pub fn test_rgbaf32() {
    let black = RgbaF32::black();
    assert_eq!(black.red, 0.0f32);
    assert_eq!(black.green, 0.0f32);
    assert_eq!(black.blue, 0.0f32);
    assert_eq!(black.alpha, 1.0f32);
  }

  #[test]
  pub fn test_gray() {
    let gray = RgbaF32::gray(0.5);
    assert_eq!(gray.red, 0.5f32);
    assert_eq!(gray.green, 0.5f32);
    assert_eq!(gray.blue, 0.5f32);
    assert_eq!(gray.alpha, 1.0f32);
  }
}
