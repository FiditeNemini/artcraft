//! Generate random points to send over ZeroMQ to a consumer

mod zeromq;

use anyhow::Result as AnyhowResult;
use anyhow::anyhow;
use byteorder::{WriteBytesExt, LittleEndian, BigEndian};
use k4a_sys_temp as k4a_sys;
use kinect::{Device, DeviceConfiguration, Image};
use std::io::Write;
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use zeromq::calculate_point_cloud::PointCloudResult;
use zeromq::calculate_point_cloud::calculate_point_cloud2;
use zeromq::color::Color;
use zeromq::color::get_time_based_color;
use zeromq::point::Point;
use zeromq::xy_table::create_xy_table;
use zmq::{Error, Socket, Context, DONTWAIT};

const SOCKET_ADDRESS : &'static str = "tcp://127.0.0.1:8888";

const DATA_LENGTH_COMMAND : u32 = 1; // Denotes the command that sends the data length
const POINT_DATA_BEGIN_PAYLOAD_COMMAND : u32 = 2; // Denotes the command that sends the variable-length data
const POINT_DATA_CONTINUE_PAYLOAD_COMMAND : u32 = 3; // Denotes the command that sends the variable-length data

/// The maximum number of points to send per ZeroMQ "packet".
/// This is also defined in C++, so it needs to be adjusted in multiple places.
const MAX_SEND_POINTS_PER_PACKET : usize = 3000;

enum MessagingState {
  Sending_DataLength,
  //Receiving_DataLengthAck,
  Sending_PointDataBegin,
  //Receiving_PointDataAck,
  Sending_PointDataContinue,
  GrabPointCloud,
}

fn main() -> AnyhowResult<()> {
  let device = Device::open(0)?;

  let mut config = DeviceConfiguration::init_disable_all();
  config.0.depth_mode = k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_WFOV_2X2BINNED;
  config.0.camera_fps = k4a_sys::k4a_fps_t_K4A_FRAMES_PER_SECOND_30;

  let calibration = device.get_calibration(config.0.depth_mode, config.0.color_resolution)?;

  let xy_table = create_xy_table(&calibration)?;

  device.start_cameras(&config)?;

  // ===============================================================

  let context = zmq::Context::new();

  let mut socket = context.socket(zmq::PUSH).unwrap();
  //let mut socket = context.socket(zmq::REQ).unwrap();

  //socket.bind(SOCKET_ADDRESS).unwrap();
  socket.connect(SOCKET_ADDRESS).unwrap();

  let mut messaging_state = MessagingState::Sending_DataLength;
  let mut color = get_time_based_color();

  let mut points = get_point_cloud(&device, &xy_table, color)?;

  if !points.is_empty() {
    //print_pointcloud_maxima(&points);
  } else {
    println!("> No points?");
  }

  let mut packet_number = 0;

  loop {
    match messaging_state {
      MessagingState::Sending_DataLength => {
        //println!("Sending DATA LENGTH: {}", points.len());
        //let message = encode_data_length(&points);
        //send_message(&socket, &message)?;
        messaging_state = MessagingState::Sending_PointDataBegin;
      },
      MessagingState::Sending_PointDataBegin => {
        //println!("Begin Sending PCD (points: {})", points.len());
        let message = encode_point_data(&mut points, true);
        send_message(&socket, &message)?;

        if points.is_empty() {
          messaging_state = MessagingState::GrabPointCloud;
        } else {
          messaging_state = MessagingState::Sending_PointDataContinue;
        }

      },
      MessagingState::Sending_PointDataContinue => {
        // NB: Unfortunately the C++ program has difficulty with all points.
        if packet_number > 2000000 {
          println!("Packet elapsed");
          packet_number = 0;
          messaging_state = MessagingState::GrabPointCloud;
          continue;
        }

        //println!("Continue Sending PCD (points: {})", points.len());
        let message = encode_point_data(&mut points, false);
        send_message(&socket, &message)?;

        if points.is_empty() {
          messaging_state = MessagingState::GrabPointCloud;
        } else {
          messaging_state = MessagingState::Sending_PointDataContinue;
        }

        packet_number += 1;
      },
      MessagingState::GrabPointCloud => {
        //println!("Grabbing another frame...");
        color = get_time_based_color();
        points = get_point_cloud(&device, &xy_table, color)?;

        if !points.is_empty() {
          //print_pointcloud_maxima(&points);
        } else {
          println!("No points?");
        }
        messaging_state = MessagingState::Sending_DataLength;
        continue;
      },
    }
  }

  Ok(())
}

fn get_point_cloud(device: &Device, xy_table: &Image, color: Color) -> AnyhowResult<Vec<Point>> {
  let capture = device.get_capture(500)?;

  let depth_image = capture.get_depth_image()
      .ok_or(anyhow!("capture not present"))?;

  let mut points =
      calculate_point_cloud2(&depth_image, &xy_table, color)?;

  //println!("Points: {}", points.len());

  Ok(points)
}

/// Returns the fixed size data length command.
fn encode_data_length(points: &Vec<Point>) -> Vec<u8> {
  let mut buf = Vec::with_capacity(8);
  buf.write_u32::<LittleEndian>(DATA_LENGTH_COMMAND);
  buf.write_u32::<LittleEndian>(points.len() as u32);
  buf
}

/// Returns a variable length point data payload.
fn encode_point_data(points: &mut Vec<Point>, is_beginning: bool) -> Vec<u8> {
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
fn send_message(socket: &Socket, data_bytes: &Vec<u8>) -> AnyhowResult<()> {
  socket.send(&data_bytes, 0)?;
  Ok(())
}

/// Receive ack from server
fn receive_ack(socket: &Socket) -> AnyhowResult<()> {
  let _result = socket.recv_bytes(DONTWAIT)?;
  Ok(())
}

fn reconnect_socket(context: &Context, socket: Socket, address: &str) -> Socket {
  //println!("[reconnect] Creating new socket...");

  let mut socket = match context.socket(zmq::REQ) {
    Ok(s) => {
      //println!("New socket created.");
      s
    },
    Err(e) => {
      //println!("Error creating new socket: {:?}", e);
      return socket;
    },
  };

  //println!("Connecting new socket...");
  match socket.connect(address) {
    Ok(_) => {
      //println!("New socket connected.");
    },
    Err(err) => {
      //println!("Error connecting new socket: {:?}", err);
    },
  }

  return socket;
}
