//! Generate random points to send over ZeroMQ to a consumer

#[allow(unused_imports)]

mod zeromq;

use anyhow::Result as AnyhowResult;
use anyhow::anyhow;
use byteorder::{WriteBytesExt, LittleEndian, BigEndian};
use k4a_sys_temp as k4a_sys;
use kinect::{Device, DeviceConfiguration, Image};
use std::io::Write;
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use zeromq::cpu_calculate_point_cloud::PointCloudResult;
use zeromq::cpu_calculate_point_cloud::calculate_point_cloud2;
use zeromq::cpu_calculate_point_cloud::calculate_point_cloud3;
use zeromq::color::Color;
use zeromq::cpu_transformation::DepthTransformer;
use zeromq::point::Point;
use zeromq::xy_table::create_xy_table;
use zeromq::xy_table::create_xy_table_from_depth_calibration;
use zeromq::xy_table::create_xy_table_from_color_calibration;
use zmq::{Error, Socket, Context, DONTWAIT};

//const SOCKET_ADDRESS : &'static str = "tcp://127.0.0.1:8888";
const SOCKET_ADDRESS : &'static str = "tcp://192.168.50.3:8888";

const DATA_LENGTH_COMMAND : u32 = 1; // Denotes the command that sends the data length
const POINT_DATA_BEGIN_PAYLOAD_COMMAND : u32 = 2; // Denotes the command that sends the variable-length data
const POINT_DATA_CONTINUE_PAYLOAD_COMMAND : u32 = 3; // Denotes the command that sends the variable-length data

/// The maximum number of points to send per ZeroMQ "packet".
/// This is also defined in C++, so it needs to be adjusted in multiple places.
const MAX_SEND_POINTS_PER_PACKET : usize = 3000;

enum MessagingState {
  Sending_PointDataBegin,
  Sending_PointDataContinue,
  GrabPointCloud,
}

fn main() -> AnyhowResult<()> {
  let device = Device::open(0)?;

  let mut config = DeviceConfiguration::init_disable_all();
  config.0.camera_fps = k4a_sys::k4a_fps_t_K4A_FRAMES_PER_SECOND_15;
  //config.0.camera_fps = k4a_sys::k4a_fps_t_K4A_FRAMES_PER_SECOND_30;

  // TODO: Pick correct binning + FOV.

  // NB: Similar to NFOV_UNBINNED, but less dense (faster).
  // Not used by any program I'm aware of.
  //config.0.depth_mode = k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_NFOV_2X2BINNED; // 320x228

  // NB: NFOV_UNBINNED was used by original Rust experiment.
  // This appears to be much denser, and is a tighter angle. Slow on CPU.
  config.0.depth_mode = k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_NFOV_UNBINNED; // looks good w/ 720P

  // NB: WFOV_2X2BINNED was used by the original 'cloudcam_zeromq'.
  // It's less dense, and wider. Much more performant. Fast on CPU.
  //config.0.depth_mode = k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_WFOV_2X2BINNED; // DISTORTED w/ 720P

  // Not used by anything, AFAICT.
  // I got this working in Rust + Color Camera
  //config.0.depth_mode = k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_WFOV_UNBINNED; // 1024x1024 (looks good w/ 720P)


  config.0.color_format = k4a_sys::k4a_image_format_t_K4A_IMAGE_FORMAT_COLOR_BGRA32;
  config.0.color_resolution = k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_720P; // 1280x721
  //config.0.color_resolution = k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_1080P; // 1920x1080 (this gets truncated.)
  //config.0.color_resolution = k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_2160P; // 4K, what the original program did

  let calibration = device.get_calibration(config.0.depth_mode, config.0.color_resolution)?;

  //let xy_table = create_xy_table_from_depth_calibration(&calibration)?;
  let xy_table = create_xy_table_from_color_calibration(&calibration)?;

  let transformer = DepthTransformer::new(&calibration);

  device.start_cameras(&config)?;

  // ===============================================================

  let context = zmq::Context::new();

  let mut socket = context.socket(zmq::PUSH).unwrap();
  //let mut socket = context.socket(zmq::REQ).unwrap();

  //socket.bind(SOCKET_ADDRESS).unwrap();
  socket.connect(SOCKET_ADDRESS).unwrap();

  let mut messaging_state = MessagingState::GrabPointCloud;

  let mut color = Color::get_time_based_color();

  let mut points : Vec<Point> = Vec::new();

  loop {
    let maybe_points = get_point_cloud(&device, &xy_table, color, &transformer);
    points = match maybe_points {
      Err(e) => {
        println!("Error: {:?}", e);
        thread::sleep(Duration::from_millis(5000));
        continue;
      },
      Ok(points) => points,
    };
    break;
  };

  if !points.is_empty() {
    //print_pointcloud_maxima(&points);
  } else {
    println!("> No points?");
  }

  let mut packet_number = 0;

  loop {
    match messaging_state {
      MessagingState::Sending_PointDataBegin => {
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
        color = Color::get_time_based_color();
        points = get_point_cloud(&device, &xy_table, color, &transformer)?;

        messaging_state = MessagingState::Sending_PointDataBegin;
        continue;
      },
    }
  }

  Ok(())
}

fn get_point_cloud(device: &Device, xy_table: &Image, color: Color, transformer: &DepthTransformer)
  -> AnyhowResult<Vec<Point>>
{
  let capture = device.get_capture(5000)?;

  let depth_image = capture.get_depth_image()
      .ok_or(anyhow!("depth image not present"))?;

  let color_image = capture.get_color_image()
      .ok_or(anyhow!("color image not present"))?;


  let depth_image2 = transformer.transform(&depth_image)?;

  let mut points =
      calculate_point_cloud3(
        &depth_image2,
        &xy_table,
        //color,
        &color_image
      )?;

  println!("Points: {}", points.len());

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
