//! NB: From wavy library
//!
//! This example records audio and plays it back in real time as it's being recorded.

extern crate bytes;
extern crate byteorder;
extern crate cpal;
extern crate failure;
extern crate prost;
extern crate prost_types;
//extern crate tensorflow;
extern crate wavy;
extern crate world_sys;
extern crate zmq;

//include!(concat!(env!("OUT_DIR"), "/voder.audio.rs"));

pub mod ipc;
//pub mod model;
pub mod protos;
pub mod synthesis;

use protos::voder_audio::VocodeAudioRequest;
use protos::voder_audio::VocodeAudioResponse;

use wavy::*;


use byteorder::{ByteOrder, BigEndian, LittleEndian, ReadBytesExt};
use cpal::traits::{DeviceTrait, EventLoopTrait, HostTrait};
use failure::_core::time::Duration;
use ipc::AudioQueue;
use prost::Message;
//use model::load_model;
//use model::print_version;
use std::collections::VecDeque;
use std::fs::File;
use std::io::{Read, Cursor};
use std::path::Path;
use std::process::exit;
use std::sync::Arc;
use std::thread;
use zmq::{Error, Socket};

fn main() {
  //print_version();
  //load_model(); // TODO: This works. Temporarily commented out
  run_cpal_audio().expect("Should work");
}

const LATENCY_MS: f32 = 50.0;

fn run_cpal_audio() -> Result<(), failure::Error> {
  let host = cpal::default_host();
  let event_loop = host.event_loop();

  // Default devices.
  let input_device = host.default_input_device().expect("failed to get default input device");
  let output_device = host.default_output_device().expect("failed to get default output device");
  println!("Using default input device: \"{}\"", input_device.name()?);
  println!("Using default output device: \"{}\"", output_device.name()?);

  // We'll try and use the same format between streams to keep it simple
  let mut format = input_device.default_input_format()?;
  format.data_type = cpal::SampleFormat::F32;

  // Build streams.
  println!("Attempting to build both streams with `{:?}`.", format);
  let input_stream_id = event_loop.build_input_stream(&input_device, &format)?;
  let output_stream_id = event_loop.build_output_stream(&output_device, &format)?;
  println!("Successfully built streams.");

  // Create a delay in case the input and output devices aren't synced.
  let latency_frames = (LATENCY_MS / 1_000.0) * format.sample_rate.0 as f32;
  let latency_samples = latency_frames as usize * format.channels as usize;

  // The channel to share samples.
  //let (tx, rx) = std::sync::mpsc::sync_channel(latency_samples * 2);

  let mut audio_queue = Arc::new(AudioQueue::new());
  let mut audio_queue_2 = audio_queue.clone();

  let mut post_process_queue = Arc::new(AudioQueue::new());
  let mut post_process_queue_2 = post_process_queue.clone();

  thread::spawn(move || {
    let mut context = zmq::Context::new();
    let mut socket = context.socket(zmq::REQ).unwrap();

    socket.connect("tcp://127.0.0.1:5555").unwrap();

    let mut reconnect = false;
    let mut fail_count = 0;

    const SEND_SIZE : usize = 5000;

    loop {
      let mut drained = match audio_queue_2.drain_size(SEND_SIZE) {
        None => { continue; },
        Some(d) => d,
      };

      let mut vocode_request = VocodeAudioRequest::default();
      vocode_request.float_audio = drained.clone();
      vocode_request.test_name = "Foo Bar".into();

      let mut encoded_bytes = Vec::with_capacity(vocode_request.encoded_len());
      vocode_request.encode(&mut encoded_bytes).unwrap();
      //println!("Encoded len: {}", vocode_request.encoded_len());

      //println!("Len drained: {}", drained.len());
      let mut bytes: Vec<u8> = Vec::with_capacity(drained.len()*4);

      for val in drained {
        let mut buf = [0; 4];
        LittleEndian::write_f32(&mut buf, val);
        bytes.push(buf[0]);
        bytes.push(buf[1]);
        bytes.push(buf[2]);
        bytes.push(buf[3]);
      }

      if reconnect {
        reconnect = false;
        println!("RECONNECT");

        //thread::sleep(Duration::from_millis(200));

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

      match socket.send(&encoded_bytes, 0) {
        Ok(_) => {
          //println!("Sent len: {}", bytes.len());
        },
        Err(e) => {
          println!("send err {}: {:?}", e.to_raw(), e);
          fail_count += 1;
        },
      }

      //thread::sleep(Duration::from_millis(10));

      match socket.recv_bytes(0) {
        Ok(buf) => {
          //println!("---> Buf len: {}", buf.len());
          if buf.len() > 2 {
            // Receive data condition.
            let mut cur = Cursor::new(buf);
            let mut floats : Vec<f32> = Vec::new();
            while let Ok(val) = cur.read_f32::<LittleEndian>() {
              floats.push(val);
            }
            post_process_queue.extend(floats);
          }
        },
        Err(e) => {
          fail_count += 1;
          println!("recv err: {:?}", e);
        },
      }

      if fail_count > 5 {
        fail_count = 0;
        reconnect = true;
      }
    }
  });

  event_loop.run(move |id, result| {
    let data = match result {
      Ok(data) => data,
      Err(err) => {
        eprintln!("An error occurred on stream {:?}: {}", id, err);
        return;
      }
    };

    match data {
      cpal::StreamData::Input { buffer: cpal::UnknownTypeInputBuffer::F32(buffer) } => {
        //assert_eq!(id, input_stream_id);
        let mut output_fell_behind = false;
        for &sample in buffer.iter() {
          audio_queue.push_back(sample);
        }
      },
      cpal::StreamData::Output { buffer: cpal::UnknownTypeOutputBuffer::F32(mut buffer) } => {
        //println!("Audio out buffer len: {}", post_process_queue_2.len());
        let request_size = buffer.len();
        let mut drained = post_process_queue_2.drain_size((request_size));
        match drained {
          None => {
            for sample in buffer.iter_mut() {
              *sample = 0.0;
            }
          },
          Some(mut drained) => {
            for (i, sample) in buffer.iter_mut().enumerate() {
              *sample = drained.get(i).copied().unwrap();
              /*let val = drained.pop();
              *sample = match val {
                None => {
                  println!("Couldn't drain at index: {}", i);
                  0.0
                },
                Some(d) => d * 0.3,
              };*/
            }
          },
        }
      },
      _ => panic!("We're expecting f32 data."),
    }
  })
}
