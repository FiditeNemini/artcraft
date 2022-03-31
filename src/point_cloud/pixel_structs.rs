use libc::uint16_t;
use libc::uint8_t;

#[repr(C)]
pub struct BgraPixel {
  pub blue: uint8_t,
  pub green: uint8_t,
  pub red: uint8_t,
  pub alpha: uint8_t,
}

pub type DepthPixel = uint16_t;
