use zmq;
use zmq::{Error, Socket};

pub struct QueueSender {
  context: zmq::Context,
  socket: Option<zmq::Socket>,
}

impl QueueSender {
  pub fn new() -> Self {
    Self {
      context: zmq::Context::new(),
      socket: None,
    }
  }

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
        return false;
      },
      Ok(_) => {
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
        return false;
      },
      Some(s) => s,
    };
    match socket.send(data, 0) {
      Err(_) => {
        return false;
      },
      Ok(_) => {
        return true;
      },
    }
  }
}
