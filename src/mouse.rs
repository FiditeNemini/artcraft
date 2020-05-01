use arcball::ArcballCamera;
use cgmath::{Vector2, Matrix4};
use cgmath::Vector3;
use sdl2::event::Event;
use sdl2::mouse::MouseButton;

/// Wrap a camera arcball for use with SDL
pub struct SdlArcball {
  // TODO: Enable camera resizing (or change of texture to differently sized texture)
  arcball: ArcballCamera<f32>,
  left_mouse_active: bool,
  right_mouse_active: bool,
  last_x: f32,
  last_y: f32,
}

impl SdlArcball {
  /// CTOR
  pub fn new(width: f32, height: f32) -> Self {
    let center = Vector3::new(0.0, 0.0, 0.0);
    let zoom_speed = 1.0;
    let screen = [width, height];
    let arcball = ArcballCamera::new(center, zoom_speed, screen);
    Self {
      arcball,
      left_mouse_active: false,
      right_mouse_active: false,
      last_x: 0.0,
      last_y: 0.0,
    }
  }

  pub fn process_event(&mut self, event: &Event) {
    match event {
      Event::MouseWheel { timestamp, window_id, which, x, y, direction } => {
        self.mouse_wheel(*y);
      },
      Event::MouseButtonDown { timestamp, window_id, which, mouse_btn, clicks, x, y } => {
        self.mouse_button_press(mouse_btn, true);
      },
      Event::MouseButtonUp { timestamp, window_id, which, mouse_btn, clicks, x, y } => {
        self.mouse_button_press(mouse_btn, false);
      },
      Event::MouseMotion { timestamp, window_id, which, mousestate, x, y, xrel, yrel } => {
        let x = *x as f32;
        let y = *y as f32;
        self.mouse_motion(x, y);
        self.last_x = x;
        self.last_y = y;
      },
      _ => {},
    }
  }

  pub fn get_mat4(&self) -> Matrix4<f32> {
    self.arcball.get_mat4()
  }

  fn mouse_wheel(&mut self, y: i32) {
    self.arcball.zoom(y as f32, 0.16);
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
        (x - self.last_x),
        (self.last_y - y), // Invert scrolling
      );
      self.arcball.pan(mouse_delta, 0.16);
    }
  }
}
