use byteorder::{LittleEndian, WriteBytesExt};
use crate::AnyhowResult;
use crate::pointcloud::point::Point;
use std::io::Write;
use zmq::Socket;

/// These are also defined in the Unreal Engine CloudCamPlugin.
const DATA_LENGTH_COMMAND : u32 = 1; // Denotes the command that sends the data length
const POINT_DATA_BEGIN_PAYLOAD_COMMAND : u32 = 2; // Denotes the command that sends the variable-length data
const POINT_DATA_CONTINUE_PAYLOAD_COMMAND : u32 = 3; // Denotes the command that sends the variable-length data

/// The maximum number of points to send per ZeroMQ "packet".
/// This is also defined in C++, so it needs to be adjusted in multiple places.
const MAX_SEND_POINTS_PER_PACKET : usize = 3000;

/// Returns the fixed size data length command.
pub fn encode_data_length(points: &Vec<Point>) -> Vec<u8> {
  let mut buf = Vec::with_capacity(8);
  buf.write_u32::<LittleEndian>(DATA_LENGTH_COMMAND);
  buf.write_u32::<LittleEndian>(points.len() as u32);
  buf
}

/// Returns a variable length point data payload.
pub fn encode_point_data(points: &mut Vec<Point>, is_beginning: bool) -> Vec<u8> {
  let point_bytes = Point::size_bytes() * MAX_SEND_POINTS_PER_PACKET;

  let mut buf = Vec::with_capacity(4 + point_bytes);

  if is_beginning {
    //println!("begin");
    buf.write_u32::<LittleEndian>(POINT_DATA_BEGIN_PAYLOAD_COMMAND); // COMMAND #
  } else {
    //println!("continue");
    buf.write_u32::<LittleEndian>(POINT_DATA_CONTINUE_PAYLOAD_COMMAND); // COMMAND #
  }

  let subset = if points.len() > MAX_SEND_POINTS_PER_PACKET {
    points.drain(0..MAX_SEND_POINTS_PER_PACKET).collect::<Vec<Point>>()
  } else {
    points.drain(0..points.len()).collect::<Vec<Point>>()
  };

  buf.write_u32::<LittleEndian>(subset.len() as u32); // LENGTH

  for point in subset {
    let bytes = point.to_bytes();
    buf.write_all(&bytes);
  }

  buf
}

/// Send data over the socket
pub fn send_message(socket: &Socket, data_bytes: &Vec<u8>) -> AnyhowResult<()> {
  socket.send(&data_bytes, 0)?;
  Ok(())
}
