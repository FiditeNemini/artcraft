use arcball::ArcballCamera;
use cgmath::{Matrix4, Vector2};
use cgmath::Vector3;
use sdl2::event::Event;
use sdl2::mouse::MouseButton;
use gui::enhanced_window::CompleteMouseState;

const MIN_ZOOM : f32 = 1.0;
const MAX_ZOOM : f32 = 120.0;
const DEFAULT_ZOOM: f32 = 65.0;

// TODO: Enable camera resizing (or change of texture to differently sized texture)
/// Wrap a camera arcball for use with SDL
pub struct SdlArcball {
  // Arcball camera state
  arcball: ArcballCamera<f32>,

  // Dimensions of the window
  window_width: u32,
  window_height: u32,

  // Last mouse state
  left_mouse_active: bool,
  right_mouse_active: bool,
  last_x: f32,
  last_y: f32,
  last_zoom: f32,

  animation_counter: f32,
}

impl SdlArcball {
  /// CTOR
  pub fn new(window_width: u32, window_height: u32) -> Self {
    let center = Vector3::new(0.0, 0.0, 0.0);
    let zoom_speed = 1.0;
    let screen = [window_width as f32, window_height as f32];
    let mut arcball = ArcballCamera::new(center, zoom_speed, screen);

    // TODO: This should be cleaned up to use pure math rather than stupid experimentally determined fixes
    arcball.zoom(-8.0, 0.16);

    let mut prev = Vector2::new(window_width as f32, (window_height/2) as f32);

    for i in 0 .. window_width / 2 {
      let pos = Vector2::new(prev.x - 1.0, (window_height/2) as f32);
      arcball.rotate(prev, pos);
      prev = pos.clone();
    }

    for i in 0..600 {
      let delta = Vector2::new(0.0, 1.0);
      arcball.pan(delta, 0.16);
    }

    Self {
      arcball,
      window_width,
      window_height,
      left_mouse_active: false,
      right_mouse_active: false,
      last_x: 0.0,
      last_y: 0.0,
      last_zoom: DEFAULT_ZOOM,

      animation_counter: 0.0,
    }
  }

  /// Process an SDL event.
  /// This is a bad idea in a multi-window Imgui setup since the SDL coordinates and events take up
  /// the entire process window and may be sequestered on a per-window level. That said, this is
  /// reasonable for single-window apps.
  pub fn process_event(&mut self, event: &Event) {
    match event {
      Event::MouseWheel { timestamp: _, window_id: _, which: _, x: _, y, direction: _ } => {
        //println!("Mouse wheel event.");
        let y = *y as f32;
        self.mouse_wheel(y);
      },
      Event::MouseButtonDown { timestamp: _, window_id: _, which: _, mouse_btn, clicks: _, x: _, y: _ } => {
        //println!("Mouse button down event.");
        self.mouse_button_press(mouse_btn, true);
      },
      Event::MouseButtonUp { timestamp: _, window_id: _, which: _, mouse_btn, clicks: _, x: _, y: _ } => {
        //println!("Mouse button up event.");
        self.mouse_button_press(mouse_btn, false);
      },
      Event::MouseMotion { timestamp: _, window_id: _, which: _, mousestate: _, x, y, xrel: _, yrel: _ } => {
        let x = *x as f32;
        let y = *y as f32;
        self.mouse_motion(x, y);
        self.last_x = x;
        self.last_y = y;
      },
      _ => {},
    }
  }

  /// Process Imgui window-scoped mouse state.
  /// Since we don't process individual events, we set all of the internal state at once.
  pub fn process_mouse_state(&mut self, mouse_state: CompleteMouseState) {
    // TODO: Cleanup
    self.right_mouse_active = mouse_state.right_button_down;
    self.left_mouse_active = mouse_state.left_button_down;
    self.mouse_motion(mouse_state.cursor_x, mouse_state.cursor_y);
    self.mouse_wheel(mouse_state.scroll_wheel);
    self.last_x = mouse_state.cursor_x;
    self.last_y = mouse_state.cursor_y;
  }

  /// Get the view matrix
  pub fn get_view_matrix(&self) -> Matrix4<f32> {
    self.arcball.get_mat4()
  }

  /// Get the perspective matrix
  pub fn get_perspective_matrix(&self) -> Matrix4<f32> {
    let zoom = self.last_zoom;
    let y_fov = zoom.to_radians();
    let aspect = self.window_width as f32 / self.window_height as f32;
    let n = 0.1f32;
    let f = 1000.0f32;

    // From linmath.h included in Microsoft's k4a open source code
    let a = 1.0f32 / (y_fov / 2.0).tan();

    // NB: This is column-major, which is dumb.
    Matrix4::new(
      // Column 0
      a / aspect,
      0.0,
      0.0,
      0.0,

      // Column 1
      0.0,
      a,
      0.0,
      0.0,

      // Column 2
      0.0,
      0.0,
      -((f + n) / (f - n)),
      -((2.0 * f * n) / (f - n)),

      // Column 3
      0.0,
      0.0,
      -1.0, // NB: This is not zero
      0.0,
    )
  }

  pub fn animate(&mut self) {
    let x = self.animation_counter.sin();
    let y = self.animation_counter.cos();
    self.animation_counter.sin();
    let mouse_delta = Vector2::new(x * 4.0, y * 4.0);
    self.arcball.pan(mouse_delta, 0.16);


    let x = self.animation_counter.sin();

    if x > 0.0 {
      let y = 1.0;
      let prev = Vector2::new(0.0, 0.0);
      let cur = Vector2::new(y, y);
      self.arcball.rotate(prev, cur);
    } else {
      let y = 1.0;
      let prev = Vector2::new(y, y);
      let cur = Vector2::new(0.0, 0.0);
      self.arcball.rotate(prev, cur);
    };


    self.animation_counter += 0.05;
  }

  fn mouse_wheel(&mut self, y: f32) {
    self.arcball.zoom(y, 0.16);

    // NB: 'y' is a scroll amount, typically 1 or -1.
    let zoom = (self.last_zoom + y)
        .max(MIN_ZOOM)
        .min(MAX_ZOOM);

    self.last_zoom = zoom;
  }

  fn mouse_button_press(&mut self, mouse_button: &MouseButton, down: bool) {
    match mouse_button {
      MouseButton::Left => self.left_mouse_active = down,
      MouseButton::Right => self.right_mouse_active = down,
      _ => {},
    }
  }

  fn mouse_motion(&mut self, x: f32, y: f32) {
    if self.left_mouse_active {
      let previous = Vector2::new(self.last_x, self.last_y);
      let current = Vector2::new(x, y);
      self.arcball.rotate(previous, current);
    } else if self.right_mouse_active {
      let mouse_delta = Vector2::new(
        x - self.last_x,
        self.last_y - y, // Invert scrolling
      );
      self.arcball.pan(mouse_delta, 0.16);
    }
  }
}
