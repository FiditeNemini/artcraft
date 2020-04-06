#![allow(warnings)]

#[macro_use] extern crate enum_primitive;
extern crate genmesh;
#[macro_use] extern crate glium;
extern crate image;
extern crate k4a_sys;
extern crate libc;
extern crate obj;
extern crate opencv;

use std::borrow::BorrowMut;
use std::ffi::{c_void, CStr, CString};
use std::io::Cursor;
use std::os::raw::c_char;
use std::ptr;
use std::slice;
use std::sync::{Arc, PoisonError, RwLockReadGuard};
use std::sync::RwLock;
use std::thread;
use std::time::Duration;
use std::sync::Mutex;

use glium::{Display, glutin, Surface};
use glium::glutin::event::{Event, StartCause};
use glium::glutin::event_loop::{ControlFlow, EventLoop};
use glium::Texture2d;
use glium::vertex::VertexBufferAny;
use image::{DynamicImage, ImageFormat};
use image::flat::{FlatSamples, SampleLayout};
use image::GenericImage;
use image::ImageBuffer;
use image::ImageError;
use image::Rgb;
use image::Rgba;
use image::RgbaImage;
use image::RgbImage;
use libc::size_t;
use opencv::core;
use opencv::highgui;
use opencv::imgproc;
use opencv::prelude::*;

use handwritten_wrapper::*;
use k4a_sys_wrapper::Device;
use k4a_sys_wrapper::device_get_installed_count;
use k4a_sys_wrapper::Image;
use sensors::{capture_thread, grab_single_frame};
use glium::texture::RawImage2d;
use conversion::TextureData2d;

pub mod conversion;
pub mod handwritten_wrapper;
pub mod handwritten_wrapper_test;
pub mod k4a_sys_wrapper;
pub mod sensors;

pub struct TextureContainer {
  pub texture: Texture2d
}

pub fn main() {
  let frame : Arc<Mutex<Option<TextureData2d>>> = Arc::new(Mutex::new(None));
  let frame2 = frame.clone();

  thread::spawn(move || {
    capture_thread(frame2);
  });

  let event_loop = glutin::event_loop::EventLoop::new();
  let wb = glutin::window::WindowBuilder::new();
  let cb = glutin::ContextBuilder::new();
  let display = glium::Display::new(wb, cb, &event_loop).unwrap();

  let imageA = image::load(Cursor::new(&include_bytes!("../sneslogo.png")[..]),
    image::ImageFormat::Png).unwrap().to_rgba();

  let imageB = image::load(Cursor::new(&include_bytes!("../n64logo.png")[..]),
    image::ImageFormat::Png).unwrap().to_rgba();

  let imageA_dimensions = imageA.dimensions();
  let imageB_dimensions = imageB.dimensions();

  let imageA = glium::texture::RawImage2d::from_raw_rgba_reversed(&imageA.into_raw(), imageA_dimensions);
  let textureA = glium::texture::Texture2d::new(&display, imageA).unwrap();

  let imageB = glium::texture::RawImage2d::from_raw_rgba_reversed(&imageB.into_raw(), imageB_dimensions);
  let textureB = glium::texture::Texture2d::new(&display, imageB).unwrap();

  /*let frame_dimensions = frame_image.dimensions();
  let frame_image = glium::texture::RawImage2d::from_raw_rgba_reversed(&frame_image.into_raw(), frame_dimensions);
  let textureFrame = glium::texture::Texture2d::new(&display, frame_image).unwrap();*/

  #[derive(Copy, Clone)]
  struct Vertex {
    position: [f32; 2],
    tex_coords: [f32; 2],
  }

  implement_vertex!(Vertex, position, tex_coords);

  let vertex1 = Vertex { position: [-0.9, -0.5], tex_coords: [0.0, 0.0] };
  let vertex2 = Vertex { position: [ 0.0,  0.7], tex_coords: [0.0, 1.0] };
  let vertex3 = Vertex { position: [ 0.5, -0.25], tex_coords: [1.0, 1.0] };
  let vertex4 = Vertex { position: [ 0.75, -0.50], tex_coords: [1.0, 0.0] };
  let shape = vec![vertex1, vertex2, vertex3, vertex4];

  let vertex_buffer = glium::VertexBuffer::new(&display, &shape).unwrap();
  let indices = glium::index::NoIndices(glium::index::PrimitiveType::TrianglesList);

  let vertex_shader_src = r#"
        #version 140
        in vec2 position;
        in vec2 tex_coords;
        out vec2 v_tex_coords;
        uniform mat4 matrix;
        void main() {
            v_tex_coords = tex_coords;
            gl_Position = matrix * vec4(position, 0.0, 1.0);
        }
    "#;

  let fragment_shader_src = r#"
        #version 140
        in vec2 v_tex_coords;
        out vec4 color;
        uniform sampler2D tex;
        void main() {
            color = texture(tex, v_tex_coords);
        }
    "#;

  let program = glium::Program::from_source(&display, vertex_shader_src, fragment_shader_src, None).unwrap();

  let mut t = -0.5;
  let mut switchTexture = false;
  let mut useTexture = 0; // 0 for 'A', 1 for 'B'

  let mut texture_data_2d : Option<TextureData2d> = None;
  let mut texture_container : Option<TextureContainer> = None;

  event_loop.run(move |event, _, control_flow| {
    let next_frame_time = std::time::Instant::now() +
        std::time::Duration::from_nanos(16_666_667);
    *control_flow = glutin::event_loop::ControlFlow::WaitUntil(next_frame_time);

    match event {
      glutin::event::Event::WindowEvent { event, .. } => match event {
        glutin::event::WindowEvent::CloseRequested => {
          *control_flow = glutin::event_loop::ControlFlow::Exit;
          return;
        },
        _ => return,
      },
      glutin::event::Event::NewEvents(cause) => match cause {
        glutin::event::StartCause::ResumeTimeReached { .. } => (),
        glutin::event::StartCause::Init => (),
        _ => return,
      },
      _ => return,
    }

    // we update `t`
    t += 0.02;
    if t > 0.5 {
      t = -0.5;
      switchTexture = true;
    }

    if switchTexture {
      useTexture = match useTexture {
        0 => 1,
        _ => 0,
      };
      switchTexture = false;
    }

    let mut target = display.draw();
    target.clear_color(0.0, 0.0, 1.0, 1.0);

    match frame.lock() {
      Ok(mut lock) => {
        let tex_data_2d = lock.take();

        match tex_data_2d {
          None => {},
          Some(tex_data) => {
            let texture = glium::texture::Texture2d::new(&display, tex_data.raw_image).unwrap();

            texture_container = Some(TextureContainer{
              texture,
            })
          },
        }
      },
      Err(_) => {},
    }

    let texture_to_use: &Texture2d = texture_container
        .as_ref()
        .map(|c| &c.texture)
        .unwrap_or(&textureB);

    let uniforms = uniform! {
            matrix: [
                [1.0, 0.0, 0.0, 0.0],
                [0.0, 1.0, 0.0, 0.0],
                [0.0, 0.0, 1.0, 0.0],
                [ t , 0.0, 0.0, 1.0f32],
            ],
            tex: texture_to_use,
        };

    target.draw(&vertex_buffer, &indices, &program, &uniforms,
      &Default::default()).unwrap();
    target.finish().unwrap();
  });
}

pub fn run() {
  let installed_devices = device_get_installed_count();
  println!("Installed devices: {}", installed_devices);

  let window_name = "output";
  highgui::named_window(window_name, 1).unwrap();

  {
    let device = Device::open(0).unwrap();
    println!("Device: {:?}", device);
    let serial_number = device.get_serial_number().unwrap();
    println!("Device: {:?}", serial_number);

    println!("Starting cameras...");
    device.start_cameras().unwrap();


    loop {
      let capture = device.get_capture(1000).ok().unwrap();
      let image = capture.get_depth_image().ok().unwrap();

      let opencv_image = depth_to_opencv(&image).ok().unwrap();

      highgui::imshow(window_name, &opencv_image).unwrap();
      if highgui::wait_key(10).unwrap() > 0 {
        break;
      }
    }

    device.stop_cameras();
  }

  handwritten_wrapper_test::test_integration();
}

/// Copied from k4a-sys
pub fn color_to_opencv(mut image: Image) -> opencv::Result<Mat> {
  let with_alpha = unsafe {
    let stride = image.get_stride_bytes();
    Mat::new_rows_cols_with_data(
      image.get_height_pixels() as i32,
      image.get_width_pixels() as i32,
      core::CV_8UC4,
      &mut *(image.get_buffer() as *mut c_void),
      stride,
    )?
  };
  let mut no_alpha = Mat::default()?;
  imgproc::cvt_color(&with_alpha, &mut no_alpha, imgproc::COLOR_BGRA2BGR, 0)?;
  return Ok(no_alpha);
}

/// Copied from k4a-sys
pub fn depth_to_opencv(image: &Image) -> opencv::Result<Mat> {
  unsafe {
    let stride = image.get_stride_bytes();
    let mat = Mat::new_rows_cols_with_data(
      image.get_height_pixels() as i32,
      image.get_width_pixels() as i32,
      core::CV_16U,
      &mut *(image.get_buffer() as *mut c_void),
      stride,
    );
    mat
  }
}
