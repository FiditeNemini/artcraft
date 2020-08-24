//! This is a port of Microsoft's libk4a `k4apointcloudrenderer.cpp`.
//! This provides the visual output.

use anyhow::Result as AnyhowResult;
use arcball::ArcballCamera;
use crate::assets::obj_loader::{load_wavefront, ExtractedVertex};
use crate::assets::renderable_object::RenderableObject;
use crate::files::read_file_string_contents::read_file_string_contents;
use crate::files::write_to_file_from_byte_ptr::write_to_file_from_byte_ptr;
use crate::gui::mouse_camera_arcball::MouseCameraArcball;
use crate::opengl::compile_shader::compile_shader;
use crate::opengl::link_program::link_shader_program;
use crate::opengl::wrapper::buffer::Buffer;
use crate::opengl::wrapper::other_misc_wrapper::{gl_get_error, OpenGlError};
use crate::opengl::wrapper::texture::Texture;
use crate::opengl::wrapper::vertex_array::VertexArray;
use crate::point_cloud::debug::image_proxy::ImageProxy;
use crate::point_cloud::pixel_structs::BgraPixel;
use gl::types::*;
use gl;
use gltf::Gltf;
use std::ffi::CString;
use std::fmt::Formatter;
use std::fs::{File, OpenOptions};
use std::io::{Read, Write, BufReader};
use std::mem::size_of;
use std::os::raw::{c_char, c_void};
use std::path::Path;
use std::ptr::{null, null_mut};
use std::ptr;
use std::str;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use tobj::{load_obj, load_mtl};
use crate::assets::positionable_object::PositionableObject;
use cgmath::{Matrix4, SquareMatrix, Matrix};
use crate::opengl::wrapper::uniform::Uniform;
use crate::opengl::matrices::{initial_projection_matrix_4x4_flat, initial_view_matrix_4x4_flat, identity_matrix_4x4, initial_view_matrix_4x4, initial_projection_matrix_4x4};
use image::DynamicImage;
use crate::opengl::wrapper::attribute::Attribute;
use nalgebra::RealField;
use cgmath::num_traits::ToPrimitive;

pub type Result<T> = std::result::Result<T, PointCloudRendererError>;

#[derive(Clone, Debug)]
pub enum PointCloudRendererError {
  OpenGlError(OpenGlError),
  UnknownError,
}

impl From<OpenGlError> for PointCloudRendererError {
  fn from(error: OpenGlError) -> Self {
    PointCloudRendererError::OpenGlError(error)
  }
}

impl std::fmt::Display for PointCloudRendererError {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    let description = match self {
      PointCloudRendererError::OpenGlError(inner) => {
        format!("Renderer OpenGL error: {}", inner)
      },
      PointCloudRendererError::UnknownError => "Unknown Renderer Error".into(),
    };

    write!(f, "{}", description)
  }
}

impl std::error::Error for PointCloudRendererError {
  fn source(&self) -> Option<&(dyn std::error::Error +'static)> {
    // Generic error, no backtrace.
    None
  }
}

pub struct PointCloudRenderer {
  num_cameras: usize,

  arcball_camera: Arc<Mutex<MouseCameraArcball>>,

  /// The OpenGL program
  shader_program_id: GLuint,
  /// The OpenGL vertex shader
  vertex_shader_id: GLuint,
  /// The OpenGL fragment shader
  fragment_shader_id: GLuint,

  // TODO: better matrix types
  view: [f32; 16],
  projection: [f32; 16],
  view_matrix: [[f32; 4]; 4],
  projection_matrix: [[f32; 4]; 4],
  /// Matrix applied to each model
  /// If a model doesn't set its own, it defaults to identity matrix
  default_model_view_matrix: [[f32; 4]; 4],

  /// Renderer setting: size of the rendered points
  point_size: u8,
  /// Renderer setting: shading enabled
  enable_shading: bool,
  /// Uniform location in the shader program.
  enable_shading_index: GLint,

  /// Point array size
  vertex_arrays_size_bytes: Vec<GLsizei>,

  /// Uniform location in the shader program.
  view_transform_id: Uniform,
  /// Uniform location in the shader program.
  projection_transform_id: Uniform,
  /// Uniform location in the shader program.
  model_transform_id: Uniform,

  /// Uniform for object textures in the shader program.
  object_texture_uniform: Uniform,
  /// Location of the texture coordinate input
  texture_coordinates_attribute: Attribute,

  /// Uniform location in the shader program.
  point_cloud_texture_indices: Vec<GLint>,
  /// 'in vec4 inColor'
  color_vertex_attribute_location: GLint,

  vertex_array_objects: Vec<VertexArray>,
  vertex_color_buffer_objects: Vec<Buffer>,

  renderable_objects: Vec<PositionableObject>
}


impl PointCloudRenderer {

  pub fn new(num_cameras: usize, arcball: Arc<Mutex<MouseCameraArcball>>) -> AnyhowResult<Self> {
    unsafe {
      gl::Enable(gl::PROGRAM_POINT_SIZE);
    }

    let program_id = unsafe { gl::CreateProgram() };

    let mut point_cloud_vertex_shader = read_file_string_contents("src/point_cloud/shaders/point_cloud_vertex_shader.glsl").unwrap();
    let mut point_cloud_fragment_shader = read_file_string_contents("src/point_cloud/shaders/point_cloud_fragment_shader.glsl").unwrap();

    //let mut point_cloud_vertex_shader = read_file_string_contents("src/point_cloud/shaders/simple_vertex_shader.glsl").unwrap();

    let vertex_shader_id = compile_shader(&point_cloud_vertex_shader, gl::VERTEX_SHADER);
    let fragment_shader_id = compile_shader(&point_cloud_fragment_shader, gl::FRAGMENT_SHADER);

    link_shader_program(program_id, vertex_shader_id, fragment_shader_id);

    /// Uniform variable name in OpenGL shader program
    let ENABLE_SHADING : CString = CString::new("enableShading").expect("string is correct");
    let ENABLE_SHADING_PTR : *const c_char = ENABLE_SHADING.as_ptr() as *const c_char;

    /// Uniform variable name in OpenGL shader program
    let POINT_CLOUD_0 : CString = CString::new("pointCloudTexture0").expect("string is correct");
    let POINT_CLOUD_0_PTR : *const c_char = POINT_CLOUD_0.as_ptr() as *const c_char;

    let POINT_CLOUD_1 : CString = CString::new("pointCloudTexture1").expect("string is correct");
    let POINT_CLOUD_1_PTR : *const c_char = POINT_CLOUD_1.as_ptr() as *const c_char;

    let COLOR_LOCATION : CString = CString::new("inColor").expect("string is correct");
    let COLOR_LOCATION_PTR : *const c_char = COLOR_LOCATION.as_ptr() as *const c_char;

    let mut point_cloud_texture_indices = Vec::with_capacity(num_cameras);

    let mut view_index = 0;
    let mut projection_index = 0;
    let mut enable_shading_index = 0;

    unsafe {
      // This function returns -1 if name does not correspond to an active uniform variable in
      // program, if name starts with the reserved prefix "gl_", or if name is associated with an
      // atomic counter or a named uniform block.
      // FIXME: THe 'view' and 'projection' uniforms are not binding for some reason.
      enable_shading_index = gl::GetUniformLocation(program_id, ENABLE_SHADING_PTR);
      // TODO: This is hardcoded to 2
      point_cloud_texture_indices.push(gl::GetUniformLocation(program_id, POINT_CLOUD_0_PTR));
      point_cloud_texture_indices.push(gl::GetUniformLocation(program_id, POINT_CLOUD_1_PTR));
    }

    let model_transform = Uniform::lookup("model", program_id)?;
    let view_transform = Uniform::lookup("view", program_id)?;
    let projection_transform = Uniform::lookup("projection", program_id)?;

    let object_texture_uniform = Uniform::lookup("objTexture", program_id)?;

    let texture_coordinate_attribute = Attribute::lookup("vTextureCoord", program_id)?;

    let color_vertex_attribute_location = unsafe {
      let location = gl::GetAttribLocation(program_id, COLOR_LOCATION_PTR);

      gl::EnableVertexAttribArray(location as u32);

      gl::VertexAttribPointer(
        location as u32,
        gl::BGRA as i32,
        gl::UNSIGNED_BYTE,
        gl::TRUE,
        0 as i32,
        0 as *const c_void,
      );

      location
    };

    Ok(Self {
      num_cameras,
      arcball_camera: arcball,
      view: initial_view_matrix_4x4_flat(),
      projection: initial_projection_matrix_4x4_flat(),
      view_matrix: initial_view_matrix_4x4(),
      projection_matrix: initial_projection_matrix_4x4(),
      default_model_view_matrix: identity_matrix_4x4(),
      shader_program_id: program_id,
      vertex_shader_id,
      fragment_shader_id,
      object_texture_uniform,
      texture_coordinates_attribute: texture_coordinate_attribute,
      point_size: 1,
      enable_shading: false,
      view_transform_id: view_transform,
      projection_transform_id: projection_transform,
      model_transform_id: model_transform,
      enable_shading_index,
      point_cloud_texture_indices,
      vertex_array_objects: Vec::with_capacity(num_cameras),
      vertex_arrays_size_bytes : Vec::with_capacity(num_cameras),
      vertex_color_buffer_objects: Vec::with_capacity(num_cameras),
      color_vertex_attribute_location,
      renderable_objects: Vec::new(),
    })
  }

  ///
  /// Run once to set up initial rendering
  ///
  pub fn setup_rendering(&mut self) -> AnyhowResult<()> {
    for _ in 0 .. self.num_cameras {
      let vao = VertexArray::new_initialized();
      vao.bind();
      self.vertex_array_objects.push(vao);

      let buffer = Buffer::new_initialized();
      self.vertex_color_buffer_objects.push(buffer);
      self.vertex_arrays_size_bytes.push(0);
    }

    // Extra assets

    // Following model fails in two libraries:
    //let filename = "/home/bt/dev/storyteller/assets/zelda_oot_n64_logo/N square.obj";

    //let filename = "/home/bt/dev/storyteller/assets/gamecube_ssbm_pichu/Pichu/pichu.obj"; // CRASH!
    //let filename = "/home/bt/dev/storyteller/assets/level_n64_mario64_whomps_fortress/WF.obj"; // DOESN'T WORK?
    let filename = "/home/bt/dev/storyteller/assets/gamecube_ssbm_pichu/Pichu/singletex/pichu.obj";
    let filename = "/home/bt/dev/storyteller/assets/n64_smash_bros/pika.obj"; // MISSHAPEN!
    let filename = "/home/bt/dev/storyteller/assets/n64_pokemon_snap_bulbasaur/Bulbasaur/bulbasaur.obj";

    {
      let filename = "/home/bt/dev/storyteller/assets/bundled/n64_mario64_yoshi/yoshi.obj";

      let path = Path::new(filename);
      let mut renderable_object = RenderableObject::from_wavefront(
        &path, self.shader_program_id)?;


      let filename = "/home/bt/dev/storyteller/assets/bundled/n64_mario64_yoshi/yoshi_grp.png";

      renderable_object.load_texture(filename, &self.object_texture_uniform)?;

      let mut positionable_object = PositionableObject::new(renderable_object);

      positionable_object.translate(-5.0, 0.0, 15.0);
      positionable_object.flip_y(); // flipping y and z rights the model.
      positionable_object.flip_z();
      positionable_object.scale_nonuniform(2.0, 1.0, 0.5);

      self.renderable_objects.push(positionable_object);

      /*let filename = "/home/bt/dev/storyteller/assets/n64_mario64/yoshi.mtl";

      let (materials, unknown) = load_mtl(filename)?;

      for material in materials.iter() {
        println!("name {:?}", material.name);
        println!("am {:?}", material.ambient_texture);
        println!("norm {:?}", material.normal_texture);
        println!("dis {:?}", material.dissolve_texture);
      }

      for (k, v) in unknown.iter() {
        println!("k: {:?}", k);
        println!("v: {:?}", v);
      }*/

      /*let filename = "/home/bt/dev/storyteller/assets/n64_mario64/yoshi_grp.png";

      let img = image::open(&filename)?;

      if let DynamicImage::ImageRgba8(img) = img {
        println!("Image rgba8");

        let flat_samples = img.into_flat_samples();
        let ptr = flat_samples.samples.as_ptr();
      }*/



    }

    {
      let filename = "/home/bt/dev/storyteller/assets/bundled/gamecube_ssbm_pichu/pichu.obj";

      let path = Path::new(filename);
      let mut renderable_object = RenderableObject::from_wavefront(
        &path, self.shader_program_id)?;

      let filename = "/home/bt/dev/storyteller/assets/bundled/gamecube_ssbm_pichu/pichu.png";
      renderable_object.load_texture(filename, &self.object_texture_uniform)?;

      let mut positionable_object = PositionableObject::new(renderable_object);

      positionable_object.translate(5.0, 2.0, 20.0);
      positionable_object.flip_y(); // flipping y and z rights the model.
      positionable_object.flip_z();
      positionable_object.scale(0.05);

      self.renderable_objects.push(positionable_object);
    }

    {
      let filename = "/home/bt/dev/storyteller/assets/bundled/n64_zelda_oot_king_dodongo/King_Dodongo.obj";

      let path = Path::new(filename);
      let mut renderable_object = RenderableObject::from_wavefront(
        &path, self.shader_program_id)?;

      let filename = "/home/bt/dev/storyteller/assets/bundled/n64_zelda_oot_king_dodongo/King_Dodongo_grp.png";
      renderable_object.load_texture(filename, &self.object_texture_uniform)?;

      let mut positionable_object = PositionableObject::new(renderable_object);

      positionable_object.translate(5.0, -10.0, 20.0);
      positionable_object.scale(0.1);
      positionable_object.flip_z();
      //positionable_object.scale(0.5);

      self.renderable_objects.push(positionable_object);
    }

    {
      let filename = "/home/bt/dev/storyteller/assets/bundled/n64_zelda_oot_poe/poe.obj";

      let path = Path::new(filename);
      let mut renderable_object = RenderableObject::from_wavefront(
        &path, self.shader_program_id)?;

      let filename = "/home/bt/dev/storyteller/assets/bundled/n64_zelda_oot_poe/poe_grp.png";
      renderable_object.load_texture(filename, &self.object_texture_uniform)?;

      let mut positionable_object = PositionableObject::new(renderable_object);

      positionable_object.translate(-5.0, -10.0, 20.0);
      positionable_object.scale(2.5);
      positionable_object.flip_y();
      positionable_object.flip_z();
      //positionable_object.scale(0.5);

      self.renderable_objects.push(positionable_object);
    }


    /*let filename = "/home/bt/dev/storyteller/assets/vr_staircase/scene.gltf";
    let gltf = Gltf::open(filename)?;
    for ref scene in gltf.scenes() {
      println!("Scene: {}", scene.index());
      for ref node in scene.nodes() {
        println!("Node: {} children: {}", node.index(), node.children().count());
      }
    }*/

    Ok(())
  }

  ///
  /// Update the view matrices
  ///
  pub fn update_view_projection(&mut self, view: [[f32; 4]; 4], _projection: [[f32; 4]; 4]) {
    self.view_matrix = view;
    self.projection_matrix = initial_projection_matrix_4x4();
  }

  ///
  ///
  ///
  pub fn update_point_clouds(&mut self,
                             color_images: &Vec<ImageProxy>,
                             point_cloud_textures: &Vec<Texture>) -> Result<()>
  {
    for i in 0 .. self.num_cameras  {
      let color_image_bytes = color_images.get(i).unwrap();
      let color_image_size_bytes = color_image_bytes.len() as i32;

      let vao = self.vertex_array_objects.get(i).unwrap();
      let vertex_color_buffer = self.vertex_color_buffer_objects.get(i).unwrap();
      let mut vertex_array_size_bytes = self.vertex_arrays_size_bytes.get_mut(i).unwrap();

      vao.bind();
      vertex_color_buffer.bind_as_array_buffer();

      //if *vertex_array_size_bytes != color_image_size_bytes {
        //println!("Establishing buffer");
        unsafe {
          gl::BufferData(
            gl::ARRAY_BUFFER,
            color_image_size_bytes as isize,
            null(),
            gl::STREAM_DRAW
          );
        }
        *vertex_array_size_bytes = color_image_size_bytes;
      //}

      let vertex_mapped_buffer = unsafe {
        gl::MapBufferRange(
          gl::ARRAY_BUFFER,
          0,
          color_image_size_bytes as isize,
          gl::MAP_WRITE_BIT | gl::MAP_INVALIDATE_BUFFER_BIT
        ) as *mut u8
      };

      // if vertex_mapped_buffer as usize == 0 {
      //   let error = gl_get_error().expect_err("should be map buffer range error");
      //   return Err(PointCloudRendererError::OpenGlError(error));
      // }

      let result = unsafe {
        // NB: This is the working texturing:
        std::ptr::copy_nonoverlapping::<u8>(
          color_image_bytes.as_ptr(),
          vertex_mapped_buffer,
          color_image_size_bytes as usize);

        gl::UnmapBuffer(gl::ARRAY_BUFFER)
      };

      // if result == gl::FALSE {
      //   let error = gl_get_error().expect_err("should be unmap buffer error");
      //   return Err(PointCloudRendererError::OpenGlError(error));
      // }

      // THIS IS THE POINT CLOUD
      let point_cloud_texture = point_cloud_textures.get(i).unwrap();
      unsafe {
        gl::BindTexture(gl::TEXTURE_2D, point_cloud_texture.id());
        gl::BindImageTexture(
          i as GLuint, // image unit (zero-indexed) // TODO - why does it work this way?
          point_cloud_texture.id(), // texture
          0, // level
          gl::FALSE, // layered
          0, // layer
          gl::READ_ONLY, // access
          gl::RGBA32F, //POINT_CLOUD_TEXTURE_FORMAT,
        );

        gl::ActiveTexture(gl::TEXTURE0);

        gl::EnableVertexAttribArray(self.color_vertex_attribute_location as u32);

        gl::VertexAttribPointer(
          self.color_vertex_attribute_location as u32,
          gl::BGRA as i32,
          gl::UNSIGNED_BYTE,
          gl::TRUE,
          0 as i32,
          0 as *const c_void,
        );
      }
    }

    unsafe {
      gl::BindVertexArray(0);
    }

    gl_get_error()
        .map_err(|err| PointCloudRendererError::OpenGlError(err))
  }

  ///
  ///
  ///
  pub fn render(&mut self) -> Result<()> {
    // Animate the models.
    for obj in self.renderable_objects.iter_mut() {
      obj.increment_rotation_y(0.05); // TODO: Should be based on wall clock instead
    }

    unsafe {
      gl::UseProgram(self.shader_program_id);

      gl::Enable(gl::DEPTH_TEST);
      gl::Enable(gl::BLEND);
      gl::BlendFunc(gl::SRC_ALPHA, gl::ONE_MINUS_SRC_ALPHA);
      gl::PointSize(self.point_size as f32);

      // Update view/projection matrices in shader
      let typed_projection = self.projection_matrix.as_ptr() as *const GLfloat;
      gl::UniformMatrix4fv(self.projection_transform_id.id(), 1, gl::FALSE, typed_projection);

      let typed_view = self.view_matrix.as_ptr() as *const GLfloat;
      gl::UniformMatrix4fv(self.view_transform_id.id(), 1, gl::FALSE, typed_view);

      // Default model transform
      let typed_model_view = self.default_model_view_matrix.as_ptr() as *const GLfloat;
      gl::UniformMatrix4fv(self.model_transform_id.id(), 1, gl::FALSE, typed_model_view);

      // Update render settings in shader
      let _enable_shading = if self.enable_shading { 1 } else { 0 };
      let enable_shading = 0; // TODO FIXME FIXME FIXME

      gl::Uniform1i(self.enable_shading_index, enable_shading);

      /*for i in 0 .. self.num_cameras {
        let vao = self.vertex_array_objects.get(i).unwrap();
        let vertex_array_size_bytes = self.vertex_arrays_size_bytes.get(i).unwrap();
        let size = vertex_array_size_bytes / size_of::<BgraPixel>() as i32;

        vao.bind();
        gl::DrawArrays(gl::POINTS, 0, size);
      }*/

      gl::BindVertexArray(0);

      for positionable in self.renderable_objects.iter() {
        positionable.draw(self.model_transform_id);
      }


      gl_get_error()
          .map_err(|err| PointCloudRendererError::OpenGlError(err))
    }
  }

  pub fn set_point_size(&mut self, point_size: u8) {
    self.point_size = point_size;
  }

  pub fn set_enable_shading(&mut self, enable_shading: bool) {
    self.enable_shading = enable_shading;
  }
}

// TODO: This is useful to write solid colors instead of webcam color data
// std::ptr::copy::<u8>(color_src, vertex_mapped_buffer as *mut u8, color_image_size_bytes as usize);
// std::ptr::write_bytes(vertex_mapped_buffer, 255, color_image_size_bytes as usize);

