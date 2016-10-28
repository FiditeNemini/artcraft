// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

/// Create a waveform pause of the desired length.
pub fn generate_pause(length: u16) -> Vec<i16> {
  let mut sound = Vec::new();

  let len = length * 2; // number of channels
  for _ in 0..len { sound.push(0); }

  sound
}

