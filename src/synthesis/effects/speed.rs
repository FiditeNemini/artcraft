// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

/**
 * Change the speed of a waveform, producing a waveform that is
 * "slower" or "faster". A speed of "0.5" will be slower (thus
 * longer), and a speed of "2.0" will be faster (thus shorter).
 */
pub fn change_speed(waveform: Vec<i16>, speed: f32) -> Vec<i16> {
  let change = 1.0 / speed;
  let size = (waveform.len() as f32 * change).round() as usize;

  // FIXME: Use memory of caller.
  // Caller can be more efficient with memory management.
  let mut stretched : Vec<i16> = Vec::with_capacity(size);

  for i in 0..size {
    let j = (i as f32 / change).floor() as usize;
    stretched.push(waveform[j]);
  }

  // Heuristic: odd sized waveforms don't seem to work. (Due to # channels?)
  if size % 2 == 1 {
    stretched.push(0);
  }

  stretched
}

