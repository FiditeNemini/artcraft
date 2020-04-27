//! Based off Microsoft's MIT-licensed k4a library code and examples, specifically
//! `k4apointcloudvisualizer.h`

use gl::types::*;
use k4a_sys_wrapper::Image;
use k4a_sys_wrapper::ImageFormat;
use k4a_sys_wrapper::{Capture, Transformation};
use opengl_wrapper::OpenGlError;
use opengl_wrapper::{Texture, Renderbuffer, Framebuffer};
use point_cloud::pixel_structs::BgraPixel;
use point_cloud::pixel_structs::DepthPixel;
use point_cloud::gpu_point_cloud_converter::{GpuPointCloudConverter, PointCloudComputeError};
use point_cloud::point_cloud_renderer::{PointCloudRenderer, PointCloudRendererError};
use point_cloud::viewer_image::ViewerImage;
use rand::Rng;
use std::fmt::{Error, Formatter};
use std::mem::size_of;
use conversion::k4a_image_to_rust_image_for_debug;
use std::path::Path;
use point_cloud::util::{ValueRange, get_depth_mode_range, colorize_depth_blue_to_red};

pub type Result<T> = std::result::Result<T, PointCloudVisualizerError>;

#[derive(Clone, Debug)]
pub enum PointCloudVisualizerError {
  OpenGlError(OpenGlError),
  PointCloudRendererError(PointCloudRendererError),
  PointCloudComputeError(PointCloudComputeError),
  FramebufferError,
  DepthToColorConversionFailed,
  /// Capture is missing depth info; drop the frame
  MissingDepthImage,
  /// Capture is missing color info; drop the frame
  MissingColorImage,
  // TODO: Implement this
  ColorSupportNotYetImplemented,
  UnsupportedMode,
  UnknownError,
}

impl From<OpenGlError> for PointCloudVisualizerError {
  fn from(error: OpenGlError) -> Self {
    PointCloudVisualizerError::OpenGlError(error)
  }
}

impl From<PointCloudComputeError> for PointCloudVisualizerError {
  fn from(error: PointCloudComputeError) -> Self {
    PointCloudVisualizerError::PointCloudComputeError(error)
  }
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
      PointCloudVisualizerError::PointCloudComputeError(inner) => {
        format!("Visualizer PointCloudCompute error: {}", inner)
      },
      PointCloudVisualizerError::FramebufferError => "Visualizer Framebuffer Error".into(),
      PointCloudVisualizerError::DepthToColorConversionFailed => "Visualizer Depth To Color Conversion Error".into(),
      PointCloudVisualizerError::UnsupportedMode => "Visualizer Unsupported Mode Error".into(),
      PointCloudVisualizerError::MissingDepthImage => "Visualizer Missing Depth Image (drop frame)".into(),
      PointCloudVisualizerError::MissingColorImage => "Visualizer Missing Color Image (drop frame)".into(),
      PointCloudVisualizerError::ColorSupportNotYetImplemented => "Visualizer Color Support Not Yet Implemented (TODO)".into(),
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

#[derive(Copy, Clone, Debug, PartialEq)]
pub enum ColorizationStrategy {
  Simple,
  Shaded,
  Color,
}

pub struct PointCloudVisualizer {
  // TODO: ViewControl m_viewControl;
  // TODO: linmath::mat4x4 m_projection{};
  // TODO: linmath::mat4x4 m_view{};

  m_dimensions_width : i32,
  m_dimensions_height : i32,

  enable_color_point_cloud: bool,
  colorization_strategy: ColorizationStrategy,

  pub point_cloud_renderer: PointCloudRenderer,
  pub point_cloud_converter: GpuPointCloudConverter,

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
  pub xyz_texture: Texture,

  color_xy_table: Image,
  depth_xy_table: Image,

  /// Near and far minima/maxima for the current depth sensor mode.
  depth_value_range: ValueRange,
}

// TODO: Dedup
struct CleanupGuard {}

impl Drop for CleanupGuard {
  fn drop(&mut self) {
    unsafe {
      gl::BindFramebuffer(gl::FRAMEBUFFER, 0);
    }
  }
}

impl PointCloudVisualizer {

  ///
  ///
  ///
  pub fn new(enable_color_point_cloud: bool,
             initial_colorization_strategy: ColorizationStrategy,
             calibration_data: k4a_sys::k4a_calibration_t) -> Self
  {
    // Resolution of the point cloud texture
    // constexpr ImageDimensions PointCloudVisualizerTextureDimensions = { 1280, 1152 };
    let width = 1280;
    let height= 1152;

    let depth_buffer = Renderbuffer::new_initialized();

    unsafe {
      gl::BindRenderbuffer(gl::RENDERBUFFER, depth_buffer.id());
      gl::RenderbufferStorage(gl::RENDERBUFFER, gl::DEPTH_COMPONENT, width, height);
    }

    // TODO: generate color xytable only on `enable_color_point_cloud`.
    let color_xy_table = GpuPointCloudConverter::generate_xy_table(
      calibration_data.clone(),
      k4a_sys::k4a_calibration_type_t_K4A_CALIBRATION_TYPE_COLOR,
    ).unwrap();

    let depth_xy_table = GpuPointCloudConverter::generate_xy_table(
      calibration_data.clone(),
      k4a_sys::k4a_calibration_type_t_K4A_CALIBRATION_TYPE_DEPTH,
    ).unwrap();

    let expected_value_range = get_depth_mode_range(calibration_data.depth_mode)
        .expect("Should be in correct depth sensor mode.");

    let mut visualizer = Self {
      m_dimensions_width: width,
      m_dimensions_height: height,
      enable_color_point_cloud,
      point_cloud_renderer: PointCloudRenderer::new(),
      point_cloud_converter: GpuPointCloudConverter::new(),
      frame_buffer: Framebuffer::new_initialized(),
      depth_buffer,
      color_xy_table,
      depth_xy_table,
      colorization_strategy: initial_colorization_strategy,
      calibration_data: calibration_data.clone(),
      transformation: Transformation::from_calibration(&calibration_data),
      last_capture: None,
      transformed_depth_image: None,
      point_cloud_colorization: None,
      xyz_texture: Texture::new(),
      depth_value_range: expected_value_range,
    };

    visualizer.set_colorization_strategy(initial_colorization_strategy).expect("Should work");

    visualizer
  }

  ///
  ///
  ///
  pub fn set_point_size(&mut self, point_size: u8) {
    self.point_cloud_renderer.set_point_size(point_size);
  }

  ///
  ///
  ///
  pub fn update_texture(&mut self, texture: &ViewerImage, capture: Capture) -> Result<()> {
    self.update_texture_id(texture.texture_id(), capture)
  }

  ///
  ///
  ///
  pub fn update_texture_id(&mut self, texture_id: GLuint, capture: Capture) -> Result<()> {
    // Update the point cloud renderer with the latest point data
    self.update_point_clouds(capture)?;

    // Set up rendering to a texture
    unsafe {
      gl::BindRenderbuffer(gl::RENDERBUFFER, self.depth_buffer.id());
      gl::BindFramebuffer(gl::FRAMEBUFFER, self.frame_buffer.id());
    }

    let cleanup_guard = CleanupGuard {};

    unsafe {
      gl::FramebufferRenderbuffer(
        gl::FRAMEBUFFER,
        gl::DEPTH_ATTACHMENT,
        gl::RENDERBUFFER,
        self.depth_buffer.id()
      );

      gl::FramebufferTexture(gl::FRAMEBUFFER, gl::COLOR_ATTACHMENT0, texture_id, 0);

      // DrawBuffers writes to a COLOR BUFFER
      // COLOR_ATTACHMENT{N} - The fragment shader output value is written into the nth color
      // attachment of the current framebuffer.
      gl::DrawBuffers(1, &gl::COLOR_ATTACHMENT0);

      let frame_buffer_status = gl::CheckFramebufferStatus(gl::FRAMEBUFFER);

      if frame_buffer_status != gl::FRAMEBUFFER_COMPLETE {
        return Err(PointCloudVisualizerError::FramebufferError);
      }

      gl::Viewport(0, 0, self.m_dimensions_width, self.m_dimensions_height);
      gl::Enable(gl::DEPTH_TEST);
      gl::ClearColor(0.3, 0.3, 0.3, 0.3);
      gl::ClearDepth(1.0);

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

  ///
  ///
  ///
  fn update_point_clouds(&mut self, capture: Capture) -> Result<()> {
    let mut depth_image = match capture.get_depth_image() {
      Ok(img) => img,
      Err(e) => {
        // Capture doesn't have depth info. Drop the capture.
        return Err(PointCloudVisualizerError::MissingDepthImage);
      },
    };

    let maybe_color_image = capture.get_color_image();

    if self.enable_color_point_cloud {
      if maybe_color_image.is_err() {
        return Err(PointCloudVisualizerError::MissingColorImage);
      }
      if self.colorization_strategy == ColorizationStrategy::Color {
        if let Some(transformed_depth_image) = self.transformed_depth_image.as_mut() {
          unsafe {

            /*k4a_image_to_rust_image_for_debug(&depth_image)
                .unwrap()
                .save(Path::new("debug_images/depth_before_transform.png"))
                .unwrap();*/

            let result = k4a_sys::k4a_transformation_depth_image_to_color_camera(
              self.transformation.get_handle(),
              depth_image.get_handle(),
              transformed_depth_image.get_handle(),
            );

            if result != k4a_sys::k4a_buffer_result_t_K4A_BUFFER_RESULT_SUCCEEDED {
              return Err(PointCloudVisualizerError::DepthToColorConversionFailed);
            }

            /*k4a_image_to_rust_image_for_debug(&transformed_depth_image)
                .unwrap()
                .save(Path::new("debug_images/depth_after_transform.png"))
                .unwrap();*/

            depth_image = transformed_depth_image.clone();
          }
        }
      }
    }

    let result = self.point_cloud_converter.convert(
      &depth_image,
      &mut self.xyz_texture
    );

    if let Err(err) = result {
      return Err(PointCloudVisualizerError::PointCloudComputeError(err));
    }

    self.last_capture = Some(capture);

    if self.colorization_strategy == ColorizationStrategy::Color {
      let color_image = maybe_color_image.expect("logic above should ensure present");
      self.point_cloud_colorization = Some(color_image);

    } else {
      // This creates a color spectrum based on depth.
      let dst_length = depth_image.get_width_pixels() * depth_image.get_height_pixels();

      unsafe {
        // src: DepthPixel
        let mut src_pixel_buffer = depth_image.get_buffer();
        let mut typed_src_pixel_buffer = src_pixel_buffer as *const DepthPixel;

        // dst: BgraPixel
        let mut dst_pixel_buffer = self.point_cloud_colorization
            .as_ref()
            .expect("point cloud color image must be set")
            .get_buffer();

        let mut typed_dst_pixel_buffer = dst_pixel_buffer as *mut BgraPixel;

        for i in 0 .. dst_length as isize {
          let src_pixel = *typed_src_pixel_buffer.offset(i);
          let pixel = colorize_depth_blue_to_red(src_pixel, &self.depth_value_range);
          (*typed_dst_pixel_buffer.offset(i)).red = pixel.red;
          (*typed_dst_pixel_buffer.offset(i)).green = pixel.green;
          (*typed_dst_pixel_buffer.offset(i)).blue = pixel.blue;
          (*typed_dst_pixel_buffer.offset(i)).alpha = pixel.alpha;
        }
      }
    }

    self.point_cloud_renderer.update_point_clouds(
      &self.point_cloud_colorization
          .as_ref()
          .expect("point cloud color image be set"),
      &self.xyz_texture
    ).map_err(|err| PointCloudVisualizerError::PointCloudRendererError(err))
  }

  ///
  ///
  ///
  pub fn set_colorization_strategy(&mut self, strategy: ColorizationStrategy) -> Result<()> {
    if strategy == ColorizationStrategy::Color && !self.enable_color_point_cloud {
      return Err(PointCloudVisualizerError::UnsupportedMode);
    }

    self.colorization_strategy = strategy;
    self.point_cloud_renderer.set_enable_shading(strategy == ColorizationStrategy::Shaded);

    if strategy == ColorizationStrategy::Color {
      let width = self.calibration_data.color_camera_calibration.resolution_width;
      let height = self.calibration_data.color_camera_calibration.resolution_height;
      //let width = 3840;
      //let height = 2160;
      let stride = width * size_of::<DepthPixel>() as i32;

      for _ in 0..10 {
        println!("setting color calibration: {}x{} (stride={})", width, height, stride);
      }

      self.transformed_depth_image = Some(Image::create(
        ImageFormat::Depth16,
        width as u32,
        height as u32,
        stride as u32,
      ).expect("Construction should work FIXME"));

      self.point_cloud_converter.set_active_xy_table(&self.color_xy_table)?;

    } else {
      let width = self.calibration_data.depth_camera_calibration.resolution_width as u32;
      let height = self.calibration_data.depth_camera_calibration.resolution_height as u32;
      let stride = width as i32 * size_of::<BgraPixel>() as i32;

      for _ in 0..10 {
        println!("setting depth calibration: {}x{} (stride={})", width, height, stride);
      }

      self.point_cloud_colorization = Some(Image::create(
        ImageFormat::ColorBgra32,
        width,
        height,
        stride as u32,
      ).expect("Construction should work FIXME"));

      self.point_cloud_converter.set_active_xy_table(&self.depth_xy_table)?;
    }

    self.xyz_texture.reset();

    if let Some(capture) = self.last_capture.as_ref() {
      let capture = (*capture).clone();
      self.update_point_clouds(capture);
    }

    Ok(())
  }
}
