//! Generate random points to send over ZeroMQ to a consumer

#[allow(unused_imports)]

#[macro_use] extern crate clap;

mod pointcloud;
mod zeromq;

use anyhow::Result as AnyhowResult;
use anyhow::anyhow;
use byteorder::{WriteBytesExt, LittleEndian, BigEndian};
use clap::Clap;
use k4a_sys_temp as k4a_sys;
use kinect::{Device, DeviceConfiguration, Image};
use std::io::Write;
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use pointcloud::color::Color;
use pointcloud::cpu_calculate_point_cloud::PointCloudResult;
use pointcloud::cpu_calculate_point_cloud::calculate_point_cloud2;
use pointcloud::cpu_calculate_point_cloud::calculate_point_cloud3;
use pointcloud::cpu_transformation::DepthTransformer;
use pointcloud::point::Point;
use pointcloud::xy_table::create_xy_table;
use pointcloud::xy_table::create_xy_table_from_color_calibration;
use pointcloud::xy_table::create_xy_table_from_depth_calibration;
use zmq::{Error, Socket, Context, DONTWAIT};
use crate::zeromq::protocol::{encode_point_data, send_message};


//const SOCKET_ADDRESS : &'static str = "tcp://127.0.0.1:8888";
//const SOCKET_ADDRESS : &'static str = "tcp://192.168.50.3:8888";
//const SOCKET_ADDRESS : &'static str = "tcp://192.168.4.64:8888";
//const SOCKET_ADDRESS : &'static str = "tcp://10.154.106.143:8888";
const SOCKET_ADDRESS : &'static str = "tcp://10.154.106.144:8888";

/// The command line args for the program.
#[derive(Clap, Debug, Clone)]
pub struct CommandArgs {
  /// Number cameras
  #[clap(long, default_value = "1")]
  pub num_cameras: i32,

  /// Render axes
  #[clap(long, parse(try_from_str = true_or_false), default_value = "false")]
  pub debug: bool,

  /// Set a wide FOV in the depth camera
  #[clap(long, parse(try_from_str = true_or_false), default_value = "false")]
  pub wide: bool,

  /// Set the depth culling point
  /// A good value for my office with a NFOV camera approximately located
  /// parallel to where my desktop computer is located would be "3000"
  #[clap(long, default_value = "0")]
  pub depth_cull: i32,

  /// Cull everything to the right of this point
  /// "Right" is when the camera is inverted
  /// A value of "500" is reasonable
  #[clap(long, default_value = "0")]
  pub right_cull: i32,

  #[clap(long, default_value = "0")]
  pub left_cull: i32,

  /// X offset.
  #[clap(long, default_value = "0", allow_hyphen_values = true)]
  pub xoff: i32,

  /// Y offset.
  #[clap(long, default_value = "0", allow_hyphen_values = true)]
  pub yoff: i32,

  /// Z offset.
  #[clap(long, default_value = "0", allow_hyphen_values = true)]
  pub zoff: i32,
}

fn true_or_false(s: &str) -> Result<bool, &'static str> {
  match s {
    "true" => Ok(true),
    "false" => Ok(false),
    _ => Err("expected `true` or `false`"),
  }
}

enum MessagingState {
  Sending_PointDataBegin,
  Sending_PointDataContinue,
  GrabPointCloud,
}

fn main() -> AnyhowResult<()> {
  println!("Starting...");
  let args = CommandArgs::parse();

  println!("Command args: {:?}", args);

  println!("Opening device...");
  thread::sleep(Duration::from_millis(100));

  let device = Device::open(0)?;

  println!("Configuring device...");
  let mut config = DeviceConfiguration::init_disable_all();

  let mut camera_fps = k4a_sys::k4a_fps_t_K4A_FRAMES_PER_SECOND_30;

  let depth_mode_fov = if args.wide {
    // NB: Wide FOV lowers the possible frame rate.
    camera_fps = k4a_sys::k4a_fps_t_K4A_FRAMES_PER_SECOND_15;
    k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_WFOV_UNBINNED
  } else {
    k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_NFOV_UNBINNED
  };

  config.0.camera_fps = camera_fps;
  config.0.depth_mode = depth_mode_fov;
  config.0.color_format = k4a_sys::k4a_image_format_t_K4A_IMAGE_FORMAT_COLOR_BGRA32;

  config.0.color_resolution = k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_720P; // 1280x721
  //config.0.color_resolution = k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_1080P; // 1920x1080 (this gets truncated.)
  //config.0.color_resolution = k4a_sys::k4a_color_resolution_t_K4A_COLOR_RESOLUTION_2160P; // 4K, what the original program did

  let calibration = device.get_calibration(config.0.depth_mode, config.0.color_resolution)?;

  //let xy_table = create_xy_table_from_depth_calibration(&calibration)?;
  let xy_table = create_xy_table_from_color_calibration(&calibration)?;

  let transformer = DepthTransformer::new(&calibration);

  println!("Starting cameras with supplied config...");
  thread::sleep(Duration::from_millis(100));

  device.start_cameras(&config)?;

  // ===============================================================

  let context = zmq::Context::new();

  println!("Connecting ZeroMQ socket...");
  let mut socket = context.socket(zmq::PUSH).unwrap();
  //let mut socket = context.socket(zmq::REQ).unwrap();

  println!("Socket address: {}", SOCKET_ADDRESS);
  
  //socket.bind(SOCKET_ADDRESS).unwrap();
  socket.connect(SOCKET_ADDRESS).unwrap();

  let mut messaging_state = MessagingState::GrabPointCloud;

  let mut color = Color::get_time_based_color();

  let mut points : Vec<Point> = Vec::new();

  println!("Grabbing first frame...");
  loop {
    let maybe_points = get_point_cloud(&device, &xy_table, color, &transformer, &args);
    points = match maybe_points {
      Err(e) => {
        println!("Error: {:?}", e);
        thread::sleep(Duration::from_millis(100));
        continue;
      },
      Ok(points) => points,
    };
    break;
  };

  let mut packet_number = 0;
  let mut frame_number : u64 = 0;

  loop {
    match messaging_state {
      MessagingState::GrabPointCloud => {
        //println!("Grabbing another frame...");
        color = Color::get_time_based_color();
        points = get_point_cloud(&device, &xy_table, color, &transformer, &args)?;

        messaging_state = MessagingState::Sending_PointDataBegin;
        frame_number += 1;
        continue;
      },
      MessagingState::Sending_PointDataBegin => {
        if frame_number == 1 || frame_number % 10 == 0 {
          println!("Sending frame number: {} (points: {})", frame_number, points.len());
        }

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
    }
  }

  Ok(())
}

fn get_point_cloud(
  device: &Device,
  xy_table: &Image,
  color: Color,
  transformer: &DepthTransformer,
  command_args: &CommandArgs
) -> AnyhowResult<Vec<Point>>
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
        &color_image,
        command_args,
      )?;

  //println!("Points: {}", points.len());

  Ok(points)
}

