use gl::types::*;
use gl;
use glium::Display;
use glium::backend::Facade;
use glutin::ContextBuilder;
use glutin::event::{Event, WindowEvent};
use glutin::event_loop::{ControlFlow, EventLoop};
use glutin::window::WindowBuilder;
use imgui::MouseButton;
use imgui::*;
use imgui::Image;
use imgui_support;
use memmap2::{MmapMut, Mmap};
use mmap::MapOption::{MapReadable, MapWritable, MapFd};
use mmap::MemoryMap;
use opengl::debug::enable_opengl_debugging;
use opengl::rebinder::Rebinder;
use opengl::texture::load_texture;
use opengl_wrapper::{Texture, Buffer};
use point_cloud::point_cloud_visualiser::{PointCloudVisualizer, PointCloudVisualizerError, ColorizationStrategy};
use point_cloud::viewer_image::{ViewerImage, ImageDimensions};
use sensor_control::CaptureProvider;
use std::ffi::c_void;
use std::fs::{File, OpenOptions};
use std::io::{Write, Read};
use std::os::unix::io::AsRawFd;
use std::path::Path;
use std::sync::{Arc, Mutex, PoisonError, MutexGuard};
use std::time::{Instant, Duration};
use cgmath::Vector3;
use cgmath::Vector2;
use webcam::{WebcamWriter};
use std::error::Error;
use arcball::ArcballCamera;
use mouse::SdlArcball;

pub fn run(capture_provider: Arc<CaptureProvider>, calibration_data: k4a_sys::k4a_calibration_t) {

  let mut webcam_writer = WebcamWriter::open_file("/dev/video0", 1280, 720, 3)
      .expect("should be able to create webcamwriter");

  let sdl_arcball = Arc::new(Mutex::new(SdlArcball::new(1280.0, 720.0)));

  let sdl_context = sdl2::init().unwrap();
  let video = sdl_context.video().unwrap();

  {
    let gl_attr = video.gl_attr();
    gl_attr.set_context_profile(sdl2::video::GLProfile::Core);
    gl_attr.set_context_version(3, 0);
  }

  let window = video.window("rust-imgui-sdl2 demo", 3000, 2000)
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

  /*let gl_texture_n64 = load_texture("n64logo.png");
  let imgui_texture_n64 = TextureId::from(gl_texture_n64 as usize);
  let mut gl_texture_snes = load_texture("sneslogo.png");
  let mut imgui_texture_snes = TextureId::from(gl_texture_snes as usize);*/

  let mut colorization_strategy = ColorizationStrategy::Color;

  let mut visualizer = PointCloudVisualizer::new(
    true,
    colorization_strategy,
    calibration_data,
    sdl_arcball.clone(),
  );

  //rebinder.restore();

  let mut texture = ViewerImage::create(
    // TODO: The following commented-out values work and look great,
    //  but now we're doing suboptimal webcam stuff:
    //1280,
    //1152,
    1280,
    720,
  ).expect("ViewerImage texture creation should work");

  let mut imgui_visualizer_xyz_texture : Option<TextureId> = None;

  let imgui_point_cloud_convert_depth_image = TextureId::from(visualizer.point_cloud_converter.depth_image_texture.id() as usize);
  let imgui_point_cloud_convert_xy_table= TextureId::from(visualizer.point_cloud_converter.xy_table_texture.id() as usize);

  let imgui_kinect_final_output = TextureId::from(texture.texture_id() as usize);

  let mut imgui_sdl2 = imgui_sdl2::ImguiSdl2::new(&mut imgui, &window);

  let renderer = imgui_opengl_renderer::Renderer::new(&mut imgui, |s| video.gl_get_proc_address(s) as _);

  let mut event_pump = sdl_context.event_pump().unwrap();

  let mut last_frame = Instant::now();
  let mut last_change = Instant::now();

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

      // Also send to the arcball to update the view matrix.
      match sdl_arcball.lock() {
        Ok(mut arcball) => arcball.process_event(&event),
        Err(_) => {},
      }
    }


    imgui_sdl2.prepare_frame(imgui.io_mut(), &window, &event_pump.mouse_state());

    let now = Instant::now();
    let delta = now - last_frame;
    let delta_s = delta.as_secs() as f32 + delta.subsec_nanos() as f32 / 1_000_000_000.0;
    last_frame = now;
    imgui.io_mut().delta_time = delta_s;

    let ui = imgui.frame();
    //ui.show_demo_window(&mut true);

    /*Window::new(im_str!("Loading Images"))
        .size([1500.0, 1500.0], Condition::FirstUseEver)
        .position([0.0, 0.0], Condition::FirstUseEver)
        .build(&ui, || {
          let mouse_pos = ui.io().mouse_pos;
          ui.text(format!(
            "Mouse Position: ({:.1},{:.1})",
            mouse_pos[0], mouse_pos[1]
          ));
          ui.separator();
          Image::new(imgui_texture_n64, [100.0, 100.0]).build(&ui);
          ui.separator();
          Image::new(imgui_texture_snes, [200.0, 200.0]).build(&ui);
          ui.separator();
        });*/

    const window_width : f32 = 1290.0;
    const window_height : f32 = 760.0;

    Window::new(im_str!("Point Cloud Converter Depth Image"))
        .size([window_width, window_height], Condition::FirstUseEver)
        .position([0.0, 0.0], Condition::FirstUseEver)
        .build(&ui, || {
          Image::new(imgui_point_cloud_convert_depth_image, [1280.0, 720.0]).build(&ui);
        });
    Window::new(im_str!("Point Cloud Converter XY Table"))
        .size([window_width, window_height], Condition::FirstUseEver)
        .position([0.0, window_height + 50.0], Condition::FirstUseEver)
        .build(&ui, || {
          Image::new(imgui_point_cloud_convert_xy_table, [1280.0, 720.0]).build(&ui);
        });

    if imgui_visualizer_xyz_texture.is_none() {
      if visualizer.xyz_texture.id() != 0 {
        imgui_visualizer_xyz_texture = Some(TextureId::from(visualizer.xyz_texture.id() as usize));
      }
    }

    Window::new(im_str!("Visualizer XYZ Texture"))
        .size([window_width, window_height], Condition::FirstUseEver)
        .position([window_width + 50.0, 0.0], Condition::FirstUseEver)
        .build(&ui, || {
          match imgui_visualizer_xyz_texture.as_ref() {
            None => {},
            Some(xyz_texture) => {
              Image::new(xyz_texture.clone(), [1280.0, 720.0]).build(&ui);
            },
          }
        });
    // NB: This is larger. The texture is 1280x1152.
    Window::new(&im_str!("Final Output: {:?}", colorization_strategy))
        .size([window_width, window_height + 435.0], Condition::FirstUseEver)
        .position([window_width + 50.0, window_height + 50.0], Condition::FirstUseEver)
        .build(&ui, || {
          //Image::new(imgui_kinect_final_output, [1280.0, 1152.0]).build(&ui);
          //Image::new(imgui_kinect_final_output, [640.0, 480.0]).build(&ui);
          Image::new(imgui_kinect_final_output, [1280.0, 720.0]).build(&ui);
        });

    unsafe {
      gl::ClearColor(0.2, 0.2, 0.2, 1.0);
      gl::Clear(gl::COLOR_BUFFER_BIT);
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

    webcam_writer.write_current_frame_to_file(texture.texture_id())
        .expect("should write");

    //let change_delta = last_frame - last_change;
    //if change_delta > Duration::from_millis(5_000) {
    //}

    /*if change_delta > Duration::from_millis(5000) {
      colorization_strategy = match colorization_strategy {
        ColorizationStrategy::Simple => ColorizationStrategy::Shaded, // NB: We won't do simple.
        ColorizationStrategy::Shaded => ColorizationStrategy::Color,
        ColorizationStrategy::Color => ColorizationStrategy::Shaded,
      };

      println!("Changing colorization strategy: {:?}", colorization_strategy);

      visualizer.set_colorization_strategy(colorization_strategy);
      last_change = Instant::now();
    }*/

    //rebinder.restore();

    std::thread::sleep(::std::time::Duration::new(0, 1_000_000_000u32 / 60));
  }
}
