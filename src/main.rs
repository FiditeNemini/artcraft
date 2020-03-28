extern crate libc;

#[link(name="k4a")]
extern {
  fn k4a_device_get_installed_count() -> u32;
}

pub fn main() {
  println!("hello world");
  let device_count = unsafe { k4a_device_get_installed_count() };
  println!("Device count: {}", device_count);
}