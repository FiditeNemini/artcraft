// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

use std::i16;

/**
 * Change the volume of a waveform.
 * TODO: Doc.
 */
pub fn change_volume(waveform: Vec<i16>, volume: f32) -> Vec<i16> {
  let mut transformed : Vec<i16> = Vec::with_capacity(waveform.len());
  for x in &waveform {
    let data = raise_volume(*x, volume);
    transformed.push(data);
  }

  transformed
}

/// Raise the volume of a sample by changing its amplitude.
fn raise_volume(data: i16, vol: f32) -> i16 {
  // TODO: Cleanup, make more efficient.
  let f : f32 = data as f32 * vol;
  let g = f as i32;

  let h : i16 = if g > i16::MAX as i32 {
    i16::MAX
  } else if g < i16::MIN as i32 {
    i16::MIN
  } else {
    g as i16
  };

  h
}

