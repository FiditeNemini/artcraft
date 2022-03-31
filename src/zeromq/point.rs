use byteorder::{WriteBytesExt, LittleEndian, BigEndian};
use bytes::{BytesMut, BufMut};
use crate::zeromq::color::Color;
use rand::Rng;
use rand::distributions::Uniform;

#[derive(Debug)]
pub struct Point {
  // Position
  pub x: f32,
  pub y: f32,
  pub z: f32,
  // Color
  pub r: u8,
  pub g: u8,
  pub b: u8,
  pub a: u8,
}

impl Point {

  pub fn size_bytes() -> usize {
    16 // 3xf32, 4xu8
  }

  pub fn at(x: f32, y: f32, z: f32, color: Color) -> Self {
    Point {
      x,
      y,
      z,
      r: color.get_u8_r(),
      g: color.get_u8_g(),
      b: color.get_u8_b(),
      a: color.get_u8_a(),
    }
  }

  pub fn at_random_range(min: f32, max: f32, color: Color) -> Self {
    let mut rng = rand::thread_rng();
    let range = Uniform::new_inclusive(min, max);

    let x = rng.sample(&range);
    let y = rng.sample(&range);
    let z = rng.sample(&range);

    Point {
      x,
      y,
      z,
      r: color.get_u8_r(),
      g: color.get_u8_g(),
      b: color.get_u8_b(),
      a: color.get_u8_a(),
    }
  }

  pub fn to_bytes(&self) -> Vec<u8> {
    let mut buf = Vec::with_capacity(32);
    buf.write_f32::<LittleEndian>(self.x);
    buf.write_f32::<LittleEndian>(self.y);
    buf.write_f32::<LittleEndian>(self.z);
    buf.write_u8(self.r);
    buf.write_u8(self.g);
    buf.write_u8(self.b);
    buf.write_u8(self.a);
    buf
  }

  pub fn location_string(&self) -> String {
    format!("{}, {}, {}", self.x, self.y, self.z)
  }

  pub fn debug_string(&self) -> String {
    format!("(location: {}, {}, {}); (color: {}, {}, {}, alpha: {})",
            self.x, self.y, self.z,
            self.r, self.g, self.b, self.a)
  }
}