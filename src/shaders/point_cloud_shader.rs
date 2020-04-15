use std::ffi::CString;
use std::ptr;
use std::str;
use libc;

use gl;
use gl::types::*;

use k4a_sys_wrapper;
use std::mem::size_of;
use std::ptr::null;

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

const POINT_CLOUD_TEXTURE_FORMAT : GLuint = gl::RGBA32F;

pub struct PointCloudComputeShader {
  program_id: GLuint,
  shader_id: GLuint,
  output_texture: GLuint,
}

impl PointCloudComputeShader {

  pub fn create() -> Self {
    let program = unsafe { gl::CreateProgram() };
    let shader = compile_shader(COMPUTE_SHADER_SRC, gl::COMPUTE_SHADER);

    link_program(program, shader);

    // TODO: Build this elsewhere?
    let mut output_texture = 0;
    unsafe { gl::GenTextures(1, &mut output_texture); }

    PointCloudComputeShader {
      shader_id: shader,
      program_id: program,
      output_texture,
    }
  }

  // Creates a k4a::image containing the XY tables from calibration based on calibrationType.
  // The table is a 2D array of k4a_float2_t's with the same resolution as the camera of calibrationType
  // specified in calibration.
  //
  // You can use this table to convert a depth image into a point cloud, e.g. by using the Convert method.
  // Conversion is done by multiplying the depth pixel value by the XY table values - i.e. the result
  // pixel will be (xyTable[p].x * depthImage[p], xyTable[p].y * depthImage[p], depthImage[p]), where
  // p is the index of a given pixel.
  //
  pub fn generate_xy_table(calibration: k4a_sys::k4a_calibration_t,
                           calibration_type: k4a_sys::k4a_calibration_type_t) -> Result<k4a_sys_wrapper::Image, ()> {

    unimplemented!();
  }

  // Set the XY table that will be used by future calls to Convert().  Get an XY table by calling
  // GenerateXyTable().
  pub fn set_active_xy_table(&mut self, xy_table: k4a_sys_wrapper::Image) {
    unimplemented!();
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
  pub fn convert(&self, depth_image: k4a_sys_wrapper::Image) -> Result<(),()> {
    /*// TODO xy_table_texture

    let width = depth_image.get_width_pixels();
    let height = depth_image.get_height_pixels();

    // TODO - init output_texture
    gl::ActiveTexture(gl::TEXTURE0);
    gl::BindTexture(gl::TEXTURE_2D, self.output_texture);

    // The format that the point cloud texture uses internally to store points.
    // If you want to use the texture that this outputs from your shader, you
    // need to pass this as the format argument to glBindImageTexture().
    // static constexpr GLenum PointCloudTextureFormat = GL_RGBA32F;
    gl::TexStorage2d(gl::TEXTURE_2D, 1, POINT_CLOUD_TEXTURE_FORMAT, width, height);

    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::NEAREST);
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::NEAREST);

    // Upload data to uniform texture
    gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, depth_image_pixel_buffer);
    gl::BindTexture(gl::TEXTURE_2D, depth_image_texture);

    let num_bytes : GLuint = width * height * size_of::<u16>(); // libc::uint16_t = u16

    // TODO: GLubyte *textureMappedBuffer = reinterpret_cast<GLubyte *>(...)
    let texture_mapped_buffer =
        gl::MapBufferRange(gl::PIXEL_UNPACK_BUFFER, 0, gl::MAP_WRITE_BIT | gl::MAP_INVALIDATE_BUFFER_BIT);

    // TODO: Handle error.

    let mut depth_src  = depth_image.get_buffer();

    // TODO: std::copy(depthSrc, depthSrc + numBytes, textureMappedBuffer);

    gl::UnmapBuffer(gl::PIXEL_UNPACK_BUFFER);

    // TODO: Handle error.

    gl::TexSubImage2D(
      gl::TEXTURE_2D, // target
      0, // level
      0, // x offset
      0, // y offset
      width,
      height,
      depth_image_data_format,
      depth_image_data_type,
      null(), // data
    );

    gl::BindBuffer(gl::PIXEL_UNPACK_BUFFER, 0);

    gl::UseProgram(self.shader_id);

    // Bind textures that we're going to pass to the texture
    gl::ActiveTexture(gl::TEXTURE0);
    gl::BindTexture(gl::TEXTURE_2D, self.output_texture);
    gl::BindImageTexture(0, self.output_texture, 0, gl::FALSE, 0, gl::WRITE_ONLY, POINT_CLOUD_TEXTURE_FORMAT);

    gl::ActiveTexture(gl::TEXTURE1);
    gl::BindTexture(gl::TEXTURE_2D, depth_image_texture);
    gl::BindImageTexture(1, depth_image_texture, 0, gl::FALSE, 0, gl::READ_ONLY, depth_image_internal_format);
    gl::Uniform1i(depth_image_id, 1);

    gl::ActiveTexture(GL_TEXTURE2);
    gl::BindTexture(GL_TEXTURE_2D, xy_table_texture_id);
    gl::BindImageTexture(2, xy_table_texture_id, 0, gl::FALSE, 0, gl::READ_ONLY, xy_table_internal_format);
    gl::Uniform1i(xy_table_id, 2);

    // Render point cloud
    //gl::DispatchCompute(static_cast<GLuint>(depth.get_width_pixels()), static_cast<GLuint>(depth.get_height_pixels()), 1);

    // Wait for the rendering to finish before allowing reads to the texture we just wrote
    gl::MemoryBarrier(gl::TEXTURE_FETCH_BARRIER_BIT);

    let status = gl::GetError();

    */
    unimplemented!();
  }
}

pub fn compile_shader(src: &str, ty: GLenum) -> GLuint {
  let shader;
  unsafe {
    shader = gl::CreateShader(ty);
    // Attempt to compile the shader
    let c_str = CString::new(src.as_bytes()).unwrap();
    gl::ShaderSource(shader, 1, &c_str.as_ptr(), ptr::null());
    gl::CompileShader(shader);

    // Get the compile status
    let mut status = gl::FALSE as GLint;
    gl::GetShaderiv(shader, gl::COMPILE_STATUS, &mut status);

    // Fail on error
    if status != (gl::TRUE as GLint) {
      let mut len = 0;
      gl::GetShaderiv(shader, gl::INFO_LOG_LENGTH, &mut len);
      let mut buf = Vec::with_capacity(len as usize);
      buf.set_len((len as usize) - 1); // subtract 1 to skip the trailing null character
      gl::GetShaderInfoLog(
        shader,
        len,
        ptr::null_mut(),
        buf.as_mut_ptr() as *mut GLchar,
      );
      panic!(
        "{}",
        str::from_utf8(&buf)
            .ok()
            .expect("ShaderInfoLog not valid utf8")
      );
    }
  }
  shader
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
