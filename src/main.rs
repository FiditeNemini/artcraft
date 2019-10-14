//! NB: From wavy library
//!
//! This example records audio and plays it back in real time as it's being recorded.

extern crate tensorflow;
extern crate wavy;
extern crate world_sys;
extern crate zmq;
extern crate failure;

pub mod ipc;
pub mod model;
pub mod synthesis;

use wavy::*;

use std::collections::VecDeque;
use std::fs::File;
use std::io::Read;
use std::path::Path;
use std::process::exit;
use std::thread;

use zmq::{Error, Socket};

use ipc::{QueueSender, AudioQueue};
use model::load_model;
use model::print_version;
use std::sync::Arc;
use failure::_core::time::Duration;

fn main() {
  print_version();
  //load_model(); // TODO: This works. Temporarily commented out
  run_audio().expect("should work");
  //run_audio().expect("should work");
}

fn run_audio() -> Result<(), AudioError> {
    println!("Opening microphone system");
    let mut mic = MicrophoneSystem::new(SampleRate::Normal)?;

    println!("Opening speaker system");
    let mut speaker = SpeakerSystem::new(SampleRate::Sparse)?;

    println!("Done");

    //let mut buffer = VecDeque::new();

    let mut audio_queue = Arc::new(AudioQueue::new());
    let mut audio_queue_2 = audio_queue.clone();

    thread::spawn(move || {
      let mut context = zmq::Context::new();
      let mut socket = context.socket(zmq::REQ).unwrap();

      socket.connect("tcp://127.0.0.1:5555").unwrap();

      let mut reconnect = false;
      let mut fail_count = 0;

      loop {
        let mut drained = match audio_queue_2.drain_size(1000) {
          None => { continue; },
          Some(d) => d,
        };

        println!("Len drained: {}", drained.len());
        let mut bytes: Vec<u8> = Vec::with_capacity(drained.len()*2);

        for val in drained {
          let byte_pair = val.to_be_bytes();
          bytes.push(byte_pair[0]);
          bytes.push(byte_pair[1]);
        }

        loop {
          if reconnect {
            reconnect = false;

            thread::sleep(Duration::from_millis(200));

            socket = match context.socket(zmq::REQ) {
              Ok(s) => s,
              Err(e) => {
                println!("Error creating socket: {:?}", e);
                continue
              },
            };

            match socket.connect("tcp://127.0.0.1:5555") {
              Ok(_) => {},
              Err(err) => {
                println!("Err B: {:?}", err);
              },
            }
          }
          match socket.send(&bytes, 0) {
            Ok(_) => { break; },
            Err(e) => {
              println!("send err: {:?}", e);
              fail_count += 1;
              if fail_count > 5 {
                fail_count = 0;
                reconnect = true;
              }
            },
          }
        }

      }
    });

    loop {
      mic.record(&mut |_index, l, r| {
        audio_queue.push_back(l);
        /*if !queue_sender.enqueue(l) {
          queue_sender.connect();
        }*/
        //buffer.push_back((l, l));
      });

      /*speaker.play(&mut || {
        if let Some((lsample, rsample)) = buffer.pop_front() {
          AudioSample::stereo(lsample, rsample)
        } else {
          AudioSample::stereo(0, 0)
        }
      });*/
    }
}

fn zeromq_test() {
  thread::spawn(|| {
    let ctx = zmq::Context::new();
    let mut socket = ctx.socket(zmq::REQ).unwrap();
    let mut reconnect = false;
    socket.connect("tcp://127.0.0.1:5555").unwrap();

    loop {
      if reconnect {
        match ctx.socket(zmq::REQ) {
          Err(_) => {},
          Ok(s) => {
            match s.connect("tcp://127.0.0.1:5555") {
              Err(_) => {},
              Ok(_) => {
                socket = s;
                reconnect = false;
              },
            }
          },
        }
      }
      match socket.send("hello world!", 0) {
        Ok(_) => {
          println!("Sent");
        },
        Err(_) => {
          reconnect = true;
        },
      }
    }
  });
}
