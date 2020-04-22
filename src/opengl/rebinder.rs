use gl;
use gl::types::*;

/// Rebinder records the current state of OpenGL bindings so that it can restore them later.
/// I'm writing this because the code I wrote/adapted is unfortunately a mess.
pub struct Rebinder {
  texture_id: GLint,
  array_buffer_id: GLint,
  element_array_buffer_id: GLint,
  pixel_unpack_buffer_id: GLint,
  renderbuffer_binding: GLint,
  vertex_array_binding: GLint,
  draw_framebuffer_binding: GLint,
  read_framebuffer_binding: GLint,
  current_program: GLint,
  active_texture: GLint,
  is_depth_test: u8,
}

impl Rebinder {
  /// Capture a current snapshot of the bindings.
  pub fn snapshot() -> Self {
    let mut bindings = Self {
      texture_id: 0,
      array_buffer_id: 0,
      element_array_buffer_id: 0,
      pixel_unpack_buffer_id: 0,
      renderbuffer_binding: 0,
      vertex_array_binding: 0,
      draw_framebuffer_binding: 0,
      read_framebuffer_binding: 0,
      current_program: 0,
      active_texture: 0,
      is_depth_test: 0,
    };

    unsafe {
      gl::GetIntegerv(gl::TEXTURE_BINDING_2D, &mut bindings.texture_id);
      gl::GetIntegerv(gl::ARRAY_BUFFER_BINDING, &mut bindings.array_buffer_id);
      gl::GetIntegerv(gl::ELEMENT_ARRAY_BUFFER_BINDING, &mut bindings.element_array_buffer_id);
      gl::GetIntegerv(gl::PIXEL_UNPACK_BUFFER_BINDING, &mut bindings.pixel_unpack_buffer_id);
      gl::GetIntegerv(gl::RENDERBUFFER_BINDING, &mut bindings.renderbuffer_binding);
      gl::GetIntegerv(gl::VERTEX_ARRAY_BINDING, &mut bindings.vertex_array_binding);
      gl::GetIntegerv(gl::DRAW_FRAMEBUFFER_BINDING, &mut bindings.draw_framebuffer_binding);
      gl::GetIntegerv(gl::READ_FRAMEBUFFER_BINDING, &mut bindings.read_framebuffer_binding);
      gl::GetIntegerv(gl::CURRENT_PROGRAM, &mut bindings.current_program);
      gl::GetIntegerv(gl::ACTIVE_TEXTURE, &mut bindings.active_texture);
      gl::GetBooleanv(gl::DEPTH_TEST, &mut bindings.is_depth_test);
    }

    bindings
  }

  /// Restore the snapshot of the bindings.
  /// This consumes the rebinder.
  pub fn restore(self) {
    unsafe {
      gl::BindTexture(gl::TEXTURE_2D, self.texture_id as u32);
      gl::BindBuffer(gl::ARRAY_BUFFER, self.array_buffer_id as u32);
      gl::BindBuffer(gl::ELEMENT_ARRAY_BUFFER, self.element_array_buffer_id as u32);
      gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, self.pixel_unpack_buffer_id as u32);
      gl::BindRenderbuffer(gl::RENDERBUFFER, self.renderbuffer_binding as u32);
      gl::BindVertexArray(self.vertex_array_binding as u32);
      gl::BindFramebuffer(gl::DRAW_FRAMEBUFFER, self.draw_framebuffer_binding as u32);
      gl::BindFramebuffer(gl::READ_FRAMEBUFFER, self.read_framebuffer_binding as u32);
      gl::UseProgram(self.current_program as u32);
      gl::ActiveTexture(self.active_texture as u32);
      if self.is_depth_test == 0 {
        gl::Disable(gl::DEPTH_TEST);
      } else {
        gl::Enable(gl::DEPTH_TEST);
      }
    }
  }
}