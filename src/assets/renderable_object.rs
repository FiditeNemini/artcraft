use anyhow::Result as AnyhowResult;
use anyhow::bail;
use crate::assets::obj_loader::{ExtractedVertex, load_wavefront};
use crate::opengl::wrapper::buffer::Buffer;
use crate::opengl::wrapper::texture::Texture;
use crate::opengl::wrapper::vertex_array::VertexArray;
use gl::types::*;
use std::ffi::{c_void, CString};
use std::mem::size_of;
use std::os::raw::c_char;
use std::path::Path;
use std::ptr::null;
use image::DynamicImage;
use crate::opengl::wrapper::uniform::Uniform;

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

    renderable_object.load_texture_coordinates(&vertices, shader_id);

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

  pub fn load_texture_coordinates(&mut self, vertex_data: &Vec<ExtractedVertex>, shader_id: GLuint) {
    self.vao.bind();
    self.texture_coords_buffer.bind_as_array_buffer();

    let size = vertex_data.len() * 2 * size_of::<f32>();
    let mut tex_coords : Vec<f32> = Vec::with_capacity(vertex_data.len() * 2);

    for v in vertex_data.into_iter() {
      tex_coords.extend(&v.tex_coords);
    }

    unsafe {
      let tex_coords_ptr = tex_coords.as_ptr() as *const c_void;

      gl::BufferData(
        gl::ARRAY_BUFFER,
        size as isize,
        tex_coords_ptr,
        gl::STATIC_DRAW,
      );

      let name : CString = CString::new("vTextureCoord").expect("string is correct");
      let name_ptr : *const c_char = name.as_ptr() as *const c_char;

      let loc = gl::GetAttribLocation(shader_id, name_ptr);
      println!("Attrib location: {}", loc);

      gl::EnableVertexAttribArray(loc as u32);

      gl::VertexAttribPointer(loc as u32, 2, gl::FLOAT, gl::FALSE, 0, null());

      // TODO: This is in my old OpenGL program, but not the rust package?
      //gl::TexCoordPointer(2, gl::FLOAT, 0, tex_coords_ptr);
    }
  }

  pub fn load_texture(&mut self, filename: &str, texture_uniform: &Uniform) -> AnyhowResult<()> {
    let img = image::open(&filename)?;

    let rgba_image= img.to_rgba();

    let width = rgba_image.width();
    let height = rgba_image.height();

    //let flat_samples = rgba_image.into_flat_samples();
    //let pixel_data = flat_samples.samples.as_ptr() as *const c_void;

    let img_data = rgba_image.into_raw();
    let pixel_data = img_data.as_ptr() as *const c_void;

    self.texture.bind_as_texture_2d();

    println!("Loading texture into OpenGL {}x{}...", width, height);

    unsafe {
      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::LINEAR as i32);
      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::LINEAR as i32);

      gl::TexImage2D(
        gl::TEXTURE_2D,
        0,
        gl::RGBA as i32,
        width as i32,
        height as i32,
        0,
        gl::RGBA,
        gl::UNSIGNED_BYTE,
        pixel_data,
      );

      gl::GenerateMipmap(gl::TEXTURE_2D);

      println!("texture uniform: {}", texture_uniform.id());

      // TODO: This is in my OpenGL program, but is broken here.
      //gl::Uniform1i(texture_uniform.id(), 0);

      gl::ActiveTexture(gl::TEXTURE0);
    }

    Ok(())
  }

  pub fn draw(&self) {
    self.vao.bind();
    unsafe {
      gl::DrawArrays(gl::TRIANGLES, 0, self.num_vertices as i32);
    }
  }
}

