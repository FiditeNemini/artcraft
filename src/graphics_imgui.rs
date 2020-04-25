use imgui::*;
use imgui::Image;

use gl::types::*;
use gl;
use opengl::debug::enable_opengl_debugging;
use glium::Display;
use glium::backend::Facade;
use glutin::ContextBuilder;
use glutin::event::{Event, WindowEvent};
use glutin::event_loop::{ControlFlow, EventLoop};
use glutin::window::WindowBuilder;
use opengl_wrapper::{Texture, Buffer};
use point_cloud::point_cloud_visualiser::{PointCloudVisualizer, PointCloudVisualizerError, ColorizationStrategy};
use point_cloud::viewer_image::{ViewerImage, ImageDimensions};
use sensor_control::CaptureProvider;
use std::sync::Arc;
use support;
use std::path::Path;
use std::ffi::c_void;
use std::time::Instant;
use opengl::rebinder::Rebinder;
use opengl::texture::load_texture;


pub fn run(capture_provider: Arc<CaptureProvider>, calibration_data: k4a_sys::k4a_calibration_t) {
  let sdl_context = sdl2::init().unwrap();
  let video = sdl_context.video().unwrap();

  {
    let gl_attr = video.gl_attr();
    gl_attr.set_context_profile(sdl2::video::GLProfile::Core);
    gl_attr.set_context_version(3, 0);
  }

  let window = video.window("rust-imgui-sdl2 demo", 2000, 2000)
      .position_centered()
      .resizable()
      .opengl()
      .allow_highdpi()
      .build()
      .unwrap();

  let _gl_context = window.gl_create_context().expect("Couldn't create GL context");
  gl::load_with(|s| video.gl_get_proc_address(s) as _);

  //enable_opengl_debugging();

  let mut rebinder = Rebinder::snapshot();

  let mut imgui = imgui::Context::create();
  imgui.set_ini_filename(None);

  let gl_texture_id = load_texture("n64logo.png");
  let imgui_texture_id = TextureId::from(gl_texture_id as usize);

  let mut visualizer = PointCloudVisualizer::new(
    true,
    ColorizationStrategy::Color,
    calibration_data
  );

  let mut gl_texture_id_3 = load_texture("sneslogo.png");
  let mut imgui_texture_id_3 = TextureId::from(gl_texture_id_3 as usize);
  let mut imgui_texture_id_4 = TextureId::from(visualizer.xyz_texture.id() as usize);


  //rebinder.restore();

  let mut texture = ViewerImage::create(
    800,
    800,
    None,
    None
  ).expect("ViewerImage texture creation should work");
  let imgui_texture_id_2 = TextureId::from(texture.texture_id() as usize);


  let mut imgui_sdl2 = imgui_sdl2::ImguiSdl2::new(&mut imgui, &window);

  let renderer = imgui_opengl_renderer::Renderer::new(&mut imgui, |s| video.gl_get_proc_address(s) as _);

  let mut event_pump = sdl_context.event_pump().unwrap();

  let mut last_frame = Instant::now();


  'running: loop {
    use sdl2::event::Event;
    use sdl2::keyboard::Keycode;

    let mut rebinder = Rebinder::snapshot();

    for event in event_pump.poll_iter() {
      imgui_sdl2.handle_event(&mut imgui, &event);
      if imgui_sdl2.ignore_event(&event) { continue; }

      match event {
        Event::Quit {..} | Event::KeyDown { keycode: Some(Keycode::Escape), .. } => {
          break 'running
        },
        _ => {}
      }
    }


    imgui_sdl2.prepare_frame(imgui.io_mut(), &window, &event_pump.mouse_state());

    let now = Instant::now();
    let delta = now - last_frame;
    let delta_s = delta.as_secs() as f32 + delta.subsec_nanos() as f32 / 1_000_000_000.0;
    last_frame = now;
    imgui.io_mut().delta_time = delta_s;

    let ui = imgui.frame();
    ui.show_demo_window(&mut true);

    ui.separator();
    let mouse_pos = ui.io().mouse_pos;
    ui.text(format!(
      "Mouse Position: ({:.1},{:.1})",
      mouse_pos[0], mouse_pos[1]
    ));

    ui.separator();

    Image::new(imgui_texture_id, [100.0, 100.0]).build(&ui);
    ui.separator();

    Image::new(imgui_texture_id_2, [100.0, 100.0]).build(&ui);
    ui.separator();

    ui.separator();

    Window::new(im_str!("Hello world"))
        .size([1500.0, 1500.0], Condition::FirstUseEver)
        .build(&ui, || {
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
          // Depth image dimensions: 640x576
          // Take transformed depth image... 1280x720 [Depth16]
          Image::new(imgui_texture_id_2, [1280.0, 720.0]).build(&ui);
          //Image::new(imgui_texture_id_4, [1280.0, 720.0]).build(&ui);
        });

    unsafe {
      //gl::ClearColor(0.2, 0.2, 0.2, 1.0);
      //gl::Clear(gl::COLOR_BUFFER_BIT);
    }

    imgui_sdl2.prepare_render(&ui, &window);
    renderer.render(ui);

    window.gl_swap_window();

    if let Some(capture) = capture_provider.get_capture() {
      visualizer.update_texture_id(texture.texture_id(), capture)
          .map(|_| {
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
    }

    //rebinder.restore();

    std::thread::sleep(::std::time::Duration::new(0, 1_000_000_000u32 / 60));
  }
}
