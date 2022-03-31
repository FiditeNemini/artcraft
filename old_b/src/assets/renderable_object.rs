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
use image::{DynamicImage, Pixel, Rgba, RgbaImage, ImageBuffer, RgbImage};
use crate::opengl::wrapper::uniform::Uniform;
use image::imageops::{flip_horizontal, flip_vertical};
use crate::opengl::wrapper::attribute::Attribute;

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

  pub fn set_vertex_type(&mut self, vertex_type: &Uniform) {
    /*self.vao.bind();
    let loc = vertex_type.id();
    println!("Uniform location: {}", loc);

    unsafe {
      //gl::EnableVertexAttribArray(loc as u32);
      //gl::VertexAttribIPointer(loc as u32, 1, gl::UNSIGNED_BYTE, 0, null());
      //gl::VertexAttribI1ui(loc as u32, 0);
      //gl::Uniform1i(loc, 1);
    }*/

    //vertex_type.set_uint(0);
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

  // TODO: Option for 'rgb'/'rgba'
  // TODO: Option to flip texture on any axis
  pub fn load_texture(&mut self, filename: &str, texture_uniform: &Uniform) -> AnyhowResult<()> {
    let img = image::open(&filename)?;

    let mut rgba_image= img.to_rgba();

    //let rgb_image : RgbImage = flip_horizontal(&rgb_image);
    let rgba_image : RgbaImage = flip_vertical(&rgba_image);

    let width = rgba_image.width();
    let height = rgba_image.height();

    let img_data = rgba_image.into_raw();
    let pixel_data = img_data.as_ptr() as *const c_void;

    self.texture.bind_as_texture_2d();

    println!("Loading texture into OpenGL {}x{}...", width, height);

    unsafe {
      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::LINEAR as i32);
      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::LINEAR as i32);

      //gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_S, gl::REPEAT as i32);
      //gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_T, gl::REPEAT as i32);
      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_S, gl::CLAMP_TO_BORDER as i32);
      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_T, gl::CLAMP_TO_BORDER as i32);

      let border_color : Vec<f32> = vec![0.0, 1.0, 0.0, 1.0];
      let border_color_ptr = border_color.as_ptr() as *const f32;
      gl::TexParameterfv(gl::TEXTURE_2D, gl::TEXTURE_BORDER_COLOR, border_color_ptr);

      gl::TexImage2D(
        gl::TEXTURE_2D,
        0, // image level (mipmap); 0 is base
        gl::RGBA as i32, // internal format
        width as i32,
        height as i32,
        0, // border; "must be 0"
        gl::RGBA, // format of pixels
        gl::UNSIGNED_BYTE, // pixel data type
        pixel_data,
      );

      /*
      // Checkerboard texture.
      let pixels : Vec<f32> = vec![
        0.0, 0.0, 0.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
      ];

      let pixels_ptr = pixels.as_ptr() as *const c_void;

      gl::TexImage2D(
        gl::TEXTURE_2D,
        0, // image level (mipmap); 0 is base
        gl::RGBA as i32, // internal format
        2,
        2,
        0, // border; "must be 0"
        gl::RGBA, // format of pixels
        gl::FLOAT, // pixel data type
        pixels_ptr,
      );
      */

      gl::GenerateMipmap(gl::TEXTURE_2D);

      println!("texture uniform: {}", texture_uniform.id());

      // TODO: This is in my OpenGL program, but is broken here.
      //gl::Uniform1i(texture_uniform.id(), 0);

      gl::ActiveTexture(gl::TEXTURE0);
    }

    Ok(())
  }

  pub fn draw(&self, vao_already_bound: bool) {
    if !vao_already_bound {
      self.vao.bind();
    }
    unsafe {
      gl::BindTexture(gl::TEXTURE_2D, self.texture.id());

      gl::DrawArrays(gl::TRIANGLES, 0, self.num_vertices as i32);
    }
  }
}

