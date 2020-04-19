//! Based off Microsoft's MIT-licensed k4a library code and examples, specifically
//! `k4apointcloudvisualizer.h`

use point_cloud::point_cloud_renderer_shader::{PointCloudRendererShader, PointCloudRendererError};
use k4a_sys_wrapper::{Capture, Transformation};
use k4a_sys_wrapper::Image;
use k4a_sys_wrapper::ImageFormat;
use opengl_wrapper::{Texture, Renderbuffer, Framebuffer};
use point_cloud::point_cloud_compute_shader::{PointCloudComputeShader, PointCloudComputeError};
use std::fmt::{Error, Formatter};
use opengl_wrapper::OpenGlError;
use point_cloud::pixel_structs::BgraPixel;
use point_cloud::pixel_structs::DepthPixel;
use std::mem::size_of;
use point_cloud::viewer_image::ViewerImage;
use rand::Rng;

pub type Result<T> = std::result::Result<T, PointCloudVisualizerError>;

#[derive(Clone, Debug)]
pub enum PointCloudVisualizerError {
  OpenGlError(OpenGlError),
  PointCloudRendererError(PointCloudRendererError),
  PointCloudComputeError(PointCloudComputeError),
  FramebufferError,
  /// Capture is missing depth info; drop the frame
  MissingDepthImage,
  /// Capture is missing color info; drop the frame
  MissingColorImage,
  // TODO: Implement this
  ColorSupportNotYetImplemented,
  UnsupportedMode,
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
      PointCloudVisualizerError::PointCloudComputeError(inner) => {
        format!("Visualizer PointCloudCompute error: {}", inner)
      },
      PointCloudVisualizerError::FramebufferError => "Visualizer Framebuffer Error".into(),
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
  // TODO: std::pair<DepthPixel, DepthPixel> m_expectedValueRange;
  // TODO: ImageDimensions m_dimensions;
  // TODO: ViewControl m_viewControl;
  // TODO: linmath::mat4x4 m_projection{};
  // TODO: linmath::mat4x4 m_view{};

  width: u16,
  height: u16,

  enable_color_point_cloud: bool,
  colorization_strategy: ColorizationStrategy,

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

// TODO: Dedup
struct CleanupGuard {}

impl Drop for CleanupGuard {
  fn drop(&mut self) {
    println!("Running CleanupGuard");
    unsafe {
      println!("-> gl::BindFramebuffer(0) [cleanup]");
      gl::BindFramebuffer(gl::FRAMEBUFFER, 0);
    }
  }
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

    // TODO: Entirely guessing here.
    /*let depth_image = Image::create(
      ImageFormat::Depth16,
      width as u32,
      height as u32,
      0
    ).expect("should allocate");*/

    let color_strategy = ColorizationStrategy::Color;

    let mut visualizer = Self {
      width: width as u16,
      height: height as u16,
      enable_color_point_cloud,
      point_cloud_renderer: PointCloudRendererShader::new(),
      point_cloud_converter: PointCloudComputeShader::new(),
      frame_buffer: Framebuffer::new_initialized(),
      depth_buffer,
      color_xy_table,
      depth_xy_table,
      colorization_strategy: color_strategy,
      calibration_data: calibration_data.clone(),
      transformation: Transformation::from_calibration(&calibration_data),
      last_capture: None,
      transformed_depth_image: None,
      point_cloud_colorization: None,
      xyz_texture: Texture::new(),
    };

    visualizer.set_colorization_strategy(color_strategy).expect("Should work");

    visualizer
  }

  pub fn set_point_size(&mut self, point_size: u8) {
    self.point_cloud_renderer.set_point_size(point_size);
  }

  pub fn update_texture(&mut self, texture: &ViewerImage, capture: Capture) -> Result<()> {
    println!("==== Visualizer.update_texture()");

    // Update the point cloud renderer with the latest point data
    self.update_point_clouds(capture)?;

    // Set up rendering to a texture
    unsafe {
      println!("-> gl::BindRenderbuffer(): {:?}", self.depth_buffer.id());
      gl::BindRenderbuffer(gl::RENDERBUFFER, self.depth_buffer.id());
      println!("-> gl::BindFramebuffer(): {:?}", self.frame_buffer.id());
      gl::BindFramebuffer(gl::FRAMEBUFFER, self.frame_buffer.id());
    }

    // CleanupGuard frameBufferBindingGuard([]() { glBindFramebuffer(GL_FRAMEBUFFER, 0); });
    let cleanup_guard = CleanupGuard {};

    unsafe {
      println!("-> gl::FramebufferRenderbuffer(...)");
      gl::FramebufferRenderbuffer(gl::FRAMEBUFFER, gl::DEPTH_ATTACHMENT, gl::RENDERBUFFER, self.depth_buffer.id());
      // TODO:
      //  glFramebufferTexture(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, static_cast<GLuint>(**texture), 0);
      //  gl::FramebufferTexture(gl::FRAMEBUFFER, gl::COLOR_ATTACHMENT0, texture_buffer, 0);
      gl::FramebufferTexture(gl::FRAMEBUFFER, gl::COLOR_ATTACHMENT0, texture.texture_id(), 0);

      println!("-> gl::DrawBuffers(COLOR_ATTACHMENT0)");
      gl::DrawBuffers(1, &gl::COLOR_ATTACHMENT0);

      println!("-> gl::CheckFramebufferStatus()");
      let frame_buffer_status = gl::CheckFramebufferStatus(gl::FRAMEBUFFER);

      if frame_buffer_status != gl::FRAMEBUFFER_COMPLETE {
        return Err(PointCloudVisualizerError::FramebufferError);
      }

      println!("-> gl::Viewport() {}x{}", self.width, self.height);
      gl::Viewport(0, 0, self.width as i32, self.height as i32);

      println!("-> gl::Enable(DEPTH_TEST");
      gl::Enable(gl::DEPTH_TEST);
      println!("-> gl::ClearColor()");
      gl::ClearColor(0.0, 0.0, 0.0, 0.0);
      println!("-> gl::Clear(COLOR,DEPTH)");
      gl::Clear(gl::COLOR_BUFFER_BIT | gl::DEPTH_BUFFER_BIT);
    }

    // TODO: View matrix maths
    self.point_cloud_renderer.update_view_projection();

    let render_status = self.point_cloud_renderer.render();

    unsafe {
      println!("-> gl::BindRenderbuffer(RENDERBUFFER, 0)");
      gl::BindRenderbuffer(gl::RENDERBUFFER, 0);
    }

    render_status
        .map_err(|err| PointCloudVisualizerError::PointCloudRendererError(err))
  }

  fn update_point_clouds(&mut self, capture: Capture) -> Result<()> {
    println!("==== Visualizer.update_point_clouds() [from kinect capture]");
    println!("colorization strategy = {:?}", self.colorization_strategy);

    let mut depth_image = match capture.get_depth_image() {
      Ok(img) => img,
      Err(e) => {
        println!("<< Missing Depth Image >> ");
        // Capture doesn't have depth info. Drop the capture.
        return Err(PointCloudVisualizerError::MissingDepthImage);
      },
    };

    let maybe_color_image = capture.get_color_image();

    if self.enable_color_point_cloud {
      if maybe_color_image.is_err() {
        println!("<< Missing Color Image >> ");
        return Err(PointCloudVisualizerError::MissingColorImage);
      }
      if self.colorization_strategy == ColorizationStrategy::Color {

        /*let mut transformed_depth_image = self.transformed_depth_image.take()
            .expect("Must be present");*/

        if let Some(transformed_depth_image) = self.transformed_depth_image.as_ref() {
          println!("Take transformed depth image...");
          unsafe {
            // TODO: Totally missed error handling here.
            k4a_sys::k4a_transformation_depth_image_to_color_camera(
              self.transformation.get_handle(),
              depth_image.get_handle(),
              transformed_depth_image.get_handle(),
            );

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

    self.last_capture = Some(capture); // TODO: Inefficient. Should take ownership.

    if self.colorization_strategy == ColorizationStrategy::Color {
      // TODO
      //  m_pointCloudColorization = std::move(colorImage);
      //return Err(PointCloudVisualizerError::ColorSupportNotYetImplemented);
      self.point_cloud_colorization = Some(maybe_color_image
          .expect("logic above should handle"));

    } else {
      // This creates a color spectrum based on depth.

      let length = depth_image.get_size();
      let dst_length = length / size_of::<BgraPixel>();

      let mut rng = rand::thread_rng();

      unsafe {
        // src: DepthPixel
        let mut src_pixel = depth_image.get_buffer();
        let mut src_pixel_2: *mut DepthPixel = std::mem::transmute_copy(&src_pixel);
        let mut src_pixel_3= std::slice::from_raw_parts_mut(src_pixel_2, length as usize);

        // dst: BgraPixel
        let mut dst_pixel = self.point_cloud_colorization
            .as_ref()
            .expect("point cloud color image must be set")
            .get_buffer();

        let mut dst_pixel_2: *mut BgraPixel = std::mem::transmute_copy(&dst_pixel);
        let mut dst_pixel_3= std::slice::from_raw_parts_mut(dst_pixel_2, dst_length as usize);

        // TODO
        //  let end_pixel = dst_pixel_3 + dst_length;
        /*while src_pixel_3 != end_pixel {
          // TODO
          //  *dstPixel = K4ADepthPixelColorizer::ColorizeBlueToRed(*srcPixel,
          //    m_expectedValueRange.first,
          //    m_expectedValueRange.second);
          dst_pixel_3 += 1;
          src_pixel_3 += 1;
        }*/

        // TODO: This should help us see output.
        for i in 0 .. dst_length {
          dst_pixel_3[i].blue = rng.gen_range(0, 255);
          dst_pixel_3[i].green = rng.gen_range(0, 255);
          dst_pixel_3[i].red = rng.gen_range(0, 255);
          dst_pixel_3[i].alpha = rng.gen_range(0, 255);
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

  pub fn set_colorization_strategy(&mut self, strategy: ColorizationStrategy) -> Result<()> {
    if strategy == ColorizationStrategy::Color && !self.enable_color_point_cloud {
      return Err(PointCloudVisualizerError::UnsupportedMode);
    }

    self.colorization_strategy = strategy;
    self.point_cloud_renderer.set_enable_shading(strategy == ColorizationStrategy::Shaded);

    let xy_table_status = if strategy == ColorizationStrategy::Color {
      // sizeof DepthPixel = uint16_t;
      let stride = self.calibration_data.color_camera_calibration.resolution_width * 2;
      self.transformed_depth_image = Some(Image::create(
        ImageFormat::Depth16,
        self.calibration_data.color_camera_calibration.resolution_width as u32,
        self.calibration_data.color_camera_calibration.resolution_height as u32,
        stride as u32,
      ).expect("Construction should work FIXME"));

      self.point_cloud_converter.set_active_xy_table(&self.color_xy_table)

    } else {
      /* struct BgraPixel
          {
              uint8_t Blue;
              uint8_t Green;
              uint8_t Red;
              uint8_t Alpha;
          }; */
      let stride = self.calibration_data.depth_camera_calibration.resolution_width * 4;
      self.point_cloud_colorization = Some(Image::create(
        ImageFormat::Depth16,
        self.calibration_data.color_camera_calibration.resolution_width as u32,
        self.calibration_data.color_camera_calibration.resolution_height as u32,
        stride as u32,
      ).expect("Construction should work FIXME"));

      self.point_cloud_converter.set_active_xy_table(&self.depth_xy_table)
    };

    if let Err(e) = xy_table_status {
      return Err(PointCloudVisualizerError::PointCloudComputeError(e));
    }

    self.xyz_texture.reset();

    if let Some(capture) = self.last_capture.take().map(|cap| cap) {
      self.update_point_clouds(capture); // TODO: INEFFICIENT CLONE.
    }

    Ok(())
  }
}
