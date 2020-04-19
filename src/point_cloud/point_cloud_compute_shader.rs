//! This is a port of Microsoft's libk4a `gpudepthtopointcloudconverter.h`.
//! This code turns depth images into point clouds.

use std::ffi::CString;
use std::fmt::{Error, Formatter};
use std::mem::size_of;
use std::os::raw::{c_char, c_int, c_void};
use std::ptr;
use std::ptr::null;
use std::str;

use gl;
use gl::types::*;
use libc;

use k4a_sys_wrapper;
use k4a_sys_wrapper::Image;
use k4a_sys_wrapper::ImageFormat;
use opengl_wrapper::{Buffer, gl_get_error};
use opengl_wrapper::Texture;
use opengl_wrapper::OpenGlError;
use point_cloud::compile_shader::compile_shader;

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

/// This is taken from Microsoft's MIT-licensed k4a libraries.
/// From the file `tools/k4aviewer/graphics/shaders/gpudepthtopointcloudconverter.cpp`
pub static COMPUTE_SHADER_SRC: &'static str = "\
#version 430

layout(location=0, rgba32f) writeonly uniform image2D destTex;

layout(location=1, r16ui) readonly uniform uimage2D depthImage;
layout(location=2, rg32f) readonly uniform image2D xyTable;

layout(local_size_x = 1, local_size_y = 1) in;

void main()
{
    ivec2 pixel = ivec2(gl_GlobalInvocationID.xy);

    float vertexValue = float(imageLoad(depthImage, pixel));
    vec2 xyValue = imageLoad(xyTable, pixel).xy;

    float alpha = 1.0f;
    vec3 vertexPosition = vec3(vertexValue * xyValue.x, vertexValue * xyValue.y, vertexValue);

    // Invalid pixels have their XY table values set to 0.
    // Set the rest of their values to 0 so clients can pick them out.
    //
    if (xyValue.x == 0.0f && xyValue.y == 0.0f)
    {
        alpha = 0.0f;
        vertexValue = 0.0f;
    }

    // Vertex positions are in millimeters, but everything else is in meters, so we need to convert
    //
    vertexPosition /= 1000.0f;

    // OpenGL and K4A have different conventions on which direction is positive -
    // we need to flip the X coordinate.
    //
    vertexPosition.x *= -1;

    imageStore(destTex, pixel, vec4(vertexPosition, alpha));
}
";

/// The format that the point cloud texture uses internally to store points.
/// If you want to use the texture that this outputs from your shader, you
/// need to pass this as the format argument to glBindImageTexture().
pub const POINT_CLOUD_TEXTURE_FORMAT : GLuint = gl::RGBA32F;

pub struct PointCloudComputeShader {
  /// The OpenGL program
  program_id: GLuint,

  /// The OpenGL compute shader
  shader_id: GLuint,

  /// The x,y table as a texture
  xy_table_texture: Texture,

  /// Preallocated texture for depth image so we don't have to reallocate every frame.
  depth_image_texture: Texture,

  depth_image_pixel_buffer: Buffer,

  /// Uniform location in the shader program
  dest_tex_id: GLint,

  /// Uniform location in the shader program
  xy_table_id: GLint,

  /// Uniform location in the shader program
  depth_image_id: GLint,
}

impl PointCloudComputeShader {

  pub fn new() -> Self {
    let program_id = unsafe { gl::CreateProgram() };
    let shader_id = compile_shader(COMPUTE_SHADER_SRC, gl::COMPUTE_SHADER);

    link_program(program_id, shader_id);

    let mut dest_tex_id = 0;
    let mut xy_table_id = 0;
    let mut depth_image_id = 0;

    /// Uniform variable name in OpenGL shader program
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

    println!("Uniform: dest_tex_id location = {:?}", dest_tex_id);
    println!("Uniform: xy_table_id location = {:?}", xy_table_id);
    println!("Uniform: depth_image_id location = {:?}", depth_image_id);

    PointCloudComputeShader {
      program_id,
      shader_id,
      dest_tex_id,
      xy_table_id,
      depth_image_id,
      depth_image_texture: Texture::new(),
      xy_table_texture: Texture::new(),
      depth_image_pixel_buffer: Buffer::new(),
    }
  }

  // Takes depth data and turns it into a texture containing the XYZ coordinates of the depth map
  // using the most recently set-to-active XY table.  The input depth image and output texture
  // (if already set) must be of the same resolution that was used to generate that XY table, or
  // else behavior is undefined.
  //
  // Essentially a reimplementation of k4a::transform::depth_image_to_point_cloud on the GPU.
  // This is much more performant than k4a::transform::depth_image_to_point_cloud, but is a bit
  // more unwieldly to use since you have to use its output in shaders.
  //
  // The output texture has an internal format of GL_RGBA32F and is intended to be used directly
  // by other OpenGL shaders as an image2d uniform.
  //
  // To avoid excess image allocations, you can reuse a texture that was previously output
  // by this function, provided the depth image and XY table previously used was for the same
  // sized texture.
  //
  pub fn convert(&self,
                 depth_image: &k4a_sys_wrapper::Image,
                 output_texture: &mut Texture) -> Result<()>
  {
    println!("==== ComputeShader.convert()");

    if !self.xy_table_texture.is_initialized() {
      println!("Error: xyz texture is not initialized!!!");
      // throw std::logic_error("You must call SetActiveXyTable at least once before calling Convert!");
      return Err(PointCloudComputeError::UnknownError);
    }

    let width = depth_image.get_width_pixels() as i32;
    let height = depth_image.get_height_pixels() as i32;

    if !output_texture.is_initialized() {
      println!("Output texture is not initialized. Initializing.");

      output_texture.init();

      unsafe {
        println!("-> gl::ActiveTexture(TEXTURE0)");
        gl::ActiveTexture(gl::TEXTURE0);
        println!("-> gl::BindTexture(): {:?}", output_texture.id());
        gl::BindTexture(gl::TEXTURE_2D, output_texture.id());

        // The format that the point cloud texture uses internally to store points.
        // If you want to use the texture that this outputs from your shader, you
        // need to pass this as the format argument to glBindImageTexture().
        // static constexpr GLenum PointCloudTextureFormat = GL_RGBA32F;
        println!("-> gl::TexStorage2D(...)");
        gl::TexStorage2D(gl::TEXTURE_2D, 1, POINT_CLOUD_TEXTURE_FORMAT, width, height);

        println!("-> gl::TexParameteri()");
        gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::NEAREST as i32);
        println!("-> gl::TexParameteri()");
        gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::NEAREST as i32);
      }
    }

    unsafe {
      // Upload data to uniform texture
      println!("-> gl::BindBuffer(): {:?}", self.depth_image_pixel_buffer.id());
      gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, self.depth_image_pixel_buffer.id());
      println!("-> gl::BindTexture(): {:?}", self.depth_image_texture.id());
      gl::BindTexture(gl::TEXTURE_2D, self.depth_image_texture.id());

      let num_bytes: GLuint = (width * height * size_of::<u16>() as i32) as GLuint; // libc::uint16_t = u16

      println!("-> gl::MapBufferRange(...)");
      // GLubyte *textureMappedBuffer = reinterpret_cast<GLubyte *>(...)
      let mut texture_mapped_buffer = gl::MapBufferRange(
        gl::PIXEL_UNPACK_BUFFER,
        0,
        num_bytes as isize,
        gl::MAP_WRITE_BIT | gl::MAP_INVALIDATE_BUFFER_BIT
      );

      if texture_mapped_buffer as usize == 0 {
        println!("Error: Texture buffer mapping failed.");
        return Err(PointCloudComputeError::UnknownError);
      }

      let mut depth_src = depth_image.get_buffer();

      // std::copy(depthSrc, depthSrc + numBytes, textureMappedBuffer);
      // NB: Slightly different calculation; libc::uint16_t = u16 (TODO: is this byte multiples?)
      // Rust function copies count * size_of::<T>()
      println!("Copying depth_src to texture_mapped_buffer");
      let count = (width * height * 2) as usize;
      std::ptr::copy_nonoverlapping::<u8>(depth_src, texture_mapped_buffer as *mut u8, count);

      println!("-> gl::UnmapBuffer(PIXEL_UNPACK_BUFFER)");
      let result = gl::UnmapBuffer(gl::PIXEL_UNPACK_BUFFER);
      if result == gl::FALSE {
        println!("Error: unknown errror");
        return Err(PointCloudComputeError::UnknownError);
      }

      println!("-> gl::TexSubImage2D(...)");
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
      println!("-> gl::BindBuffer(PIXEL_UNPACK_BUFFER)");
      gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, 0);

      println!("-> gl::UseProgram(): {:?}", self.program_id);
      gl::UseProgram(self.program_id);

      // Bind textures that we're going to pass to the texture
      println!("-> gl::ActiveTexture(TEXTURE0)");
      gl::ActiveTexture(gl::TEXTURE0);
      println!("-> gl::BindTexture(): {:?}", output_texture.id());
      gl::BindTexture(gl::TEXTURE_2D, output_texture.id());
      println!("-> gl::BindImageTexture(...)");
      gl::BindImageTexture(
        0,
        output_texture.id(),
        0,
        gl::FALSE,
        0,
        gl::WRITE_ONLY,
        POINT_CLOUD_TEXTURE_FORMAT
      );

      println!("-> gl::ActiveTexture(TEXTURE1)");
      gl::ActiveTexture(gl::TEXTURE1);
      println!("-> gl::BindTexture(): {:?}", self.depth_image_texture.id());
      gl::BindTexture(gl::TEXTURE_2D, self.depth_image_texture.id());
      println!("-> gl::BindImageTexture(...): {:?}", self.depth_image_texture.id());
      gl::BindImageTexture(
        1,
        self.depth_image_texture.id(),
        0,
        gl::FALSE,
        0,
        gl::READ_ONLY,
        gl::R16UI, //constexpr GLenum depthImageInternalFormat = GL_R16UI;
      );
      println!("-> gl::Uniform1i(): {:?}", self.depth_image_id);
      gl::Uniform1i(self.depth_image_id, 1);

      println!("-> gl::ActiveTexture(TEXTURE2)");
      gl::ActiveTexture(gl::TEXTURE2);
      println!("-> gl::BindTexture(): {:?}", self.xy_table_texture.id());
      gl::BindTexture(gl::TEXTURE_2D, self.xy_table_texture.id());
      println!("-> gl::BindImageTexture(): {:?}", self.xy_table_texture.id());
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

      // Render point cloud
      println!("-> gl::DispatchCompute(): {}x{}",
        depth_image.get_width_pixels(), depth_image.get_height_pixels());
      gl::DispatchCompute(
        depth_image.get_width_pixels() as u32,
        depth_image.get_height_pixels() as u32,
        1,
      );

      // Wait for the rendering to finish before allowing reads to the texture we just wrote
      println!("-> gl::MemoryBarrier(TEXTURE_FETCH_BARRIER_BIT)");
      gl::MemoryBarrier(gl::TEXTURE_FETCH_BARRIER_BIT);

      // TODO: Return status or error.
      gl_get_error()?;

      Ok(())
    }
  }

  /// Set the XY table that will be used by future calls to Convert().  Get an XY table by calling
  /// GenerateXyTable().
  pub fn set_active_xy_table(&mut self, xy_table: &k4a_sys_wrapper::Image) -> Result<()> {
    let width = xy_table.get_width_pixels() as i32;
    let height = xy_table.get_height_pixels() as i32;

    // Upload the XY table as a texture so we can use it as a uniform
    self.xy_table_texture.init();

    unsafe {
      gl::BindTexture(gl::TEXTURE_2D, self.xy_table_texture.id());
      gl::TexStorage2D(
        gl::TEXTURE_2D,
        1,
        gl::RGB32F, // constexpr GLenum xyTableInternalFormat = GL_RG32F;
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

    // TODO: Return status / error handling
    // GLenum status = glGetError();
    //return status;

    Ok(())
  }

  /// Creates a k4a::image containing the XY tables from calibration based on calibrationType.
  /// The table is a 2D array of k4a_float2_t's with the same resolution as the camera of calibrationType
  /// specified in calibration.
  ///
  /// You can use this table to convert a depth image into a point cloud, e.g. by using the Convert method.
  /// Conversion is done by multiplying the depth pixel value by the XY table values - i.e. the result
  /// pixel will be (xyTable[p].x * depthImage[p], xyTable[p].y * depthImage[p], depthImage[p]), where
  /// p is the index of a given pixel.
  pub fn generate_xy_table(calibration: k4a_sys::k4a_calibration_t,
                           calibration_type: k4a_sys::k4a_calibration_type_t)
    -> Result<Image>
  {

    /*typedef enum
    {
        K4A_CALIBRATION_TYPE_UNKNOWN = -1, /**< Calibration type is unknown */
        K4A_CALIBRATION_TYPE_DEPTH,        /**< Depth sensor */
        K4A_CALIBRATION_TYPE_COLOR,        /**< Color sensor */
        K4A_CALIBRATION_TYPE_GYRO,         /**< Gyroscope sensor */
        K4A_CALIBRATION_TYPE_ACCEL,        /**< Accelerometer sensor */
        K4A_CALIBRATION_TYPE_NUM,          /**< Number of types excluding unknown type*/
    } k4a_calibration_type_t;*/
    let camera_calibration :  k4a_sys::k4a_calibration_camera_t = match calibration_type {
      // k4a_sys::K4A_CALIBRATION_TYPE_COLOR  should be "1" per above enum.
      1 => calibration.color_camera_calibration,
      _ => calibration.depth_camera_calibration,
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

    // k4a_float2_t *tableData = reinterpret_cast<k4a_float2_t *>(xyTable.get_buffer());
    let mut xy_table_buffer = xy_table.get_buffer();

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

    let length = width*height;
    unsafe {
      let mut xy_table_buffer2: *mut k4a_sys::k4a_float2_t = std::mem::transmute_copy(&xy_table_buffer);
      let mut xy_table_buffer3 = std::slice::from_raw_parts_mut(xy_table_buffer2, length as usize);

      for y in 0..height {
        p.xy.y = y as f32;

        for x in 0..width {
          p.xy.x = x as f32;

          let mut valid: c_int = -1;
          let result = unsafe {
            // https://docs.rs/k4a-sys/0.2.0/k4a_sys/fn.k4a_calibration_2d_to_3d.html
            k4a_sys::k4a_calibration_2d_to_3d(
              &calibration,
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
              //println!("This pixel is GOOD: {}, {}", ray.xyz.x, ray.xyz.y);
              xy_table_buffer3[idx].xy.x = ray.xyz.x;
              xy_table_buffer3[idx].xy.y = ray.xyz.y;
            }
          } else {
            unsafe {
              // This pixel is invalid
              //println!("This pixel is invalid: {}", idx);
              xy_table_buffer3[idx].xy.x = 0.0;
              xy_table_buffer3[idx].xy.y = 0.0;
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
