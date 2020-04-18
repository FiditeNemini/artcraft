//! Based off Microsoft's MIT-licensed k4a library code and examples, specifically
//! `k4apointcloudvisualizer.h`

use point_cloud::point_cloud_renderer_shader::{PointCloudRendererShader, PointCloudRendererError};
use k4a_sys_wrapper::{Capture, Transformation};
use k4a_sys_wrapper::Image;
use opengl_wrapper::{Texture, Renderbuffer, Framebuffer};
use point_cloud::point_cloud_compute_shader::PointCloudComputeShader;
use std::fmt::{Error, Formatter};
use opengl_wrapper::OpenGlError;

pub type Result<T> = std::result::Result<T, PointCloudVisualizerError>;


#[derive(Clone, Debug)]
pub enum PointCloudVisualizerError {
  OpenGlError(OpenGlError),
  PointCloudRendererError(PointCloudRendererError),
  FramebufferError,
  UnknownError,
}

impl std::fmt::Display for PointCloudVisualizerError {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    let description = match self {
      PointCloudVisualizerError::OpenGlError(inner) => {
        format!("Visualizer OpenGL error: {}", inner)
      },
      PointCloudVisualizerError::PointCloudRendererError(inner) => {
        format!("Visualizer PointCloudRenderer error: {}", inner)
      },
      PointCloudVisualizerError::FramebufferError => "Visualizer Framebuffer Error".into(),
      PointCloudVisualizerError::UnknownError => "Visualizer Unknown Error".into(),
    };

    write!(f, "{}", description)
  }
}

impl std::error::Error for PointCloudVisualizerError {
  fn source(&self) -> Option<&(dyn std::error::Error +'static)> {
    // Generic error, no backtrace.
    None
  }
}

pub struct PointCloudVisualizer {
  // TODO: std::pair<DepthPixel, DepthPixel> m_expectedValueRange;
  // TODO: ImageDimensions m_dimensions;
  // TODO: ViewControl m_viewControl;
  // TODO: ColorizationStrategy m_colorizationStrategy;
  // TODO: linmath::mat4x4 m_projection{};
  // TODO: linmath::mat4x4 m_view{};

  width: u16,
  height: u16,

  enable_color_point_cloud: bool,

  point_cloud_renderer: PointCloudRendererShader,
  point_cloud_converter: PointCloudComputeShader,

  calibration_data: k4a_sys::k4a_calibration_t,
  transformation: Transformation, // TODO: WAT k4a_sys::k4a_transformation_t

  frame_buffer: Framebuffer,
  depth_buffer: Renderbuffer,

  last_capture: Option<Capture>,

  /// Buffer that holds the depth image transformed to the color coordinate space.
  /// Used in color mode only.
  transformed_depth_image: Option<Image>,

  /// In color mode, this is just a shallow copy of the latest color image.
  /// In depth mode, this is a buffer that holds the colorization of the depth image.
  point_cloud_colorization: Option<Image>,

  /// Holds the XYZ point cloud as a texture.
  /// Format is XYZA, where A (the alpha channel) is unused.
  xyz_texture: Texture,

  color_xy_table: Image,
  depth_xy_table: Image,
}

impl PointCloudVisualizer {
  pub fn new(enable_color_point_cloud: bool,
             calibration_data: k4a_sys::k4a_calibration_t) -> Self
  {
    // TODO:
    let width = 800;
    let height= 800;

    let depth_buffer = Renderbuffer::new_initialized();

    unsafe {
      gl::BindRenderbuffer(gl::RENDERBUFFER, depth_buffer.id());
      gl::RenderbufferStorage(gl::RENDERBUFFER, gl::DEPTH_COMPONENT, width, height);
    }

    /*typedef enum
    {
        K4A_CALIBRATION_TYPE_UNKNOWN = -1, /**< Calibration type is unknown */
        K4A_CALIBRATION_TYPE_DEPTH,        /**< Depth sensor */
        K4A_CALIBRATION_TYPE_COLOR,        /**< Color sensor */
        K4A_CALIBRATION_TYPE_GYRO,         /**< Gyroscope sensor */
        K4A_CALIBRATION_TYPE_ACCEL,        /**< Accelerometer sensor */
        K4A_CALIBRATION_TYPE_NUM,          /**< Number of types excluding unknown type*/
    } k4a_calibration_type_t;*/

    // TODO: generate color xytable only on `enable_color_point_cloud`.
    let color_xy_table = PointCloudComputeShader::generate_xy_table(
      calibration_data.clone(),
      1, //k4a_sys::K4A_CALIBRATION_TYPE_COLOR,
    ).unwrap();

    let depth_xy_table = PointCloudComputeShader::generate_xy_table(
      calibration_data.clone(),
      0, // k4a_sys::K4A_CALIBRATION_TYPE_DEPTH,
    ).unwrap();

    // TODO: C++ does further construction within the CTOR by calling:
    //  SetColorizationStrategy(m_colorizationStrategy);

    Self {
      width: width as u16,
      height: height as u16,
      enable_color_point_cloud,
      point_cloud_renderer: PointCloudRendererShader::new(),
      point_cloud_converter: PointCloudComputeShader::new(),
      frame_buffer: Framebuffer::new_initialized(),
      depth_buffer,
      color_xy_table,
      depth_xy_table,
      calibration_data: calibration_data.clone(),
      transformation: Transformation::from_calibration(&calibration_data),
      last_capture: None,
      transformed_depth_image: None,
      point_cloud_colorization: None,
      xyz_texture: Texture::new(),
    }
  }

  pub fn set_point_size(&mut self, point_size: u8) {
    self.point_cloud_renderer.set_point_size(point_size);
  }

  // TODO
  pub fn set_colorization_strategy(&mut self) {
    unimplemented!();
  }

  pub fn update_texture(&mut self) -> Result<()> {

    /* TODO // Update the point cloud renderer with the latest point data
    //
    PointCloudVisualizationResult result = UpdatePointClouds(capture);
    if (result != PointCloudVisualizationResult::Success)
    {
      return result;
    }*/


    // Set up rendering to a texture
    unsafe {
      gl::BindRenderbuffer(gl::RENDERBUFFER, self.depth_buffer.id());
      gl::BindFramebuffer(gl::FRAMEBUFFER, self.frame_buffer.id());
    }

    // TODO
    //  CleanupGuard frameBufferBindingGuard([]() { glBindFramebuffer(GL_FRAMEBUFFER, 0); });

    unsafe {
      gl::FramebufferRenderbuffer(gl::FRAMEBUFFER, gl::DEPTH_ATTACHMENT, gl::RENDERBUFFER, self.depth_buffer.id());
      // TODO:
      //  glFramebufferTexture(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, static_cast<GLuint>(**texture), 0);
      //  gl::FramebufferTexture(gl::FRAMEBUFFER, gl::COLOR_ATTACHMENT0, texture_buffer, 0);

      gl::DrawBuffers(1, &gl::COLOR_ATTACHMENT0);

      let frame_buffer_status = gl::CheckFramebufferStatus(gl::FRAMEBUFFER);

      if frame_buffer_status != gl::FRAMEBUFFER_COMPLETE {
        return Err(PointCloudVisualizerError::FramebufferError);
      }

      gl::Viewport(0, 0, self.width as i32, self.height as i32);

      gl::Enable(gl::DEPTH_TEST);
      gl::ClearColor(0.0, 0.0, 0.0, 0.0);
      gl::Clear(gl::COLOR_BUFFER_BIT | gl::DEPTH_BUFFER_BIT);
    }

    // TODO: View matrix maths
    self.point_cloud_renderer.update_view_projection();

    let render_status = self.point_cloud_renderer.render();

    unsafe {
      gl::BindRenderbuffer(gl::RENDERBUFFER, 0);
    }

    render_status
        .map_err(|err| PointCloudVisualizerError::PointCloudRendererError(err))
  }

  fn update_point_clouds(&mut self) -> Result<()> {

    unimplemented!();
  }
}
