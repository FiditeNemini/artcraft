/// A wrapper around `Imgui::Window` that adds window-scoped devices.
pub struct EnhancedWindow <'a> {
  pub window: imgui::Window<'a>,
}

impl <'a> EnhancedWindow <'a> {
  pub fn new(name: &'a imgui::ImStr) -> Self {
    let mut window = imgui::Window::new(name)
        .scrollable(true);

    Self {
      window,
    }
  }

  /// Enables/disables catching mouse input.
  ///
  /// Enabled by default.
  /// Note: Hovering test will pass through when disabled
  #[inline]
  pub fn mouse_inputs(mut self, value: bool) -> Self {
    // NB: Builder API consumes window, so we have to move it.
    self.window = self.window.mouse_inputs(value);
    self
  }

  /// Sets the window position, which is applied based on the given condition value
  #[inline]
  pub fn position(mut self, position: [f32; 2], condition: imgui::Condition) -> Self {
    // NB: Builder API consumes window, so we have to move it.
    self.window = self.window.position(position, condition);
    self
  }

  /// Sets the window size, which is applied based on the given condition value
  #[inline]
  pub fn size(mut self, size: [f32; 2], condition: imgui::Condition) -> Self {
    // NB: Builder API consumes window, so we have to move it.
    self.window = self.window.size(size, condition);
    self
  }

  /// Creates a window and runs a closure to construct the contents.
  ///
  /// Note: the closure is not called if no window content is visible (e.g. window is collapsed
  /// or fully clipped).
  pub fn build<F>(self, ui: &imgui::Ui, f: F)
    where F: FnOnce(WindowScopedUi)
  {
    if let Some(window) = self.begin(ui) {
      let win_helper = WindowScopedUi::new(&ui);
      f(win_helper);
      window.end(ui);
    }
  }

  /// Creates a window and starts appending to it.
  ///
  /// Returns `Some(WindowToken)` if the window is visible. After content has been
  /// rendered, the token must be ended by calling `.end()`.
  ///
  /// Returns `None` if the window is not visible and no content should be rendered.
  #[must_use]
  pub fn begin(self, ui: &imgui::Ui) -> Option<imgui::WindowToken> {
    self.window.begin(ui)
  }
}

/// State for a mouse mapped to the dimensions of an `Imgui::Window`.
#[derive(Debug, Clone)]
pub struct CompleteMouseState {
  // Cursor position
  pub cursor_x: f32,
  pub cursor_y: f32,
  // Scroll wheel velocity (typically just '0', '1', or '-1').
  pub scroll_wheel: f32,
  pub scroll_wheel_h: f32,
  // Buttons
  pub left_button_down: bool,
  pub right_button_down: bool,
  pub middle_button_down: bool,
  pub extra_button_1_down: bool,
  pub extra_button_2_down: bool,
}

/// Exposes some reusable calculations on top of `imgui::Ui` in the context of window usage.
pub struct WindowScopedUi<'a> {
  ui: &'a imgui::Ui<'a>,
}

impl <'a> WindowScopedUi<'a> {
  pub fn new(ui: &'a imgui::Ui) -> Self {
    Self {
      ui
    }
  }

  /// Returns true if the current window is hovered
  #[inline]
  pub fn is_window_hovered(&self) -> bool {
    self.ui.is_window_hovered()
  }

  /// Return the cursor position within the window.
  /// None is returned if the window isn't hovered, or the mouse is logically not within the drawn
  /// texture area.
  pub fn get_cursor(&self) -> Option<[f32; 2]> {
    if !self.is_window_hovered() {
      return None;
    }

    // Global mouse coordinate
    let mouse_pos = self.ui.io().mouse_pos;
    // Anchor point of the window's top left corner
    let window_pos = self.ui.window_pos();
    // Start of textured data (padding offset created by title and window padding).
    let cursor_pos = self.ui.cursor_pos();

    let x = mouse_pos[0] - window_pos[0] - cursor_pos[0];
    let y = mouse_pos[1] - window_pos[1] - cursor_pos[1];

    if x.is_sign_negative() || y.is_sign_negative() {
      return None; // Outside of bounds (eg. cursor within title area)
    }

    Some([x, y])
  }

  /// Return the mouse scroll state. If the mouse is not hovering our window, None is returned.
  pub fn get_mouse_wheel(&self) -> Option<f32> {
    if self.get_cursor().is_none() {
      return None;
    }
    Some(self.ui.io().mouse_wheel)
  }

  /// Mouse buttons: 0=left, 1=right, 2=middle + extras
  pub fn get_mouse_down(&self) -> Option<[bool; 5]> {
    if self.get_cursor().is_none() {
      return None;
    }

    Some(self.ui.io().mouse_down)
  }

  /// Get the current mouse state
  /// If the cursor isn't within the window, None is returned.
  pub fn get_window_bounded_mouse_state(&self) -> Option<CompleteMouseState> {
    self.get_cursor()
        .map(|cursor| {
          let io = self.ui.io();
          let mouse = io.mouse_down;

          CompleteMouseState {
            cursor_x: cursor[0],
            cursor_y: cursor[1],
            scroll_wheel: io.mouse_wheel,
            scroll_wheel_h: io.mouse_wheel_h,
            left_button_down: mouse[0],
            right_button_down: mouse[1],
            middle_button_down: mouse[2],
            extra_button_1_down: mouse[3],
            extra_button_2_down: mouse[4],
          }
        })
  }
}

