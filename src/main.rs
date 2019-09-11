
extern crate cpal;
extern crate hound;
extern crate sample;
//extern crate signal;
extern crate sonogram;
extern crate wavy;

use std::f64;

use wavy::*;
//use signal;

use std::collections::VecDeque;

fn main() {
  println!("Run");
  //record().unwrap();
  record2().unwrap();
}

const THRESHOLD : i16 = 750;

fn record2() -> Result<(), AudioError> {
  println!("Opening microphone system");
  let mut mic = MicrophoneSystem::new(SampleRate::Studio)?;

  println!("Opening speaker system");
  let mut speaker = SpeakerSystem::new(SampleRate::Studio)?;

  println!("Done");

  let mut buffer = VecDeque::with_capacity(1028 * 1028);

  loop {
    mic.record(&mut |_index, mut l, mut r| {
      if l < THRESHOLD && l > -THRESHOLD {
        l = l / 2;
      }
      if r < THRESHOLD && r > -THRESHOLD {
        r = r / 2;
      }
      //println!("L: {}, R: {}", l, r);
      buffer.push_back((l, l));
    });

    //let mut last_lsample = None;
    //let mut last_rsample = None;

    let mut i = 0;

    speaker.play(&mut || {

      let y = sin(i);
      i += 1;
      //println!("Sin: {}", y);
      let l = (y * 500.0) as i16;

      AudioSample::stereo(l, l)

      /*if let Some((lsample, rsample)) = buffer.pop_front() {
        last_lsample = Some(lsample);
        last_rsample = Some(rsample);
        AudioSample::stereo(lsample, rsample)
      } else {
        let lsample = last_lsample.unwrap_or(0);
        let rsample = last_rsample.unwrap_or(0);
        //println!("No data!");
        AudioSample::stereo(lsample, rsample)
      }*/
    });
  }
}

fn sin(i: i64) -> f64 {
  //let x = f64::consts::PI*2.0;
  //let abs_difference = (x.sin() - 1.0).abs();

  let x = ((i+1) % 3000) as f64 / 3000.0;
  let x = x * f64::consts::PI * 2.0;

  x.sin()
}

fn record() -> Result<(), AudioError> {
  // Connect to the speaker and microphone systems.
  let mut mic = MicrophoneSystem::new(SampleRate::Studio)?;
  let mut speaker = SpeakerSystem::new(SampleRate::Normal)?;

  let mut buffer = VecDeque::with_capacity(2048);

/*  // Convert a signal to its RMS.
let signal = signal::rate(44_100.0).const_hz(440.0).sine();;
let ring_buffer = ring_buffer::Fixed::from([[0.0]; WINDOW_SIZE]);
let mut rms_signal = signal.rms(ring_buffer);*/

  loop {
    // Record some sound.
    mic.record(&mut |_whichmic, mut l, mut r| {
      //println!("Enqueue");
      /*if buffer.len() < 20480 {
        buffer.push_back((l, r));
      }*/
      println!("Left: {}, Right: {}", l, r);
      if l < THRESHOLD && l > -THRESHOLD {
        l = l / 2;
      }
      if r < THRESHOLD && r > -THRESHOLD {
        r = r / 2;
      }
      buffer.push_back((l, r));
    });

    let mut last_rsample = None;
    let mut last_lsample = None;
    
    // Play that sound.
    speaker.play(&mut || {
      if let Some((lsample, rsample)) = buffer.pop_front() {
        //let rsample = rsample.saturating_mul(2);
        //let lsample = lsample.saturating_mul(2);
        last_rsample = Some(rsample);
        last_lsample = Some(lsample);
        /*let swap = rsample;
        let rsample = lsample;
        let lsample = swap;*/
        let mono = lsample;

        //let mono = mono.saturating_mul(2);

        AudioSample::stereo(mono, mono)
      } else {
        // Play silence if not enough has been recorded yet.
        //let rsample = last_rsample.unwrap_or(0);
        //let lsample = last_lsample.unwrap_or(0);
        let rsample = 0;
        let lsample = 0;
        println!("No data!");
        AudioSample::stereo(rsample, lsample)
      }
    });
  }
}
