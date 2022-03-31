use crate::zeromq::point::Point;
use byteorder::{WriteBytesExt, LittleEndian};
use std::io::Write;

/*


/// Denotes the command that sends the variable-length data
const POINT_DATA_BEGIN_PAYLOAD_COMMAND : u32 = 2;

/// Denotes the command that sends the variable-length data
const POINT_DATA_CONTINUE_PAYLOAD_COMMAND : u32 = 3;

/// The maximum number of points to send per ZeroMQ "packet".
/// This is also defined in C++, so it needs to be adjusted in multiple places.
const MAX_SEND_POINTS_PER_PACKET : usize = 3000;

/// Streaming points
struct StreamingPointsPacket {
  is_first_point_packet: bool,
  points: Vec<Point>,
}

impl StreamingPointsPacket {
  fn from_all_points(points: Vec<Point>) -> Self {
    Self {
      is_first_point_packet: true,
      points,
    }
  }

  /// Over the wire, this looks like:
  ///
  ///   | command       | 4 bytes (u32)  |
  ///   | point_count   | 4 bytes (u32)  |
  ///   | points[] ...  | [16 bytes] ... |
  ///
  fn encode(&self) -> Vec<u8> {
    let point_bytes = Point::size_bytes() * MAX_SEND_POINTS_PER_PACKET;

    let mut buf = Vec::with_capacity(4 + point_bytes);

    if self.is_first_point_packet {
      buf.write_u32::<LittleEndian>(POINT_DATA_BEGIN_PAYLOAD_COMMAND); // COMMAND #
    } else {
      buf.write_u32::<LittleEndian>(POINT_DATA_CONTINUE_PAYLOAD_COMMAND); // COMMAND #
    }

    //let subset = if points.len() > MAX_SEND_POINTS_PER_PACKET {
    //  points.drain(0..MAX_SEND_POINTS_PER_PACKET).collect::<Vec<Point>>()
    //} else {
    //  points.drain(0..points.len()).collect::<Vec<Point>>()
    //};

    buf.write_u32::<LittleEndian>(self.points.len() as u32); // LENGTH

    for point in self.points.iter() {
      let bytes = point.to_bytes();
      buf.write_all(&bytes);
    }

    buf
  }
}


*/
