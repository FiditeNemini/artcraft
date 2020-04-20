use imgui::*;

use support;
use std::sync::Arc;
use sensor_control::CaptureProvider;
use point_cloud::point_cloud_visualiser::PointCloudVisualizer;
use glutin::event::{Event, WindowEvent};
use glutin::event_loop::{ControlFlow, EventLoop};
use glutin::window::WindowBuilder;
use glutin::ContextBuilder;

pub fn run(capture_provider: Arc<CaptureProvider>, calibration_data: k4a_sys::k4a_calibration_t) {
  /*let event_loop = EventLoop::new();
  let window = WindowBuilder::new();
  let gl_window = ContextBuilder::new()
      .build_windowed(window, &event_loop)
      .unwrap();
  // It is essential to make the context current before calling `gl::load_with`.
  let gl_window = unsafe { gl_window.make_current() }.unwrap();

  // Load the OpenGL function pointers
  gl::load_with(|symbol| gl_window.get_proc_address(symbol));*/

  let system = support::init(file!());

  // Load the OpenGL function pointers
  //gl::load_with(|symbol| gl_window.get_proc_address(symbol));

  let mut visualizer = PointCloudVisualizer::new(
    true,
    calibration_data
  );

  system.main_loop(move |_, ui| {
    println!("main loop");

    Window::new(im_str!("Hello world"))
        .size([300.0, 110.0], Condition::FirstUseEver)
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
  });
}