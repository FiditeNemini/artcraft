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
use zeromq::calculate_point_cloud::calculate_point_cloud;
use zeromq::color::Color;
use zeromq::point::Point;
use zeromq::xy_table::create_xy_table;
use zmq::{Error, Socket, Context, DONTWAIT};
use cgmath::num_traits::Float;

const SOCKET_ADDRESS : &'static str = "tcp://127.0.0.1:8888";

const DATA_LENGTH_COMMAND : u32 = 1; // Denotes the command that sends the data length
const POINT_DATA_BEGIN_PAYLOAD_COMMAND : u32 = 2; // Denotes the command that sends the variable-length data
const POINT_DATA_CONTINUE_PAYLOAD_COMMAND : u32 = 3; // Denotes the command that sends the variable-length data

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

  let mut reconnect = false;
  let mut fail_count = 0;
  let mut messaging_state = MessagingState::Sending_DataLength;
  let mut color = Color::Blue;

  let mut points = get_point_cloud(&device, &xy_table)?;
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
        if packet_number > 20 {
          //println!("Packet elapsed");
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
        println!("Grabbing another frame...");
        points = get_point_cloud(&device, &xy_table)?;

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

fn get_point_cloud(device: &Device, xy_table: &Image) -> AnyhowResult<Vec<Point>> {
  let capture = device.get_capture(500)?;

  let depth_image = capture.get_depth_image()
      .ok_or(anyhow!("capture not present"))?;

  let mut points = calculate_point_cloud2(&depth_image, &xy_table)?;

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
  let SEND_POINTS = 3000;
  let point_bytes = Point::size_bytes() * SEND_POINTS;

  let mut buf = Vec::with_capacity(4 + point_bytes);

  if is_beginning {
    buf.write_u32::<LittleEndian>(POINT_DATA_BEGIN_PAYLOAD_COMMAND); // COMMAND #
  } else {
    buf.write_u32::<LittleEndian>(POINT_DATA_CONTINUE_PAYLOAD_COMMAND); // COMMAND #
  }

  let subset = if points.len() > SEND_POINTS {
    points.drain(0..SEND_POINTS).collect::<Vec<Point>>()
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

fn print_pointcloud_maxima(points: &Vec<Point>) {
  let mut max_x = f32::min_value();
  let mut min_x = f32::max_value();
  let mut max_y = f32::min_value();
  let mut min_y = f32::max_value();
  let mut max_z = f32::min_value();
  let mut min_z = f32::max_value();

  for pt in points.iter() {
    if pt.x < min_x {
      min_x = pt.x;
    }
    if pt.x > max_x {
      max_x = pt.x;
    }
    if pt.y < min_y {
      min_y = pt.y;
    }
    if pt.y > max_y {
      max_y = pt.y;
    }
    if pt.z < min_z {
      min_z = pt.z;
    }
    if pt.z > max_z {
      max_z = pt.z;
    }
  }

  // minmax x : -2612.5303, 4902.1655 | y: -3491.938, 1000.92487 | z: 163, 5494
  // minmax x : -2615.739, 4918.527 | y: -3507.2483, 1007.1275 | z: 163, 5518
  println!("minmax x : {}, {} | y: {}, {} | z: {}, {}", min_x, max_x, min_y, max_y, min_z, max_z);
}



/*
    let color = get_color();
    let point = Point::at_random_range(-1000.0f32, 1000.0f32, color);
    let bytes = point.to_bytes();
    //println!("Point : {}", point.debug_string());

    if reconnect {
      socket = reconnect_socket(&context, socket, SOCKET_ADDRESS);
      reconnect = false;
      messaging_state = MessagingState::Sending;
    }

    match messaging_state {
      MessagingState::Sending => {
        //println!("Sending request...");
        //let result = socket.send("hello world!", 0);
        let result = socket.send(&bytes, 0);

        match result {
          Ok(_) => {
            //println!("Sent!");
            //thread::sleep(Duration::from_millis(250));
            messaging_state = MessagingState::Receiving;
          },
          Err(e) => {
            //eprintln!("Send Error ({}): {:?}", e.to_raw(), e);
            //thread::sleep(Duration::from_millis(250));
            fail_count += 1;
          },
        }

      },
      MessagingState::Receiving => {
        //println!("Awaiting response...");
        let result = socket.recv_bytes(DONTWAIT);

        match result {
          Ok(_) => {
            //println!("Response received!");
            messaging_state = MessagingState::Sending;
          },
          Err(e) => {
            //eprintln!("Recv Error ({}): {:?}", e.to_raw(), e);
            //thread::sleep(Duration::from_millis(250));
            fail_count += 1;
          },
        }

      },
    }

    if fail_count > 5 {
      reconnect = true;
      fail_count = 0;
      //thread::sleep(Duration::from_millis(2000));
    }
*/

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

fn get_color() -> Color {
  let start = SystemTime::now();
  let timestamp = start
      .duration_since(UNIX_EPOCH)
      .expect("Time should work.");

  let seconds = timestamp.as_secs();

  match seconds % 10 {
    0 | 1 => Color::Black,
    2 | 3 => Color::Blue,
    4 | 5 => Color::Red,
    6 | 7 => Color::Green,
    8 | 9 => Color::White,
    _ => Color::White,
  }
}