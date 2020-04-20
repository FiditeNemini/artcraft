use imgui::*;

use gl::types::*;
use gl;
use gl_debug::enable_opengl_debugging;
use glium::Display;
use glium::backend::Facade;
use glutin::ContextBuilder;
use glutin::event::{Event, WindowEvent};
use glutin::event_loop::{ControlFlow, EventLoop};
use glutin::window::WindowBuilder;
use opengl_wrapper::{Texture, Buffer};
use point_cloud::point_cloud_visualiser::{PointCloudVisualizer, PointCloudVisualizerError};
use point_cloud::viewer_image::{ViewerImage, ImageDimensions};
use sensor_control::CaptureProvider;
use std::sync::Arc;
use support;

pub fn run(capture_provider: Arc<CaptureProvider>, calibration_data: k4a_sys::k4a_calibration_t) {
  let system = support::init(file!());

  /*let mut visualizer = PointCloudVisualizer::new(
    true,
    calibration_data
  );*/

  let context = system.display.get_context();

  enable_opengl_debugging();

  let mut texture = ViewerImage::create(
    800,
    800,
    None,
    None
  ).expect("ViewerImage texture creation should work");

  system.main_loop(move |_, ui| {
    Window::new(im_str!("Hello world"))
        //.size([300.0, 110.0], Condition::FirstUseEver)
        .size([300.0, 110.0], Condition::Always)
        .build(ui, || {
          ui.text(im_str!("Hello world!"));
          ui.text(im_str!("こんにちは世界！"));
          ui.text(im_str!("This...is...imgui-rs!"));
          ui.separator();
          let mouse_pos = ui.io().mouse_pos;
          ui.text(format!(
            "Mouse Position: ({:.1},{:.1})",
            mouse_pos[0], mouse_pos[1]
          ));
        });


    // TODO: This belongs in a worker thread with buffers on both producer and consumer.
    if let Some(capture) = capture_provider.get_capture() {
      //println!("\n\n------- event loop: got capture ------");
      //println!("capture: {:?}", capture.0);
      unsafe {
        // TODO: CLEARING FOR TEMPORARY DEBUGGING.
        //gl::ClearColor(0.8, 0.0, 0.0, 1.0);
        //gl::Clear(gl::COLOR_BUFFER_BIT);
      }

      /*visualizer.update_texture(&texture, capture)
          .map(|_| {
            println!("UPDATED TEXTURE!");
          })
          .map_err(|err| {
            match err {
              PointCloudVisualizerError::MissingDepthImage => { println!("Missing depth image"); },
              PointCloudVisualizerError::MissingColorImage => { println!("Missing color image"); },
              _ => {
                unreachable!("Error: {:?}", err);
              }
            }
          });*/

      //println!("swapping buffers");
      //gl_window.swap_buffers().unwrap();
    }
  });
}