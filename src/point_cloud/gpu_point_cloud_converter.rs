//! This is a port of Microsoft's libk4a `gpudepthtopointcloudconverter.h`.
//! This code turns depth images into point clouds.

use std::ffi::CString;
use std::fmt::Formatter;
use std::mem::size_of;
use std::os::raw::{c_char, c_int, c_void};
use std::ptr;
use std::ptr::null;
use std::str;

use gl;
use gl::types::*;

use crate::files::read_file_string_contents::read_file_string_contents;
use crate::files::write_to_file_from_byte_ptr::write_to_file_from_byte_ptr;
use crate::kinect::k4a_sys_wrapper::ImageFormat;
use crate::kinect::k4a_sys_wrapper::{Image, Calibration};
use crate::kinect::k4a_sys_wrapper;
use crate::opengl::compile_shader::compile_shader;
use crate::opengl::wrapper::buffer::Buffer;
use crate::opengl::wrapper::other_misc_wrapper::OpenGlError;
use crate::opengl::wrapper::other_misc_wrapper::gl_get_error;
use crate::opengl::wrapper::texture::Texture;
use crate::point_cloud::debug::image_proxy::ImageProxy;
use crate::point_cloud::pixel_structs::DepthPixel;

pub type Result<T> = std::result::Result<T, PointCloudComputeError>;

#[derive(Clone, Debug)]
pub enum PointCloudComputeError {
  OpenGlError(OpenGlError),
  UnknownError,
}

impl From<OpenGlError> for PointCloudComputeError {
  fn from(error: OpenGlError) -> Self {
    PointCloudComputeError::OpenGlError(error)
  }
}

impl std::fmt::Display for PointCloudComputeError {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    let description = match self {
      PointCloudComputeError::OpenGlError(inner) => {
        format!("Compute OpenGL error: {}", inner)
      },
      PointCloudComputeError::UnknownError => "Unknown Compute Error".into(),
    };

    write!(f, "{}", description)
  }
}

impl std::error::Error for PointCloudComputeError {
  fn source(&self) -> Option<&(dyn std::error::Error +'static)> {
    // Generic error, no backtrace.
    None
  }
}

/// The format that the point cloud texture uses internally to store points.
/// If you want to use the texture that this outputs from your shader, you
/// need to pass this as the format argument to glBindImageTexture().
pub const POINT_CLOUD_TEXTURE_FORMAT : GLuint = gl::RGBA32F;

pub struct GpuPointCloudConverter {
  /// The OpenGL program
  shader_program_id: GLuint,

  /// The x,y table as a texture
  pub xy_table_texture: Texture,

  /// Preallocated texture for depth image so we don't have to reallocate every frame.
  pub depth_image_texture: Texture,

  depth_image_pixel_buffer: Buffer,

  /// Uniform location in the shader program
  // TODO: Turns out this does nothing
  //dest_tex_id: GLint,

  /// Uniform location in the shader program
  xy_table_id: GLint,

  /// Uniform location in the shader program
  depth_image_id: GLint,
}

impl GpuPointCloudConverter {

  pub fn new() -> Self {
    let program_id = unsafe { gl::CreateProgram() };

    let point_cloud_compute_shader = read_file_string_contents("src/point_cloud/shaders/point_cloud_compute_shader.glsl").unwrap();

    let shader_id = compile_shader(&point_cloud_compute_shader, gl::COMPUTE_SHADER);

    link_program(program_id, shader_id);

    let mut dest_tex_id = 0;
    let mut xy_table_id = 0;
    let mut depth_image_id = 0;

    /// Uniform variable name in OpenGL shader program
    // TODO: Turns out this does nothing.
    let DEST_TEX : CString = CString::new("destTex").expect("string is correct");
    let DEST_TEX_PTR : *const c_char = DEST_TEX.as_ptr() as *const c_char;

    /// Uniform variable name in OpenGL shader program
    let XY_TABLE : CString = CString::new("xyTable").expect("string is correct");
    let XY_TABLE_PTR: *const c_char = XY_TABLE.as_ptr() as *const c_char;

    /// Uniform variable name in OpenGL shader program
    let DEPTH_IMAGE : CString = CString::new("depthImage").expect("string is correct");
    let DEPTH_IMAGE_PTR : *const c_char = DEPTH_IMAGE.as_ptr() as *const c_char;

    unsafe {
      dest_tex_id = gl::GetUniformLocation(program_id, DEST_TEX_PTR);
      xy_table_id = gl::GetUniformLocation(program_id, XY_TABLE_PTR);
      depth_image_id = gl::GetUniformLocation(program_id, DEPTH_IMAGE_PTR);
    }

    GpuPointCloudConverter {
      shader_program_id: program_id,
      //shader_id,
      //dest_tex_id,
      xy_table_id,
      depth_image_id,
      depth_image_texture: Texture::new(),
      xy_table_texture: Texture::new(),
      depth_image_pixel_buffer: Buffer::new(),
    }
  }

  /// Takes depth data and turns it into a texture containing the XYZ coordinates of the depth map
  /// using the most recently set-to-active XY table.  The input depth image and output texture
  /// (if already set) must be of the same resolution that was used to generate that XY table, or
  /// else behavior is undefined.
  ///
  /// Essentially a reimplementation of k4a::transform::depth_image_to_point_cloud on the GPU.
  /// This is much more performant than k4a::transform::depth_image_to_point_cloud, but is a bit
  /// more unwieldly to use since you have to use its output in shaders.
  ///
  /// The output texture has an internal format of GL_RGBA32F and is intended to be used directly
  /// by other OpenGL shaders as an image2d uniform.
  ///
  /// To avoid excess image allocations, you can reuse a texture that was previously output
  /// by this function, provided the depth image and XY table previously used was for the same
  /// sized texture.
  ///
  pub fn convert(&self,
                 //depth_image: &k4a_sys_wrapper::Image,
                 depth_image: &ImageProxy,
                 output_texture: &mut Texture,
                 camera_index: usize
  ) -> Result<()> {
    if !self.xy_table_texture.is_initialized() {
      return Err(PointCloudComputeError::UnknownError);
    }

    // Create output texture if it doesn't already exist
    //
    // We don't use the alpha channel, but it turns out OpenGL doesn't
    // actually have a 3-component (i.e. RGB32F) format - you get
    // 1, 2, or 4 components.
    //
    let width = depth_image.get_width_pixels() as i32;
    let height = depth_image.get_height_pixels() as i32;

    if !output_texture.is_initialized() {
      output_texture.init();

      unsafe {
        gl::ActiveTexture(gl::TEXTURE0);
        gl::BindTexture(gl::TEXTURE_2D, output_texture.id());

        // The format that the point cloud texture uses internally to store points.
        // If you want to use the texture that this outputs from your shader, you
        // need to pass this as the format argument to glBindImageTexture().
        // static constexpr GLenum PointCloudTextureFormat = GL_RGBA32F;
        // gl::TexStorage2D(gl::TEXTURE_2D, 1, POINT_CLOUD_TEXTURE_FORMAT, width, height);
        gl::TexStorage2D(gl::TEXTURE_2D, 1, gl::RGBA32F, width, height);

        gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::NEAREST as i32);
        gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::NEAREST as i32);
      }
    }

    unsafe {
      // Upload data to uniform texture
      gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, self.depth_image_pixel_buffer.id());
      gl::BindTexture(gl::TEXTURE_2D, self.depth_image_texture.id());

      let num_bytes: GLuint = (width * height * size_of::<u16>() as i32) as GLuint; // libc::uint16_t = u16
      let length = (width * height) as usize;
      //let num_bytes: GLuint = (width * height * size_of::<DepthPixel>() as i32) as GLuint; // libc::uint16_t = u16

      // GLubyte *textureMappedBuffer = reinterpret_cast<GLubyte *>(...)
      let texture_mapped_buffer = gl::MapBufferRange(
        gl::PIXEL_UNPACK_BUFFER,
        0,
        num_bytes as isize,
        //(std::mem::size_of::<DepthPixel>() * length) as GLsizeiptr,
        gl::MAP_WRITE_BIT | gl::MAP_INVALIDATE_BUFFER_BIT
      //);
      ) as *mut DepthPixel;

      if texture_mapped_buffer as usize == 0 {
        return Err(PointCloudComputeError::UnknownError);
      }

      let depth_image_buffer = depth_image.get_buffer();

      //let filename = format!("output/depth_src_{}", camera_index);
      //let size = (width * height) as usize * size_of::<u16>();
      //write_to_file_from_byte_ptr(&filename, depth_image_buffer, size).unwrap();

      let typed_depth_image_buffer = depth_image_buffer as *const DepthPixel;

      std::ptr::copy::<DepthPixel>(typed_depth_image_buffer, texture_mapped_buffer, length as usize);

      let result = gl::UnmapBuffer(gl::PIXEL_UNPACK_BUFFER);
      if result == gl::FALSE {
        return Err(PointCloudComputeError::UnknownError);
      }

      gl::TexSubImage2D(
        gl::TEXTURE_2D, // target
        0, // level
        0, // x offset
        0, // y offset
        width,
        height,
        gl::RED_INTEGER, //constexpr GLenum depthImageDataFormat = GL_RED_INTEGER;
        gl::UNSIGNED_SHORT, //constexpr GLenum depthImageDataType = GL_UNSIGNED_SHORT;
        null(), // data
      );
      gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, 0);

      gl::UseProgram(self.shader_program_id);

      // Bind textures that we're going to pass to the texture
      gl::ActiveTexture(gl::TEXTURE0);
      gl::BindTexture(gl::TEXTURE_2D, output_texture.id());
      gl::BindImageTexture(
        0,
        output_texture.id(),
        0,
        gl::FALSE,
        0,
        gl::WRITE_ONLY,
        //POINT_CLOUD_TEXTURE_FORMAT
        //static constexpr GLenum PointCloudTextureFormat = GL_RGBA32F;
        gl::RGBA32F,
      );

      gl::ActiveTexture(gl::TEXTURE1);
      gl::BindTexture(gl::TEXTURE_2D, self.depth_image_texture.id());
      gl::BindImageTexture(
        1,
        self.depth_image_texture.id(),
        0,
        gl::FALSE,
        0,
        gl::READ_ONLY,
        gl::R16UI, //constexpr GLenum depthImageInternalFormat = GL_R16UI;
      );
      gl::Uniform1i(self.depth_image_id, 1);

      gl::ActiveTexture(gl::TEXTURE2);
      gl::BindTexture(gl::TEXTURE_2D, self.xy_table_texture.id());
      gl::BindImageTexture(
        2,
        self.xy_table_texture.id(),
        0,
        gl::FALSE,
        0,
        gl::READ_ONLY,
        gl::RG32F, //constexpr GLenum xyTableInternalFormat = GL_RG32F;
      );
      gl::Uniform1i(self.xy_table_id, 2);

      gl::DispatchCompute(
        depth_image.get_width_pixels() as u32,
        depth_image.get_height_pixels() as u32,
        1,
      );

      // Wait for the rendering to finish before allowing reads to the texture we just wrote
      gl::MemoryBarrier(gl::TEXTURE_FETCH_BARRIER_BIT);

      gl_get_error()?;

      // NB(bt): Restore to default active texture? Looks like this is required for 'imgui'
      // This is needed despite using glGetInteger(GL_ACTIVE_TEXTURE) and resetting that value.
      //gl::ActiveTexture(gl::TEXTURE0);

      /*
      // Try to save the texture buffer to file... (not working yet)
      let size_bytes = (width * height * 4);
      let mut vec = vec![0u8; size_bytes as usize];
      let mut pointer = vec.as_mut_ptr() as *mut c_void;

      // Pull the texture out as bytes.
      //gl::ActiveTexture(gl::TEXTURE1);
      gl::BindTexture(gl::TEXTURE_2D, output_texture.id());

      gl_get_error().unwrap();

      gl::GetTextureImage(
        output_texture.id(),
        0, // level
        gl::RGBA32F, // format
        gl::UNSIGNED_BYTE, // type
        size_bytes, // buffer size
        pointer,
      );

      gl_get_error().unwrap();
      */

      Ok(())
    }
  }

  /// Set the XY table that will be used by future calls to Convert().  Get an XY table by calling
  /// GenerateXyTable().
  pub fn set_active_xy_table(&mut self, xy_table: &ImageProxy) -> Result<()> {
    let width = xy_table.get_width_pixels() as i32;
    let height = xy_table.get_height_pixels() as i32;

    // Upload the XY table as a texture so we can use it as a uniform
    self.xy_table_texture.init();

    unsafe {
      gl::BindTexture(gl::TEXTURE_2D, self.xy_table_texture.id());
      gl::TexStorage2D(
        gl::TEXTURE_2D,
        1,
        gl::RG32F, // constexpr GLenum xyTableInternalFormat = GL_RG32F;
        width,
        height,
      );

      let xy_table_buffer = xy_table.get_buffer();

      gl::TexSubImage2D(
        gl::TEXTURE_2D,
        0, // level
        0, // xoffset
        0, // yoffset
        width,
        height,
        gl::RG, //constexpr GLenum xyTableDataFormat = GL_RG;
        gl::FLOAT, //constexpr GLenum xyTableDataType = GL_FLOAT;
        xy_table_buffer as *const c_void,
      );

      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::NEAREST as i32);
      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::NEAREST as i32);
    }

    // Pre-allocate a texture for the depth images so we don't have to
    // reallocate on every frame
    self.depth_image_texture.init();
    self.depth_image_pixel_buffer.init();

    let depth_image_size_bytes = (width * height * size_of::<u16>() as i32) as isize; // libc::uint16_t = u16

    unsafe {
      gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, self.depth_image_pixel_buffer.id());
      gl::BufferData(
        gl::PIXEL_UNPACK_BUFFER,
        depth_image_size_bytes,
        ptr::null_mut(),
        gl::STREAM_DRAW,
      );
      gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, 0);

      gl::BindTexture(gl::TEXTURE_2D, self.depth_image_texture.id());

      gl::TexStorage2D(
        gl::TEXTURE_2D,
        1,
        gl::R16UI, // constexpr GLenum depthImageInternalFormat = GL_R16UI;
        width,
        height,
      );

      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::NEAREST as i32);
      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::NEAREST as i32);
    }

    gl_get_error()
        .map_err(|err| PointCloudComputeError::OpenGlError(err))
  }

  /// Creates a k4a::image containing the XY tables from calibration based on calibrationType.
  /// The table is a 2D array of k4a_float2_t's with the same resolution as the camera of calibrationType
  /// specified in calibration.
  ///
  /// You can use this table to convert a depth image into a point cloud, e.g. by using the Convert method.
  /// Conversion is done by multiplying the depth pixel value by the XY table values - i.e. the result
  /// pixel will be (xyTable[p].x * depthImage[p], xyTable[p].y * depthImage[p], depthImage[p]), where
  /// p is the index of a given pixel.
  pub fn generate_xy_table(calibration: &Calibration,
                           calibration_type: k4a_sys::k4a_calibration_type_t)
    -> Result<Image>
  {
    let camera_calibration :  k4a_sys::k4a_calibration_camera_t = match calibration_type {
      k4a_sys::k4a_calibration_type_t_K4A_CALIBRATION_TYPE_COLOR => calibration.0.color_camera_calibration,
      k4a_sys::k4a_calibration_type_t_K4A_CALIBRATION_TYPE_DEPTH => calibration.0.depth_camera_calibration,
      _ => return Err(PointCloudComputeError::UnknownError),
    };

    let width = camera_calibration.resolution_width as u32;
    let height = camera_calibration.resolution_height as u32;
    let stride_bytes = width * size_of::<k4a_sys::k4a_float2_t>() as u32;

    let xy_table = Image::create(
      ImageFormat::Custom,
      width,
      height,
      stride_bytes,
    ).map_err(|_| PointCloudComputeError::UnknownError)?;

    // typedef union
    // {
    //     // XY or array representation of vector
    //     struct _xy
    //     {
    //         float x; // < X component of a vector
    //         float y; // < Y component of a vector
    //     } xy;        // < X, Y representation of a vector
    //     float v[2];  // < Array representation of a vector
    // } k4a_float2_t;
    let mut p = k4a_sys::k4a_float2_t {
      xy: k4a_sys::k4a_float2_t__xy {
        x: 0.0,
        y: 0.0,
      }
    };

    // typedef union
    // {
    //     // XYZ or array representation of vector.
    //     struct _xyz
    //     {
    //         float x; // < X component of a vector.
    //         float y; // < Y component of a vector.
    //         float z; // < Z component of a vector.
    //     } xyz;       // < X, Y, Z representation of a vector.
    //     float v[3];  // < Array representation of a vector.
    // } k4a_float3_t;
    let mut ray = k4a_sys::k4a_float3_t {
      xyz: k4a_sys::k4a_float3_t__xyz {
        x: 0.0,
        y: 0.0,
        z: 0.0,
      }
    };

    let mut idx = 0;
    unsafe {
      let table_data = xy_table.get_buffer();
      let typed_buffer = table_data as *mut k4a_sys::k4a_float2_t;

      for y in 0..height {
        p.xy.y = y as f32;

        for x in 0..width {
          p.xy.x = x as f32;

          let mut valid: c_int = -1;
          let result = unsafe {
            // https://docs.rs/k4a-sys/0.2.0/k4a_sys/fn.k4a_calibration_2d_to_3d.html
            k4a_sys::k4a_calibration_2d_to_3d(
              &calibration.0,
              &p, // source point 2d
              1.0, // source depth mm
              calibration_type, // source camera
              calibration_type, // target camera
              &mut ray, // target point3d mm
              &mut valid // set to 1 when valid result, 0 when coordinate is not valid
            )
          };

          if result != k4a_sys::k4a_buffer_result_t_K4A_BUFFER_RESULT_SUCCEEDED {
            return Err(PointCloudComputeError::UnknownError);
          }

          if valid == 1 {
            unsafe {
              /*
              println!("[size: {}x{}] 2D coord {}x{} --> 3D cord {}x{}x{}",
                        width, height, p.xy.x, p.xy.y, ray.xyz.x, ray.xyz.y, ray.xyz.z);
              [size: 1280x720] 2D coord 0x0 --> 3D cord -1.0120127x-0.5833072x1
              [size: 1280x720] 2D coord 1x0 --> 3D cord -1.010335x-0.5832499x1
              [size: 1280x720] 2D coord 2x0 --> 3D cord -1.0086561x-0.58319193x1
              ...
              [size: 1280x720] 2D coord 1277x719 --> 3D cord 1.0083642x0.55422443x1
              [size: 1280x720] 2D coord 1278x719 --> 3D cord 1.0100702x0.55429035x1
              [size: 1280x720] 2D coord 1279x719 --> 3D cord 1.0117699x0.55435246x1
              ...
              [size: 640x576] 2D coord 0x0 --> 3D cord -0.97488284x-1.0173141x1
              [size: 640x576] 2D coord 1x0 --> 3D cord -0.97017723x-1.0155252x1
              [size: 640x576] 2D coord 2x0 --> 3D cord -0.9654954x-1.0137504x1
              ...
              [size: 640x576] 2D coord 637x575 --> 3D cord 0.7947599x0.60008353x1
              [size: 640x576] 2D coord 638x575 --> 3D cord 0.79833484x0.60085475x1
              [size: 640x576] 2D coord 639x575 --> 3D cord 0.8019226x0.60163087x1
              */
              (*typed_buffer.offset(idx)).xy.x = ray.xyz.x;
              (*typed_buffer.offset(idx)).xy.y = ray.xyz.y;
            }
          } else {
            unsafe {
              // This pixel is invalid
              (*typed_buffer.offset(idx)).xy.x = 0.0;
              (*typed_buffer.offset(idx)).xy.y = 0.0;
            }
          }

          idx += 1;
        }
      }
    }

    Ok(xy_table)
  }
}

fn link_program(program: GLuint, shader: GLuint) -> GLuint {
  unsafe {
    gl::AttachShader(program, shader);
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
