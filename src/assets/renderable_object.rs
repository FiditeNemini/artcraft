use anyhow::Result as AnyhowResult;
use assets::obj_loader::{ExtractedVertex, load_wavefront};
use gl::types::*;
use opengl::wrapper::buffer::Buffer;
use opengl::wrapper::texture::Texture;
use opengl::wrapper::vertex_array::VertexArray;
use std::ffi::{c_void, CString};
use std::mem::size_of;
use std::os::raw::c_char;
use std::path::Path;
use std::ptr::null;

/// A collection of all the graphics-related data to render: vertices, normals, etc.
pub struct RenderableObject {
  pub vao: VertexArray,
  pub vertex_buffer: Buffer,
  pub normal_buffer: Buffer,
  pub color_buffer: Buffer,
  pub texture_coords_buffer: Buffer,
  pub texture: Texture,
  pub num_vertices: usize,
  pub buffered: bool,
}

impl RenderableObject {
  pub fn new() -> Self {
    unsafe {
      let vao = VertexArray::new_initialized();
      vao.bind();

      let vertex_buffer = Buffer::new_initialized();
      let normal_buffer = Buffer::new_initialized();
      let color_buffer = Buffer::new_initialized();
      let texture_coords_buffer = Buffer::new_initialized();
      let texture = Texture::new_initialized();

      Self {
        vao,
        vertex_buffer,
        normal_buffer,
        color_buffer,
        texture_coords_buffer,
        texture,
        num_vertices: 0,
        buffered: false,
      }
    }
  }

  pub fn from_wavefront(path: &Path, shader_id: GLuint) -> AnyhowResult<Self> {
    let vertices = load_wavefront(&path)?;

    let mut renderable_object = RenderableObject::new();
    renderable_object.load_vertices(&vertices, shader_id);

    Ok(renderable_object)
  }

  pub fn load_vertices(&mut self, vertex_data: &Vec<ExtractedVertex>, shader_id: GLuint) {
    self.vao.bind();
    self.vertex_buffer.bind_as_array_buffer();

    let size = vertex_data.len() * 3 * size_of::<f32>();
    let mut vertices : Vec<f32> = Vec::with_capacity(vertex_data.len() * 3);

    for v in vertex_data.into_iter() {
      vertices.extend(&v.position);
    }

    self.num_vertices = vertex_data.len();

    println!("Object vertices loaded: {}", vertices.len());

    unsafe {
      let vertices_ptr = vertices.as_ptr() as *const c_void;

      gl::BufferData(
        gl::ARRAY_BUFFER,
        size as isize,
        vertices_ptr,
        gl::STATIC_DRAW,
      );

      let name : CString = CString::new("position").expect("string is correct");
      let name_ptr : *const c_char = name.as_ptr() as *const c_char;

      let loc = gl::GetAttribLocation(shader_id, name_ptr);
      println!("Attrib location: {}", loc);

      gl::EnableVertexAttribArray(loc as u32);

      gl::VertexAttribPointer(loc as u32, 3, gl::FLOAT, gl::FALSE, 0, null());
    }
  }

  pub fn draw(&self) {
    self.vao.bind();
    unsafe {
      gl::DrawArrays(gl::TRIANGLES, 0, self.num_vertices as i32);
    }
  }
}

