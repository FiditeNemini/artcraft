//! This is a port of Microsoft's libk4a `k4apointcloudrenderer.cpp`.
//! This provides the visual output.

use std::ffi::CString;
use std::fmt::Formatter;
use std::mem::size_of;
use std::os::raw::{c_char, c_void};
use std::ptr;
use std::ptr::null;
use std::str;
use std::sync::{Arc, Mutex};

use arcball::ArcballCamera;
use gl;
use gl::types::*;

use gui::mouse_camera_arcball::MouseCameraArcball;
use kinect::k4a_sys_wrapper;
use opengl::compile_shader::compile_shader;
use opengl::opengl_wrapper::Texture;
use opengl::opengl_wrapper::{Buffer, gl_get_error, OpenGlError, VertexArray};
use point_cloud::pixel_structs::BgraPixel;
use std::time::{SystemTime, UNIX_EPOCH};

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

/// This is taken from Microsoft's MIT-licensed k4a libraries.
/// From the file `tools/k4aviewer/graphics/shaders/k4apointcloudshaders.h`
pub static POINT_CLOUD_VERTEX_SHADER : &'static str = "\
#version 430

// NB: It appears that locations need to be wide enough apart, or the colors bleed across locations.
layout(location=0) in vec4 inColor0;
layout(location=10) in vec4 inColor1;
//in vec4 inColor0;
//in vec4 inColor1;

out vec4 vertexColor;

uniform mat4 view;
uniform mat4 projection;

layout(rgba32f, binding=0) readonly uniform image2D pointCloudTexture0;
layout(rgba32f, binding=1) readonly uniform image2D pointCloudTexture1;

uniform bool enableShading;

// bool GetPoint3d(in vec2 pointCloudSize, in ivec2 point2d, out vec3 point3d)
// {
//     if (point2d.x < 0 || point2d.x >= pointCloudSize.x ||
//         point2d.y < 0 || point3d.y >= pointCloudSize.y)
//     {
//         return false;
//     }
//
//     point3d = imageLoad(pointCloudTexture0, point2d).xyz;
//     if (point3d.z <= 0)
//     {
//         return false;
//     }
//
//     return true;
// }

void main()
{
    ivec2 pointCloudSize0 = imageSize(pointCloudTexture0);
    ivec2 pointCloudSize1 = imageSize(pointCloudTexture1);

    int pointCloudLength0 = pointCloudSize0.x * pointCloudSize0.y;
    int pointCloudLength1 = pointCloudSize1.x * pointCloudSize1.y;

    vec3 vertexPosition;
    vec4 colorOut;

    // We're having to multiplex on gl_VertexID, and I don't think we get double the range for two
    // cameras. This effectively 'downsamples' each camera. We need to find a way to double this.
    // I hate drawing like this
    if (gl_VertexID % 10 == 0) {
      // Camera #0
      ivec2 currentDepthPixelCoordinates = ivec2(gl_VertexID % pointCloudSize0.x, gl_VertexID / pointCloudSize0.x);

      vertexPosition = imageLoad(pointCloudTexture0, currentDepthPixelCoordinates).xyz;

      colorOut = vec4(
        inColor0.r,
        inColor0.g,
        inColor0.b,
        255
      );
    } else {
      // Camera #1
      ivec2 currentDepthPixelCoordinates = ivec2(gl_VertexID % pointCloudSize1.x, gl_VertexID / pointCloudSize1.x);

      // vec3 originalPosition = imageLoad(pointCloudTexture1, currentDepthPixelCoordinates).xyz;

      // // Let's move the model away a bit.
      // vertexPosition = vec3(
      //   originalPosition.x - 1.5,
      //   originalPosition.y,
      //   originalPosition.z
      // );

      vertexPosition = imageLoad(pointCloudTexture1, currentDepthPixelCoordinates).xyz;

      // MAJOR PROBLEM HERE!
      // While we appear to have geometry data from both cameras, we do NOT have the color/texture
      // data from the second camera. That's annoying.
      colorOut = vec4(
        inColor1.r,
        inColor1.g,
        inColor1.b,
        255
      );
    }

    //vec3 vertexPosition = imageLoad(pointCloudTexture0, currentDepthPixelCoordinates).xyz;
    //int pointCloudVertexLength = pointCloudSize.x * pointCloudSize.y;

    //if (gl_VertexID % 2 == 0) {
    //} else {
    //}

    // Scale up while model view matrices not implemented.
    //vertexPosition.x *= 2.0 + 10.0;
    //vertexPosition.y *= 2.0 + 10.0;
    //vertexPosition.z *= 2.0;

    if (view[0][0] > 0.5) {
      vertexPosition.x -= 2.0;
      vertexPosition.y -= 2.0;
    }

    gl_Position = projection * view * vec4(vertexPosition, 1);
    vertexColor = colorOut;

    // Pass along the 'invalid pixel' flag as the alpha channel
    //
    if (vertexPosition.z == 0.0f)
    {
        vertexColor.a = 0.0f;
    }

    // NB: This is affecting the second camera. Disabling for now.
    // if (enableShading)
    // {
    //     // Compute the location of the closest neighbor pixel to compute lighting
    //     //
    //     vec3 closestNeighbor = vertexPosition;
    //
    //     // If no neighbors have data, default to 1 meter behind point.
    //     //
    //     closestNeighbor.z += 1.0f;
    //
    //     vec3 outPoint;
    //     if (GetPoint3d(pointCloudSize, currentDepthPixelCoordinates - ivec2(1, 0), outPoint))
    //     {
    //         if (closestNeighbor.z > outPoint.z)
    //         {
    //             closestNeighbor = outPoint;
    //         }
    //     }
    //     if (GetPoint3d(pointCloudSize, currentDepthPixelCoordinates + ivec2(1, 0), outPoint))
    //     {
    //         if (closestNeighbor.z > outPoint.z)
    //         {
    //             closestNeighbor = outPoint;
    //         }
    //     }
    //     if (GetPoint3d(pointCloudSize, currentDepthPixelCoordinates - ivec2(0, 1), outPoint))
    //     {
    //         if (closestNeighbor.z > outPoint.z)
    //         {
    //             closestNeighbor = outPoint;
    //         }
    //     }
    //     if (GetPoint3d(pointCloudSize, currentDepthPixelCoordinates + ivec2(0, 1), outPoint))
    //     {
    //         if (closestNeighbor.z > outPoint.z)
    //         {
    //             closestNeighbor = outPoint;
    //         }
    //     }
    //
    //     vec3 lightPosition = vec3(0, 0, 0);
    //     float occlusion = length(vertexPosition - closestNeighbor) * 20.0f;
    //     float diffuse = 1.0f - clamp(occlusion, 0.0f, 0.6f);
    //
    //     float distance = length(lightPosition - vertexPosition);
    //
    //     // Attenuation term for light source that covers distance up to 50 meters
    //     // http://wiki.ogre3d.org/tiki-index.php?page=-Point+Light+Attenuation
    //     //
    //     float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
    //
    //     vertexColor = vec4(attenuation * diffuse * vertexColor.rgb, vertexColor.a);
    // }
}
";

/// This is taken from Microsoft's MIT-licensed k4a libraries.
/// From the file `tools/k4aviewer/graphics/shaders/k4apointcloudshaders.h`
pub static POINT_CLOUD_FRAGMENT_SHADER: &'static str = "\
#version 430

in vec4 vertexColor;
out vec4 fragmentColor;

uniform bool enableShading;

void main()
{
    if (vertexColor.a == 0.0f)
    {
        discard;
    }

    fragmentColor = vertexColor;
}
";

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
    let vertex_shader_id = compile_shader(POINT_CLOUD_VERTEX_SHADER, gl::VERTEX_SHADER);
    let fragment_shader_id = compile_shader(POINT_CLOUD_FRAGMENT_SHADER, gl::FRAGMENT_SHADER);

    let ATTRIB_LOCATION_0 : CString = CString::new("inColor0").expect("string is correct");
    let ATTRIB_LOCATION_0_PTR : *const c_char = ATTRIB_LOCATION_0.as_ptr() as *const c_char;

    let ATTRIB_LOCATION_1 : CString = CString::new("inColor1").expect("string is correct");
    let ATTRIB_LOCATION_1_PTR : *const c_char = ATTRIB_LOCATION_1.as_ptr() as *const c_char;

    //let ATTRIB_LOCATION_2 : CString = CString::new("inColor2").expect("string is correct");
    //let ATTRIB_LOCATION_2_PTR : *const c_char = ATTRIB_LOCATION_2.as_ptr() as *const c_char;

    //let ATTRIB_LOCATION_3 : CString = CString::new("inColor3").expect("string is correct");
    //let ATTRIB_LOCATION_3_PTR : *const c_char = ATTRIB_LOCATION_3.as_ptr() as *const c_char;

    //unsafe {
    //  gl::BindAttribLocation(program_id, 1, ATTRIB_LOCATION_1_PTR);
    //  gl::BindAttribLocation(program_id, 2, ATTRIB_LOCATION_2_PTR);
    //  gl::BindAttribLocation(program_id, 3, ATTRIB_LOCATION_3_PTR);
    //}

    link_program(program_id, vertex_shader_id, fragment_shader_id);

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

    for _ in 0 .. num_cameras {
      vertex_array_objects.push(VertexArray::new_initialized());
      vertex_color_buffer_objects.push(Buffer::new_initialized());
      vertex_arrays_size_bytes.push(0);
    }

    let mut vertex_attrib_locations = Vec::with_capacity(num_cameras);

    unsafe {
      let location_0 = gl::GetAttribLocation(program_id, ATTRIB_LOCATION_0_PTR);
      let location_1 = gl::GetAttribLocation(program_id, ATTRIB_LOCATION_1_PTR);

      println!("Location0: {}", location_0);
      println!("Location1: {}", location_1);

      vertex_attrib_locations.push(location_0);
      vertex_attrib_locations.push(location_1);
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
  /// Update the view matrices
  ///
  pub fn update_view_projection(&mut self, view: [[f32; 4]; 4], projection: [[f32; 4]; 4]) {
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
  pub fn update_point_clouds(&mut self, color_images: &Vec<k4a_sys_wrapper::Image>,
                             point_cloud_textures: &Vec<Texture>) -> Result<()>
  {
    let time = SystemTime::now();
    let time_since_epoch = time.duration_since(UNIX_EPOCH).unwrap();
    let seconds = time_since_epoch.as_secs();

    let (lower_range, upper_range)= if seconds % 10 > 4 {
      (0, 1)
    } else {
      (1, 2)
    };

    //let (lower_range, upper_range)  = (0, 2);

    //for i in 0 .. self.num_cameras  {
    for i in lower_range .. upper_range {

      let color_image = color_images.get(i).unwrap();
      let point_cloud_texture = point_cloud_textures.get(i).unwrap();

      // NB: This experiment demonstrates that only one set of texture (colors) seem to be updated.
      // let i = if seconds % 10 > 4 {
      //   j // primary camera first
      // } else {
      //   1 - j // secondary camera first
      // };

      // EXPERIMENTAL RESULTS TABLE.
      // The first camera index is the one that gets the color
      //let i = j; // geometry1, cameratexture1, (below is i=j)
      //let i = 1 - j; //geometry2, cameratexture2 (below is i=j)
      //let i = j; // geometry2, cameratexture1, (below is i=1-j)
      //let i = 1 - j; //geometry1, cameratexture2 (below is i=1-j)
      //let i = if swap { j } else { 1 - j }; // swaps which image data is used

      let vertex_array_object = self.vertex_array_objects.get(i).unwrap();
      let vertex_color_buffer_object = self.vertex_color_buffer_objects.get(i).unwrap();
      let mut vertex_array_size_bytes = self.vertex_arrays_size_bytes.get_mut(i).unwrap();

      unsafe {
        gl::BindVertexArray(vertex_array_object.id());
        // Vertex Colors
        gl::BindBuffer(gl::ARRAY_BUFFER, vertex_color_buffer_object.id());
      }

      let color_image_size_bytes = color_image.get_size() as i32;

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

      let color_src = color_image.get_buffer();
      let typed_color_src = color_src as *const u8;

      let result = unsafe {
        /*if i == 9 {
          // TODO TESTING - writing pure white changes the color of the final output "line" to white:
          std::ptr::copy::<u8>(color_src, vertex_mapped_buffer as *mut u8, color_image_size_bytes as usize);
          std::ptr::write_bytes(vertex_mapped_buffer, 255, color_image_size_bytes as usize);
        } else {
        }*/

        // NB: This is the working texturing:
        std::ptr::copy_nonoverlapping::<u8>(typed_color_src,
          vertex_mapped_buffer,
          color_image_size_bytes as usize);

        gl::UnmapBuffer(gl::ARRAY_BUFFER)
      };

      if result == gl::FALSE {
        let error = gl_get_error().expect_err("should be unmap buffer error");
        return Err(PointCloudRendererError::OpenGlError(error));
      }

      // NB: This controls which geometry gets the texture/color data. If we hardcode it to
      // a single index, only one of the camera geometries gets shaded.
      //let i = j; // (SEE TABLE ABOVE)
      //let i = 1 - j; // (SEE TABLE ABOVE)
      //let i = if !swap { j } else { 1 - j }; // (in isolation) PUTS THE IMAGES ON BOTH POINTCLOUD GEOS!?

      unsafe {
        let vertex_attrib_location = self.vertex_attrib_locations.get(i).unwrap();

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
        (0, 1)
      } else {
        (1, 2)
      };

      //let (lower_range, upper_range) = (0, 2);

      // Render point cloud
      //for i in 0 .. self.num_cameras {
      for i in lower_range .. upper_range {
        // NB: Changing the order here impacts which camera gets shaded. For some reason only one
        // camera is actually getting real texture data.
        // let i = if seconds % 5 > 2 {
        //   j // primary camera first
        // } else {
        //   1 - j // secondary camera first
        // };

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

// TODO: Reuse.
fn link_program(program: GLuint, vertex_shader: GLuint, fragment_shader: GLuint) -> GLuint {
  unsafe {
    gl::AttachShader(program, vertex_shader);
    gl::AttachShader(program, fragment_shader);
    gl::LinkProgram(program);
    // Get the link status
    let mut status = gl::FALSE as GLint;
    gl::GetProgramiv(program, gl::LINK_STATUS, &mut status);

    // Fail on error
    if status != (gl::TRUE as GLint) {
      let mut len: GLint = 0;
      gl::GetProgramiv(program, gl::INFO_LOG_LENGTH, &mut len);
      let mut buf = Vec::with_capacity(len as usize);
      buf.set_len((len as usize) - 1); // subtract 1 to skip the trailing null character
      gl::GetProgramInfoLog(
        program,
        len,
        ptr::null_mut(),
        buf.as_mut_ptr() as *mut GLchar,
      );
      panic!(
        "{}",
        str::from_utf8(&buf)
            .ok()
            .expect("ProgramInfoLog not valid utf8")
      );
    }
    program
  }
}
