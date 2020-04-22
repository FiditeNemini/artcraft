use imgui::*;
use imgui::Image;

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
use std::path::Path;
use std::ffi::c_void;

fn load_texture(filename: &str) -> GLuint {
  let mut texture_id = 0;

  unsafe {
    gl::GenTextures(1, &mut texture_id);
    gl::BindTexture(gl::TEXTURE_2D, texture_id);

    // Set up filtering params and other texture attributes
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::LINEAR as i32);
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::LINEAR as i32);
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_S, gl::REPEAT as i32);
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_T, gl::REPEAT as i32);
  }

  let img = image::open(&Path::new(filename))
      .expect("failed to load")
      .to_rgba();

  let width = img.dimensions().0 as i32;
  let height = img.dimensions().1 as i32;
  let data = img.into_raw();

  println!("Loaded image: {}x{}", width, height);

  unsafe {
    gl::PixelStorei(gl::UNPACK_ROW_LENGTH, 0);
    gl::TexImage2D(
      gl::TEXTURE_2D,
      0,
      gl::RGBA as i32,
      //format as i32,
      width,
      height,
      0,
      gl::RGBA,
      //format,
      gl::UNSIGNED_BYTE,
      &data[0] as *const u8 as *const c_void,
    );

    //gl::BindTexture(gl::TEXTURE_2D, 0);
  }

  println!("Returning texture id: {}", texture_id);
  return texture_id;
}

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

  let gl_texture_id = load_texture("n64logo.png");
  let imgui_texture_id = TextureId::from(gl_texture_id as usize);

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

  let mut written = false;
  //let mut loaded_texture = None;

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
          ui.separator();

          /*// TODO: this segfaults.
          //  https://github.com/ocornut/imgui/wiki/Image-Loading-and-Displaying-Examples
          if written {
            let texture_id = texture.texture_id() as usize;
            let my_texture_id = TextureId::from(texture_id);
            Image::new(my_texture_id, [100.0, 100.0]).build(ui);
          }*/

          /*match loaded_texture {
            None => {
              loaded_texture = Some(load_texture("n64logo.png"));
            },
            Some(texture_id) => {
              let texture_id = texture_id as usize;
              let my_texture_id = TextureId::from(texture_id);
              Image::new(my_texture_id, [100.0, 100.0]).build(ui);
            }
          }*/

          // TODO: This also segfaults.
          //Image::new(imgui_texture_id, [100.0, 100.0]).build(ui);
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

      written = true;
      //println!("swapping buffers");
      //gl_window.swap_buffers().unwrap();
    }
  });
}