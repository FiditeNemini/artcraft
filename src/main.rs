
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

fn record() -> Result<(), AudioError> {
  // Connect to the speaker and microphone systems.
  let mut mic = MicrophoneSystem::new(SampleRate::Studio)?;
  let mut speaker = SpeakerSystem::new(SampleRate::Normal)?;

  let mut buffer = VecDeque::with_capacity(30_000);

/*  // Convert a signal to its RMS.
let signal = signal::rate(44_100.0).const_hz(440.0).sine();;
let ring_buffer = ring_buffer::Fixed::from([[0.0]; WINDOW_SIZE]);
let mut rms_signal = signal.rms(ring_buffer);*/

  loop {
    // Record some sound.
    mic.record(&mut |_whichmic, l, r| {
      buffer.push_back((l, r));
      //buffer.push_back((l, r));
    });

    let mut last_rsample = None;
    let mut last_lsample = None;
    
    // Play that sound.
    speaker.play(&mut || {

      let mut sample = None;
      let mut count = 0;
      while sample.is_none() {
        sample = buffer.pop_front();
        //if let Some((lsample, rsample)) = buffer.pop_front() {
        //let rsample = rsample.saturating_mul(2);
        count += 1;
        if count > 10 {
          break;
        }
      }

      match sample {
        Some((lsample, rsample)) => {
          last_rsample = Some(rsample);
          last_lsample = Some(lsample);
          AudioSample::stereo(lsample, rsample)
        },
        None => {
          //println!("NOO");
          //AudioSample::stereo(0,0)
          let rsample = last_rsample.unwrap_or(0);
          let lsample = last_lsample.unwrap_or(0);
          AudioSample::stereo(lsample, rsample)
        }
      }

      /*//println!("Buffer size {}", buffer.len());
      if let Some((lsample, rsample)) = buffer.pop_front() {
        //let rsample = rsample.saturating_mul(2);
        //let lsample = lsample.saturating_mul(2);
        /*let swap = rsample;
        let rsample = lsample;
        let lsample = swap;*/
        AudioSample::stereo(lsample, rsample)
      } else {
        // Play silence if not enough has been recorded yet.
        let rsample = last_rsample.unwrap_or(0);
        let lsample = last_lsample.unwrap_or(0);
        /*let rsample = 0;
        let lsample = 0;*/
        println!("zero {},{}", rsample, lsample);
        AudioSample::stereo(rsample, lsample)
      }*/

    });
  }
}
