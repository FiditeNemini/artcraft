//! This is a port of Microsoft's libk4a `k4apointcloudrenderer.cpp`.
//! This provides the visual output.

use std::ffi::CString;
use std::fmt::Formatter;
use std::mem::size_of;
use std::os::raw::{c_char, c_void};
use std::path::Path;
use std::ptr::{null, null_mut};
use std::ptr;
use std::str;
use std::sync::{Arc, Mutex};

use anyhow::Result as AnyhowResult;
use arcball::ArcballCamera;
use gl::types::*;
use gl;

use gui::mouse_camera_arcball::MouseCameraArcball;
use opengl::compile_shader::compile_shader;
use opengl::opengl_wrapper::Texture;
use opengl::opengl_wrapper::{Buffer, gl_get_error, OpenGlError, VertexArray};
use point_cloud::pixel_structs::BgraPixel;
use std::time::{SystemTime, UNIX_EPOCH};
use std::fs::{File, OpenOptions};
use std::io::{Read, Write};
use opengl::link_program::link_shader_program;
use point_cloud::debug::image_proxy::ImageProxy;
use files::read_file_string_contents::read_file_string_contents;
use files::write_to_file_from_byte_ptr::write_to_file_from_byte_ptr;

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

// TODO: Going to experiment with rendering more things.
pub struct RenderableObject {
  vao : GLuint,
  color_buffer : GLuint,
  buffered: bool,
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
  enable_shading_index: GLint,

  /// Uniform location in the shader program.
  point_cloud_texture_indices: Vec<GLint>,

  vertex_array_objects: Vec<VertexArray>,
  vertex_color_buffer_objects: Vec<Buffer>,

  vertex_attrib_locations: Vec<GLint>,

  renderable_objects: Vec<RenderableObject>,
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
    // Context Settings
    unsafe {
      gl::Enable(gl::PROGRAM_POINT_SIZE);
    }

    let program_id = unsafe { gl::CreateProgram() };

    let mut point_cloud_vertex_shader = read_file_string_contents("src/point_cloud/shaders/point_cloud_vertex_shader.glsl").unwrap();
    let mut point_cloud_fragment_shader = read_file_string_contents("src/point_cloud/shaders/point_cloud_fragment_shader.glsl").unwrap();

    let vertex_shader_id = compile_shader(&point_cloud_vertex_shader, gl::VERTEX_SHADER);
    let fragment_shader_id = compile_shader(&point_cloud_fragment_shader, gl::FRAGMENT_SHADER);

    let ATTRIB_LOCATION_0 : CString = CString::new("inColor0").expect("string is correct");
    let ATTRIB_LOCATION_0_PTR : *const c_char = ATTRIB_LOCATION_0.as_ptr() as *const c_char;

    let ATTRIB_LOCATION_1 : CString = CString::new("inColor1").expect("string is correct");
    let ATTRIB_LOCATION_1_PTR : *const c_char = ATTRIB_LOCATION_1.as_ptr() as *const c_char;

    unsafe {
      // NB: These calls aren't necessary.
      //gl::BindAttribLocation(program_id, 1, ATTRIB_LOCATION_0_PTR);
      //gl::BindAttribLocation(program_id, 2, ATTRIB_LOCATION_1_PTR);
    }

    link_shader_program(program_id, vertex_shader_id, fragment_shader_id);

    /// Uniform variable name in OpenGL shader program
    let VIEW : CString = CString::new("view").expect("string is correct");
    let VIEW_PTR : *const c_char = VIEW.as_ptr() as *const c_char;

    /// Uniform variable name in OpenGL shader program
    let PROJECTION : CString = CString::new("projection").expect("string is correct");
    let PROJECTION_PTR : *const c_char = PROJECTION.as_ptr() as *const c_char;

    /// Uniform variable name in OpenGL shader program
    let ENABLE_SHADING : CString = CString::new("enableShading").expect("string is correct");
    let ENABLE_SHADING_PTR : *const c_char = ENABLE_SHADING.as_ptr() as *const c_char;

    /// Uniform variable name in OpenGL shader program
    let POINT_CLOUD_0 : CString = CString::new("pointCloudTexture0").expect("string is correct");
    let POINT_CLOUD_0_PTR : *const c_char = POINT_CLOUD_0.as_ptr() as *const c_char;

    let POINT_CLOUD_1 : CString = CString::new("pointCloudTexture1").expect("string is correct");
    let POINT_CLOUD_1_PTR : *const c_char = POINT_CLOUD_1.as_ptr() as *const c_char;

    let mut point_cloud_texture_indices = Vec::with_capacity(num_cameras);

    let mut view_index = 0;
    let mut projection_index = 0;
    let mut enable_shading_index = 0;

    unsafe {
      // This function returns -1 if name does not correspond to an active uniform variable in
      // program, if name starts with the reserved prefix "gl_", or if name is associated with an
      // atomic counter or a named uniform block.
      // FIXME: THe 'view' and 'projection' uniforms are not binding for some reason.
      view_index = gl::GetUniformLocation(program_id, VIEW_PTR);
      projection_index = gl::GetUniformLocation(program_id, PROJECTION_PTR);
      enable_shading_index = gl::GetUniformLocation(program_id, ENABLE_SHADING_PTR);
      // TODO: This is hardcoded to 2
      point_cloud_texture_indices.push(gl::GetUniformLocation(program_id, POINT_CLOUD_0_PTR));
      point_cloud_texture_indices.push(gl::GetUniformLocation(program_id, POINT_CLOUD_1_PTR));
    }

    // TODO: If this works, these could use grouping in a single struct.
    let mut vertex_array_objects = Vec::with_capacity(num_cameras);
    let mut vertex_color_buffer_objects = Vec::with_capacity(num_cameras);
    let mut vertex_arrays_size_bytes = Vec::with_capacity(num_cameras);

    // TODO: Holy crap, this might be the problem - not binding after create of VAO
    // TODO: Holy crap, this might be the problem - not binding after create of VAO
    // TODO: Holy crap, this might be the problem - not binding after create of VAO
    // TODO: Holy crap, this might be the problem - not binding after create of VAO
    for _ in 0 .. num_cameras {
      vertex_array_objects.push(VertexArray::new_initialized());
      vertex_color_buffer_objects.push(Buffer::new_initialized());
      vertex_arrays_size_bytes.push(0);
    }

    let mut vertex_attrib_locations = Vec::with_capacity(num_cameras);

    unsafe {
      let location_0 = gl::GetAttribLocation(program_id, ATTRIB_LOCATION_0_PTR);
      //let location_1 = gl::GetAttribLocation(program_id, ATTRIB_LOCATION_1_PTR);

      println!("Location0: {}", location_0);
      //println!("Location1: {}", location_1);

      vertex_attrib_locations.push(location_0);
      //vertex_attrib_locations.push(location_1);
    }

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

    Self {
      num_cameras,
      arcball_camera: arcball,
      view: initial_view_matrix_4x4(),
      projection: initial_projection_matrix_4x4(),
      view_matrix: initial_view,
      projection_matrix: initial_projection,
      shader_program_id: program_id,
      vertex_shader_id,
      fragment_shader_id,
      point_size: 1,
      enable_shading: false,
      renderable_objects: Vec::new(),
      vertex_arrays_size_bytes,
      view_index,
      projection_index,
      enable_shading_index,
      point_cloud_texture_indices,
      vertex_array_objects,
      vertex_color_buffer_objects,
      vertex_attrib_locations,
    }
  }

  ///
  /// Run once to set up initial rendering
  ///
  pub fn setup_rendering(&mut self) {

    /*unsafe {
      gl::UseProgram(self.shader_program_id);

      for i in 0..self.num_cameras {

        let mut vao: u32  = 0;
        gl::GenVertexArrays(1, &mut vao);

        println!("Gen Vao: {:?}", vao);

        gl::BindVertexArray(vao);

        let mut color_buffer: u32  = 0;
        gl::GenBuffers(1, &mut color_buffer);

        println!("Gen Color Buffer: {:?}", color_buffer);

        let renderable_object = RenderableObject {
          vao,
          color_buffer,
          buffered: false,
        };

        self.renderable_objects.push(renderable_object);

        gl::BindVertexArray(0);
      }
    }*/
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
                             point_cloud_textures: &Vec<Texture>
  ) -> Result<()> {

    /*
    for (i, obj) in self.renderable_objects.iter_mut().enumerate() {
      let color_image_bytes = color_images.get(i).unwrap();
      let color_image_size_bytes = color_image_bytes.len() as i32;

      unsafe {
        gl::BindVertexArray(obj.vao);
        gl::BindBuffer(gl::ARRAY_BUFFER, obj.color_buffer);

        if !obj.buffered {
          gl::BufferData(
            gl::ARRAY_BUFFER,
            color_image_size_bytes as isize,
            null(),
            gl::STREAM_DRAW
          );

          obj.buffered = true;
        }

        let vertex_mapped_buffer = unsafe {
          gl::MapBufferRange(
            gl::ARRAY_BUFFER,
            0,
            color_image_size_bytes as isize,
            gl::MAP_WRITE_BIT | gl::MAP_INVALIDATE_BUFFER_BIT
          ) as *mut u8
        };

        std::ptr::copy_nonoverlapping::<u8>(
          color_image_bytes.as_ptr(),
          vertex_mapped_buffer,
          color_image_size_bytes as usize);

        gl::UnmapBuffer(gl::ARRAY_BUFFER);
        gl::BindBuffer(gl::ARRAY_BUFFER, 0);
        gl::BindVertexArray(0);
      }
    }
     */

    let time = SystemTime::now();
    let time_since_epoch = time.duration_since(UNIX_EPOCH).unwrap();
    let seconds = time_since_epoch.as_secs();

    let (lower_range, upper_range)= if seconds % 10 > 4 {
      (1, 2)
    } else {
      (0, 1)
    };

    //let (lower_range, upper_range)  = (1, 2);

    let (lower_range, upper_range)  = (0, 2);

    //for i in 0 .. self.num_cameras  {
    for i in lower_range .. upper_range {
      let vertex_array_object = self.vertex_array_objects.get(i).unwrap();
      let vertex_color_buffer_object = self.vertex_color_buffer_objects.get(i).unwrap();
      let mut vertex_array_size_bytes = self.vertex_arrays_size_bytes.get_mut(i).unwrap();

      let color_image_bytes = color_images.get(i).unwrap();
      let color_image_size_bytes = color_image_bytes.len() as i32;

      unsafe {
        gl::BindVertexArray(vertex_array_object.id());
        // Vertex Colors
        gl::BindBuffer(gl::ARRAY_BUFFER, vertex_color_buffer_object.id());
      }

      if *vertex_array_size_bytes != color_image_size_bytes {
        println!("Establishing buffer");
        *vertex_array_size_bytes = color_image_size_bytes;

        unsafe {
          gl::BufferData(
            gl::ARRAY_BUFFER,
            *vertex_array_size_bytes as isize,
            null(),
            gl::STREAM_DRAW
          );
        }
      }

      let vertex_mapped_buffer = unsafe {
        gl::MapBufferRange(
          gl::ARRAY_BUFFER,
          0,
          color_image_size_bytes as isize,
          gl::MAP_WRITE_BIT | gl::MAP_INVALIDATE_BUFFER_BIT
        ) as *mut u8
      };

      if vertex_mapped_buffer as usize == 0 {
        let error = gl_get_error().expect_err("should be map buffer range error");
        return Err(PointCloudRendererError::OpenGlError(error));
      }

      let result = unsafe {
        /*if i == 9 {
          // TODO TESTING - writing pure white changes the color of the final output "line" to white:
          std::ptr::copy::<u8>(color_src, vertex_mapped_buffer as *mut u8, color_image_size_bytes as usize);
          std::ptr::write_bytes(vertex_mapped_buffer, 255, color_image_size_bytes as usize);
        } else {
        }*/

        // NB: This is the working texturing:
        std::ptr::copy_nonoverlapping::<u8>(
          color_image_bytes.as_ptr(),
          vertex_mapped_buffer,
          color_image_size_bytes as usize);

        gl::UnmapBuffer(gl::ARRAY_BUFFER)
      };

      if result == gl::FALSE {
        let error = gl_get_error().expect_err("should be unmap buffer error");
        return Err(PointCloudRendererError::OpenGlError(error));
      }

      let point_cloud_texture = point_cloud_textures.get(i).unwrap();

      // NB: This controls which geometry gets the texture/color data. If we hardcode it to
      // a single index, only one of the camera geometries gets shaded.
      //let i = j; // (SEE TABLE ABOVE)
      //let i = 1 - j; // (SEE TABLE ABOVE)
      //let i = if !swap { j } else { 1 - j }; // (in isolation) PUTS THE IMAGES ON BOTH POINTCLOUD GEOS!?

      unsafe {
        let vertex_attrib_location = self.vertex_attrib_locations.get(0).unwrap();

        // NB: Controling these indices change where the color bytes are uploaded
        gl::EnableVertexAttribArray(*vertex_attrib_location as u32);

        //let location = i;
        gl::VertexAttribPointer(
          *vertex_attrib_location as u32,
          gl::BGRA as i32,
          gl::UNSIGNED_BYTE,
          gl::TRUE,
          0 as i32,
          0 as *const c_void,
        );

        // NB: I believe these point cloud textures are the geometry itself. Not the color data.
        // I think the code here is *fine* because the point cloud structures are in-tact.

        // NB: This changes the point cloud geometry index.
        // Flipping them changes where in the scene the geometry winds up, since the 1st-indexed
        // geometry is given an offset.
        //if i == 1 { continue }
        //let i = 1 - j;
        //let i = if swap { j } else { 1 - j }; // swaps physical location of the geometry

        // // NB: it's okay to copy an i32, but this sucks
        // let point_cloud_texture_index = self.point_cloud_texture_indices.get(i).unwrap().clone();
        // gl::Uniform1i(point_cloud_texture_index, i as i32);

        // Bind our point cloud texture (which was written by the compute shader)
        //gl::ActiveTexture(gl::TEXTURE0 + i as GLuint + 2);
        //gl::ActiveTexture(gl::TEXTURE0);

        //
        // THIS IS THE POINT CLOUD
        //
        gl::BindTexture(gl::TEXTURE_2D, point_cloud_texture.id());
        gl::BindImageTexture(
          // https://www.khronos.org/opengl/wiki/Sampler_(GLSL) ?
          i as GLuint, // image unit (zero-indexed) // TODO - why? why does it work this way?
          point_cloud_texture.id(), // texture
          0, // level
          gl::FALSE, // layered
          0, // layer
          gl::READ_ONLY, // access
          gl::RGBA32F, //POINT_CLOUD_TEXTURE_FORMAT,
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
      gl::Enable(gl::DEPTH_TEST);
      gl::Enable(gl::BLEND);
      gl::BlendFunc(gl::SRC_ALPHA, gl::ONE_MINUS_SRC_ALPHA);
      gl::PointSize(self.point_size as f32);

      gl::UseProgram(self.shader_program_id);

      // Update view/projection matrices in shader
      let typed_projection = self.projection_matrix.as_ptr() as *const GLfloat;
      gl::UniformMatrix4fv(self.projection_index, 1, gl::FALSE, typed_projection);

      let typed_view = self.view_matrix.as_ptr() as *const GLfloat;
      gl::UniformMatrix4fv(self.view_index, 1, gl::FALSE, typed_view);

      // Update render settings in shader
      let _enable_shading = if self.enable_shading { 1 } else { 0 };
      let enable_shading = 0; // TODO FIXME FIXME FIXME

      gl::Uniform1i(self.enable_shading_index, enable_shading);

      let time = SystemTime::now();
      let time_since_epoch = time.duration_since(UNIX_EPOCH).unwrap();
      let seconds = time_since_epoch.as_secs();

      let (lower_range, upper_range)= if seconds % 10 > 4 {
        (1, 2)
      } else {
        (0, 1)
      };

      //let (lower_range, upper_range) = (0, 2);

      // Experiment: Only draw camera0_color (toggles between setup above)
      // First image: blank
      // Second image: perfect camera0
      // Third image: ZEBRA STRIPED camera1_geo, camera0_color
      let (lower_range, upper_range) = (0, 1);

      // Experiment: Only draw camera1_color (toggles between setup above)
      // First image blank
      // Second image: ZEBRA STRIPED camera1_geo + camera1_color
      // Third image: BLACK camera0_geo
      let (lower_range, upper_range) = (1, 2);


      // Experiment: Only draw camera1_color (both are setup above)
      // Only image: camera0_geo is present, but black; camera1_geo + camera1_color are perfect
      let (lower_range, upper_range) = (1, 2);


      // Experiment: Only draw camera0_color (both are setup above)
      // Only image: camera0_geo + camera0_color are perfect; camera1_geo is present, but black
      let (lower_range, upper_range) = (0, 1);


      // Experiment: Draw camera0_color and camera1_color (both are setup above)
      // SAME RESULTS, DAMN IT.
      let (lower_range, upper_range) = (0, 2);

      // Render point cloud
      //for i in 0 .. self.num_cameras {
      /*for i in lower_range .. upper_range {
        //
        // THIS IS THE COLOR IMAGE
        //
        let vertex_array_object = self.vertex_array_objects.get(i).unwrap();
        let vertex_array_size_bytes = self.vertex_arrays_size_bytes.get(i).unwrap();

        // NB: Interesting experiment / behavior:
        // The following experiment cuts down on the geometry being drawn! Not just the color!
        // I wonder if this changes the length of whatever feeds gl_VertexID?
        // let vertex_array_size_bytes = vertex_array_size_bytes / 5;

        gl::BindVertexArray(vertex_array_object.id());
        let size = vertex_array_size_bytes / size_of::<BgraPixel>() as i32;

        gl::DrawArrays(gl::POINTS, 0, size);

        gl::BindVertexArray(0);
      }*/

      let vertex_array_object = self.vertex_array_objects.get(1).unwrap();
      let vertex_array_size_bytes = self.vertex_arrays_size_bytes.get(1).unwrap();
      let size = vertex_array_size_bytes / size_of::<BgraPixel>() as i32;

      gl::BindVertexArray(vertex_array_object.id());

      gl::DrawArrays(gl::POINTS, 0, size);
      gl::BindVertexArray(0);

      let vertex_array_object = self.vertex_array_objects.get(0).unwrap();
      let vertex_array_size_bytes = self.vertex_arrays_size_bytes.get(0).unwrap();
      let size = vertex_array_size_bytes / size_of::<BgraPixel>() as i32;

      gl::BindVertexArray(vertex_array_object.id());

      gl::DrawArrays(gl::POINTS, 0, size);
      gl::BindVertexArray(0);


      /*for obj in self.renderable_objects.iter() {
        gl::BindVertexArray(obj.vao);
        gl::DrawArrays(gl::POINTS, 0, size);
        gl::BindVertexArray(0);
      }*/


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
