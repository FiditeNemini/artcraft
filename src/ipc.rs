use zmq;
use zmq::{Error, Socket};
use std::collections::VecDeque;
use std::sync::{RwLock, PoisonError};

pub struct AudioQueue {
  queue: RwLock<VecDeque<f32>>,
}

impl AudioQueue {
  pub fn new() -> Self {
    Self {
      queue: RwLock::new(VecDeque::new()),
    }
  }

  pub fn push_back(&self, val: f32) {
    match self.queue.write() {
      Ok(mut queue) => {
        queue.push_back(val);
      },
      Err(_) => {
        unreachable!("This shouldn't happen (push_back)");
      },
    }
  }

  pub fn extend(&self, buf: Vec<f32>) {
    match self.queue.write() {
      Ok(mut queue) => {
        queue.extend(buf);
      },
      Err(_) => {
        unreachable!("This shouldn't happen (extend)");
      },
    }
  }

  pub fn drain(&self) -> Vec<f32> {
    match self.queue.write() {
      Ok(mut queue) => {
        return queue.drain(..)
            .collect::<Vec<_>>();
      },
      Err(_) => {
        unreachable!("This shouldn't happen (drain)");
      },
    }
  }

  pub fn drain_size(&self, size: usize) -> Option<Vec<f32>> {
    match self.queue.write() {
      Ok(mut queue) => {
        if queue.len() < size {
          return None;
        }
        let vec = queue.drain(0..size)
            .collect::<Vec<_>>();

        return Some(vec);
      },
      Err(_) => {
        unreachable!("This shouldn't happen (drain_size)");
      },
    }
  }

  pub fn len(&self) -> usize {
    match self.queue.read() {
      Ok(mut queue) => {
        return queue.len();
      },
      Err(_) => {
        unreachable!("This shouldn't happen (len)");
      },
    }
  }

}

pub struct QueueSender {
  context: zmq::Context,
  socket: Option<zmq::Socket>,
  queue: RwLock<VecDeque<i16>>,
}

impl QueueSender {
  pub fn new() -> Self {
    Self {
      context: zmq::Context::new(),
      socket: None,
      queue: RwLock::new(VecDeque::new()),
    }
  }

  /*pub fn push_back(&self, val: i16) {
    match self.queue.write() {
      Ok(mut queue) => {
        queue.push_back(val);
      },
      Err(_) => {
        unreachable!("This shouldn't happen (push_back)");
      },
    }
  }*/

  /*pub fn drain(&self) -> Vec<i16> {
    match self.queue.write() {
      Ok(mut queue) => {
        return queue.drain(..)
            .collect::<Vec<_>>();
      },
      Err(_) => {
        unreachable!("This shouldn't happen (drain)");
      },
    }
  }*/

  /// Connect to ZeroMQ server.
  pub fn connect(&mut self) -> bool {
    let mut socket = match self.context.socket(zmq::REQ) {
      Err(_) => {
        return false;
      },
      Ok(s) => s,
    };

    match socket.connect("tcp://127.0.0.1:5555") {
      Err(_) => {
        println!("X");
        return false;
      },
      Ok(_) => {
        println!("Y");
        self.socket = Some(socket);
        return true;
      },
    }
  }

  /// Send data to socket
  pub fn send<T>(&mut self, data: T) -> bool
  where T: zmq::Sendable
  {
    let mut socket = match &mut self.socket {
      None => {
        println!("A");
        return false;
      },
      Some(s) => s,
    };
    match socket.send(data, 0) {
      Err(_) => {
        println!("B");
        return false;
      },
      Ok(_) => {
        return true;
      },
    }
  }

  /*
    Python downsampled data,
    Downsampled.shape: (31208,)
    Downsampled.max: 0.2798332135682282
    Downsampled.min: -0.26734864508137157
    Downsampled.mean: 0.00024197357508030375
  */
  pub fn enqueue(&mut self, val: i16) -> bool {
    let bytes = val.to_be_bytes();
    self.send(&bytes[..])
  }
}
