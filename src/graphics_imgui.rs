use std::sync::{Arc, Mutex, PoisonError, MutexGuard};
use std::time::{Instant, Duration};

use gl;
use imgui::*;
use imgui::Image;

use core_types::RgbaF32;
use gui::enhanced_window::EnhancedWindow;
use gui::mouse_camera_arcball::MouseCameraArcball;
use kinect::sensor_control::CaptureProvider;
use point_cloud::pixel_structs::BgraPixel;
use point_cloud::point_cloud_visualiser::{ColorizationStrategy, PointCloudVisualizer, PointCloudVisualizerError};
use point_cloud::viewer_image::ViewerImage;
use webcam::WebcamWriter;
use kinect::multi_device_capturer::MultiDeviceCaptureProvider;

pub fn run(capture_provider: Arc<MultiDeviceCaptureProvider>, calibration_data: k4a_sys::k4a_calibration_t, enable_webcam: bool) {
  let mut webcam_writer = None;

  if enable_webcam {
    webcam_writer = Some(WebcamWriter::open_file("/dev/video0", 1280, 720, 3)
        .expect("should be able to create webcamwriter"));
  }

  let sdl_arcball = Arc::new(Mutex::new(MouseCameraArcball::new(1280, 720)));

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

  let mut imgui = imgui::Context::create();
  imgui.set_ini_filename(None);
  imgui.io_mut().config_windows_move_from_title_bar_only = true;

  /*let gl_texture_n64 = load_texture("n64logo.png");
  let imgui_texture_n64 = TextureId::from(gl_texture_n64 as usize);
  let mut gl_texture_snes = load_texture("sneslogo.png");
  let mut imgui_texture_snes = TextureId::from(gl_texture_snes as usize);*/

  let colorization_strategy = ColorizationStrategy::Color;

  let clear_color = RgbaF32::black();

  let mut visualizer = PointCloudVisualizer::new(
    capture_provider.get_num_cameras(),
    true,
    colorization_strategy,
    calibration_data,
    clear_color,
    sdl_arcball.clone(),
  );

  //rebinder.restore();

  let texture = ViewerImage::create(
    // TODO: The following commented-out values work and look great,
    //  but now we're doing suboptimal webcam stuff:
    //1280,
    //1152,
    1280,
    720,
  ).expect("ViewerImage texture creation should work");

  let mut imgui_visualizer_xyz_texture_0 : Option<TextureId> = None;
  let mut imgui_visualizer_xyz_texture_1 : Option<TextureId> = None;

  let imgui_point_cloud_convert_xy_table= TextureId::from(visualizer.point_cloud_converters.get(0).unwrap().xy_table_texture.id() as usize);

  let imgui_kinect_final_output = TextureId::from(texture.texture_id() as usize);

  let mut imgui_sdl2 = imgui_sdl2::ImguiSdl2::new(&mut imgui, &window);

  let renderer = imgui_opengl_renderer::Renderer::new(&mut imgui, |s| video.gl_get_proc_address(s) as _);

  let mut event_pump = sdl_context.event_pump().unwrap();

  let mut last_frame = Instant::now();
  let mut last_change = Instant::now();

  let mut camera_index = 0;

  'running: loop {
    use sdl2::event::Event;
    use sdl2::keyboard::Keycode;

    for event in event_pump.poll_iter() {
      imgui_sdl2.handle_event(&mut imgui, &event);

      // TODO: This is how Imgui appears to tell SDL to ignore certain events.
      if imgui_sdl2.ignore_event(&event) { continue; }

      match event {
        Event::Quit {..} | Event::KeyDown { keycode: Some(Keycode::Escape), .. } => {
          break 'running
        },
        _ => {}
      }

      /*// Also send to the arcball to update the view matrix.
      match sdl_arcball.lock() {
        Ok(mut arcball) => arcball.process_event(&event),
        Err(_) => {},
      }*/
    }

    imgui_sdl2.prepare_frame(imgui.io_mut(), &window, &event_pump.mouse_state());

    let now = Instant::now();
    let delta = now - last_frame;
    let delta_s = delta.as_secs() as f32 + delta.subsec_nanos() as f32 / 1_000_000_000.0;
    last_frame = now;
    imgui.io_mut().delta_time = delta_s;

    let ui = imgui.frame();

    //ui.show_demo_window(&mut true);

    const window_width : f32 = 1290.0;
    const window_height : f32 = 760.0;

    if imgui_visualizer_xyz_texture_0.is_none() {
      if visualizer.xyz_textures.get(0).unwrap().id() != 0 { // TODO: TEMP SUPPORT MULTI-CAMERA
        imgui_visualizer_xyz_texture_0 = Some(TextureId::from(visualizer.xyz_textures.get(0).unwrap().id() as usize)); // TODO: TEMP SUPPORT MULTI-CAMERA
      }
    }

    if imgui_visualizer_xyz_texture_1.is_none() {
      if visualizer.xyz_textures.get(1).unwrap().id() != 0 { // TODO: TEMP SUPPORT MULTI-CAMERA
        imgui_visualizer_xyz_texture_1 = Some(TextureId::from(visualizer.xyz_textures.get(1).unwrap().id() as usize)); // TODO: TEMP SUPPORT MULTI-CAMERA
      }
    }

    Window::new(im_str!("Visualizer XYZ Texture (0)"))
        .scrollable(true)
        .size([window_width, window_height], Condition::FirstUseEver)
        .position([0.0, 0.0], Condition::FirstUseEver)
        .build(&ui, || {
          match imgui_visualizer_xyz_texture_0.as_ref() {
            None => {},
            Some(xyz_texture) => {
              Image::new(xyz_texture.clone(), [1280.0, 720.0]).build(&ui);
            },
          }
        });

    Window::new(im_str!("Visualizer XYZ Texture (1)"))
        .size([window_width, window_height], Condition::FirstUseEver)
        .position([window_width + 50.0, 0.0], Condition::FirstUseEver)
        .movable(false)
        .build(&ui, || {
          match imgui_visualizer_xyz_texture_1.as_ref() {
            None => {},
            Some(xyz_texture) => {
              Image::new(xyz_texture.clone(), [1280.0, 720.0]).build(&ui);
            },
          }
        });

    Window::new(im_str!("Point Cloud Converter XY Table"))
        .size([window_width, window_height], Condition::FirstUseEver)
        .position([0.0, window_height + 50.0], Condition::FirstUseEver)
        .build(&ui, || {
          Image::new(imgui_point_cloud_convert_xy_table, [1280.0, 720.0]).build(&ui);
        });

    // NB: This is larger. The texture is 1280x1152.
    EnhancedWindow::new(&im_str!("Final Output: {:?}", colorization_strategy))
        .size([window_width, window_height + 435.0], Condition::FirstUseEver)
        .position([window_width + 50.0, window_height + 50.0], Condition::FirstUseEver)
        .mouse_inputs(true)
        .build(&ui, |window| {

          if let Some(mouse_state) = window.get_window_bounded_mouse_state() {
            match sdl_arcball.lock() {
              Ok(mut arcball) => arcball.process_mouse_state(mouse_state),
              Err(_) => {},
            }
          }

          Image::new(imgui_kinect_final_output, [1280.0, 720.0]).build(&ui);
        });

    unsafe {
      gl::ClearColor(0.2, 0.2, 0.2, 1.0);
      gl::Clear(gl::COLOR_BUFFER_BIT);
    }

    imgui_sdl2.prepare_render(&ui, &window);
    renderer.render(ui);

    window.gl_swap_window();

    if let Some(mut captures) = capture_provider.get_captures() {
      visualizer.update_texture_id(texture.texture_id(), captures)
          .map(|_| {})
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

    match sdl_arcball.lock() {
      Ok(mut arcball) => {
        arcball.animate();
      },
      Err(_) => {},
    }

    if let Some(mut webcam) = webcam_writer.as_mut() {
      webcam.write_current_frame_to_file(texture.texture_id())
          .expect("should write");
    }

    let change_delta = last_frame - last_change;
    if change_delta > Duration::from_millis(5_000) {
      camera_index = (camera_index + 1) % capture_provider.get_num_cameras();
      last_change = Instant::now();
    }

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
