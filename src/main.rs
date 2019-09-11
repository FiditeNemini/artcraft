
extern crate cpal;
extern crate hound;
extern crate sample;
//extern crate signal;
extern crate sonogram;
extern crate wavy;

use wavy::*;
//use signal;

use std::collections::VecDeque;

fn main() {
  println!("Run");
  record().unwrap();
}

const THRESHOLD : i16 = 1500;

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
