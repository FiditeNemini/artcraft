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

  let context = system.display.get_context();

  enable_opengl_debugging();

  let mut last_texture_id = 0;
  let mut last_array_buffer_id = 0;
  let mut last_element_array_buffer_id = 0;
  let mut last_pixel_unpack_buffer_id = 0;
  let mut last_renderbuffer_binding = 0;
  let mut last_vertex_array_binding = 0;
  let mut last_draw_framebuffer_binding = 0;
  let mut last_read_framebuffer_binding = 0;
  let mut last_current_program = 0;
  let mut last_active_texture = 0;
  unsafe {
    gl::GetIntegerv(gl::TEXTURE_BINDING_2D, &mut last_texture_id);
    gl::GetIntegerv(gl::ARRAY_BUFFER_BINDING, &mut last_array_buffer_id);
    gl::GetIntegerv(gl::ELEMENT_ARRAY_BUFFER_BINDING, &mut last_element_array_buffer_id);
    gl::GetIntegerv(gl::PIXEL_UNPACK_BUFFER_BINDING, &mut last_pixel_unpack_buffer_id);
    gl::GetIntegerv(gl::RENDERBUFFER_BINDING, &mut last_renderbuffer_binding);
    gl::GetIntegerv(gl::VERTEX_ARRAY_BINDING, &mut last_vertex_array_binding);
    gl::GetIntegerv(gl::DRAW_FRAMEBUFFER_BINDING, &mut last_draw_framebuffer_binding);
    gl::GetIntegerv(gl::READ_FRAMEBUFFER_BINDING, &mut last_read_framebuffer_binding);
    gl::GetIntegerv(gl::CURRENT_PROGRAM, &mut last_current_program);
    gl::GetIntegerv(gl::ACTIVE_TEXTURE, &mut last_active_texture);
  }

  let mut visualizer = PointCloudVisualizer::new(
    true,
    calibration_data
  );

  unsafe {
    gl::BindTexture(gl::TEXTURE_2D, last_texture_id as u32);
    gl::BindBuffer(gl::ARRAY_BUFFER, last_array_buffer_id as u32);
    gl::BindBuffer(gl::ELEMENT_ARRAY_BUFFER, last_element_array_buffer_id as u32);
    gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, last_pixel_unpack_buffer_id as u32);
    gl::BindRenderbuffer(gl::RENDERBUFFER, last_renderbuffer_binding as u32);
    gl::BindVertexArray(last_vertex_array_binding as u32);
    gl::BindFramebuffer(gl::DRAW_FRAMEBUFFER, last_draw_framebuffer_binding as u32);
    gl::BindFramebuffer(gl::READ_FRAMEBUFFER, last_read_framebuffer_binding as u32);
    gl::UseProgram(last_current_program as u32);
    gl::ActiveTexture(last_active_texture as u32);
  }

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

      let mut last_texture_id = 0;
      let mut last_array_buffer_id = 0;
      let mut last_element_array_buffer_id = 0;
      let mut last_pixel_unpack_buffer_id = 0;
      let mut last_renderbuffer_binding = 0;
      let mut last_vertex_array_binding = 0;
      let mut last_draw_framebuffer_binding = 0;
      let mut last_read_framebuffer_binding = 0;
      let mut last_current_program = 0;
      let mut last_active_texture = 0;
      let mut last_depth_test = 0;
      unsafe {
        gl::GetIntegerv(gl::TEXTURE_BINDING_2D, &mut last_texture_id);
        gl::GetIntegerv(gl::ARRAY_BUFFER_BINDING, &mut last_array_buffer_id);
        gl::GetIntegerv(gl::ELEMENT_ARRAY_BUFFER_BINDING, &mut last_element_array_buffer_id);
        gl::GetIntegerv(gl::PIXEL_UNPACK_BUFFER_BINDING, &mut last_pixel_unpack_buffer_id);
        gl::GetIntegerv(gl::RENDERBUFFER_BINDING, &mut last_renderbuffer_binding);
        gl::GetIntegerv(gl::VERTEX_ARRAY_BINDING, &mut last_vertex_array_binding);
        gl::GetIntegerv(gl::DRAW_FRAMEBUFFER_BINDING, &mut last_draw_framebuffer_binding);
        gl::GetIntegerv(gl::READ_FRAMEBUFFER_BINDING, &mut last_read_framebuffer_binding);
        gl::GetIntegerv(gl::CURRENT_PROGRAM, &mut last_current_program);
        gl::GetIntegerv(gl::ACTIVE_TEXTURE, &mut last_active_texture);
        gl::GetBooleanv(gl::DEPTH_TEST, &mut last_depth_test);
      }

      visualizer.update_texture(&texture, capture)
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
          });

      unsafe {
        gl::BindTexture(gl::TEXTURE_2D, last_texture_id as u32);
        gl::BindBuffer(gl::ARRAY_BUFFER, last_array_buffer_id as u32);
        gl::BindBuffer(gl::ELEMENT_ARRAY_BUFFER, last_element_array_buffer_id as u32);
        gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, last_pixel_unpack_buffer_id as u32);
        gl::BindRenderbuffer(gl::RENDERBUFFER, last_renderbuffer_binding as u32);
        gl::BindVertexArray(last_vertex_array_binding as u32);
        gl::BindFramebuffer(gl::DRAW_FRAMEBUFFER, last_draw_framebuffer_binding as u32);
        gl::BindFramebuffer(gl::READ_FRAMEBUFFER, last_read_framebuffer_binding as u32);
        gl::UseProgram(last_current_program as u32);
        gl::ActiveTexture(last_active_texture as u32);
        if last_depth_test == 0 {
          gl::Disable(gl::DEPTH_TEST);
        } else {
          gl::Enable(gl::DEPTH_TEST);
        }
      }

      //println!("swapping buffers");
      //gl_window.swap_buffers().unwrap();
    }
  });
}