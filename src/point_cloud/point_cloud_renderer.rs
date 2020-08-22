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
use tobj::load_obj;
use crate::assets::positionable_object::PositionableObject;
use cgmath::{Matrix4, SquareMatrix, Matrix};

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

  /// Point array size
  vertex_arrays_size_bytes: Vec<GLsizei>,

  /// Uniform location in the shader program.
  view_index: GLint,

  /// Uniform location in the shader program.
  projection_index: GLint,

  /// Uniform location in the shader program.
  model_view_index: GLint,

  /// Uniform location in the shader program.
  enable_shading_index: GLint,

  /// Uniform location in the shader program.
  point_cloud_texture_indices: Vec<GLint>,

  vertex_array_objects: Vec<VertexArray>,
  vertex_color_buffer_objects: Vec<Buffer>,

  /// 'in vec4 inColor'
  color_vertex_attribute_location: GLint,

  renderable_object: Option<PositionableObject>
}

const fn translation_matrix_4x4(x: f32, y: f32, z: f32) -> [f32; 16] {
  return [
    1.0, 0.0, 0.0, x,
    0.0, 1.0, 0.0, y,
    0.0, 0.0, 1.0, z,
    0.0, 0.0, 0.0, 1.0,
  ];
}

const fn identity_matrix_4x4() -> [f32; 16] {
  return [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
  ];
}

const fn zero_matrix_4x4() -> [f32; 16] {
  return [
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
  ];
}

/// This is the view matrix k4aviewer starts with
const fn initial_view_matrix_4x4() -> [f32; 16] {
  return [
    -1.0,         0.0,    8.74228e-08, 0.0,
    0.0,          1.0,    0.0,         0.0,
    -8.74228e-08, 0.0,    -1.0,        0.0,
    2.62268e-07,  1.0,    -5.0,        1.0,
  ];
}

/// This is the projection matrix k4aviewer starts with
const fn initial_projection_matrix_4x4() -> [f32; 16] {
  return [
    1.41272,    0.0,      0.0,      0.0,
    0.0,        1.56969,  0.0,      0.0,
    0.0,        0.0,      -1.002,   -1.0,
    0.0,        0.0,      -0.2002,  0.0,
  ];
}

impl PointCloudRenderer {

  pub fn new(num_cameras: usize, arcball: Arc<Mutex<MouseCameraArcball>>) -> Self {
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
    let VIEW : CString = CString::new("view").expect("string is correct");
    let VIEW_PTR : *const c_char = VIEW.as_ptr() as *const c_char;

    /// Uniform variable name in OpenGL shader program
    let PROJECTION : CString = CString::new("projection").expect("string is correct");
    let PROJECTION_PTR : *const c_char = PROJECTION.as_ptr() as *const c_char;

    /// Uniform variable name in OpenGL shader program
    let MODEL_VIEW : CString = CString::new("modelView").expect("string is correct");
    let MODEL_VIEW_PTR : *const c_char = MODEL_VIEW.as_ptr() as *const c_char;

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
    let mut model_view_index = 0;
    let mut enable_shading_index = 0;

    unsafe {
      // This function returns -1 if name does not correspond to an active uniform variable in
      // program, if name starts with the reserved prefix "gl_", or if name is associated with an
      // atomic counter or a named uniform block.
      // FIXME: THe 'view' and 'projection' uniforms are not binding for some reason.
      view_index = gl::GetUniformLocation(program_id, VIEW_PTR);
      projection_index = gl::GetUniformLocation(program_id, PROJECTION_PTR);
      model_view_index = gl::GetUniformLocation(program_id, MODEL_VIEW_PTR);
      enable_shading_index = gl::GetUniformLocation(program_id, ENABLE_SHADING_PTR);
      // TODO: This is hardcoded to 2
      point_cloud_texture_indices.push(gl::GetUniformLocation(program_id, POINT_CLOUD_0_PTR));
      point_cloud_texture_indices.push(gl::GetUniformLocation(program_id, POINT_CLOUD_1_PTR));
    }

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

    let initial_view = [
      [-1.0,         0.0,    8.74228e-08, 0.0],
      [0.0,          1.0,    0.0,         0.0],
      [-8.74228e-08, 0.0,    -1.0,        0.0],
      [2.62268e-07,  1.0,    -5.0,        1.0],
    ];

    let initial_projection = [
      [1.41272,    0.0,      0.0,      0.0],
      [0.0,        1.56969,  0.0,      0.0],
      [0.0,        0.0,      -1.002,   -1.0],
      [0.0,        0.0,      -0.2002,  0.0],
    ];

    let default_model_view_matrix= [
      [1.0,  0.0,  0.0,  0.0],
      [0.0,  1.0,  0.0,  0.0],
      [0.0,  0.0,  1.0,  0.0],
      [0.0,  0.0,  0.0,  1.0],
    ];

    Self {
      num_cameras,
      arcball_camera: arcball,
      view: initial_view_matrix_4x4(),
      projection: initial_projection_matrix_4x4(),
      view_matrix: initial_view,
      projection_matrix: initial_projection,
      default_model_view_matrix,
      shader_program_id: program_id,
      vertex_shader_id,
      fragment_shader_id,
      point_size: 1,
      enable_shading: false,
      view_index,
      projection_index,
      model_view_index,
      enable_shading_index,
      point_cloud_texture_indices,
      vertex_array_objects: Vec::with_capacity(num_cameras),
      vertex_arrays_size_bytes : Vec::with_capacity(num_cameras),
      vertex_color_buffer_objects: Vec::with_capacity(num_cameras),
      color_vertex_attribute_location,
      renderable_object: None,
    }
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
    let filename = "/home/bt/dev/storyteller/assets/n64_mario64/yoshi.obj";

    let path = Path::new(filename);
    let renderable_object = RenderableObject::from_wavefront(
      &path, self.shader_program_id)?;

    let mut positionable_object = PositionableObject::new(renderable_object);

    positionable_object.translate(0.0, 0.0, 50.0);
    positionable_object.rotate(180.0, 0.0, 50.0);

    self.renderable_object = Some(positionable_object);

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
    //self.projection_matrix = projection;

    let initial_projection = [
      [1.41272,    0.0,      0.0,      0.0],
      [0.0,        1.56969,  0.0,      0.0],
      [0.0,        0.0,      -1.002,   -1.0],
      [0.0,        0.0,      -0.2002,  0.0],
    ];

    // Initial: [[1.41272,    0.0, 0.0, 0.0], [0.0, 1.56969,   0.0, 0.0], [0.0, 0.0, -1.002,    -1.0],       [0.0, 0.0, -0.2002, 0.0]]
    // Updated: [[0.88294804, 0.0, 0.0, 0.0], [0.0, 1.5696855, 0.0, 0.0], [0.0, 0.0, -1.002002, -0.2002002], [0.0, 0.0, -1.0,    0.0]]

    self.projection_matrix = initial_projection;
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
  pub fn render(&self) -> Result<()> {
    unsafe {
      gl::UseProgram(self.shader_program_id);

      gl::Enable(gl::DEPTH_TEST);
      gl::Enable(gl::BLEND);
      gl::BlendFunc(gl::SRC_ALPHA, gl::ONE_MINUS_SRC_ALPHA);
      gl::PointSize(self.point_size as f32);

      // Update view/projection matrices in shader
      let typed_projection = self.projection_matrix.as_ptr() as *const GLfloat;
      gl::UniformMatrix4fv(self.projection_index, 1, gl::FALSE, typed_projection);

      let typed_view = self.view_matrix.as_ptr() as *const GLfloat;
      gl::UniformMatrix4fv(self.view_index, 1, gl::FALSE, typed_view);


      let mut use_default_model_view = true;

      if let Some(ref renderable) = self.renderable_object {
        if renderable.is_transformed {
          //let mut transformation : Matrix4<f32> = Matrix4::identity();
          //let typed_model_view = transformation.as_ptr();
          //gl::UniformMatrix4fv(self.model_view_index, 1, gl::FALSE, typed_model_view);

          use_default_model_view = false;
        }
      }

      if use_default_model_view {
        let typed_model_view = self.default_model_view_matrix.as_ptr() as *const GLfloat;
        gl::UniformMatrix4fv(self.model_view_index, 1, gl::FALSE, typed_model_view);
      }

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

      if let Some(ref renderable) = self.renderable_object {
        renderable.draw(self.model_view_index);
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

