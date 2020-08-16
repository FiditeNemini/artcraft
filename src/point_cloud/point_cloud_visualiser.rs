//! Based off Microsoft's MIT-licensed k4a library code and examples, specifically
//! `k4apointcloudvisualizer.h`

use std::fmt::Formatter;
use std::mem::size_of;
use std::sync::{Arc, Mutex};

use gl::types::*;

use core_types::RgbaF32;
use gui::mouse_camera_arcball::MouseCameraArcball;
use kinect::k4a_sys_wrapper::Image;
use kinect::k4a_sys_wrapper::ImageFormat;
use kinect::k4a_sys_wrapper::{Capture, Transformation};
use opengl::opengl_wrapper::OpenGlError;
use opengl::opengl_wrapper::{Framebuffer, Renderbuffer, Texture};
use point_cloud::gpu_point_cloud_converter::{GpuPointCloudConverter, PointCloudComputeError};
use point_cloud::pixel_structs::BgraPixel;
use point_cloud::pixel_structs::DepthPixel;
use point_cloud::point_cloud_renderer::{PointCloudRenderer, PointCloudRendererError};
use point_cloud::util::{colorize_depth_blue_to_red, get_depth_mode_range, ValueRange};
use point_cloud::viewer_image::ViewerImage;
use point_cloud::debug::image_proxy::ImageProxy;

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
  arcball_camera: Arc<Mutex<MouseCameraArcball>>,

  num_cameras: usize,

  m_dimensions_width : i32,
  m_dimensions_height : i32,

  enable_color_point_cloud: bool,
  colorization_strategy: ColorizationStrategy,

  pub point_cloud_renderer: PointCloudRenderer,
  pub point_cloud_converters: Vec<GpuPointCloudConverter>,

  calibration_data: k4a_sys::k4a_calibration_t,
  transformation: Transformation, // TODO: WAT k4a_sys::k4a_transformation_t

  frame_buffer: Framebuffer,
  depth_buffer: Renderbuffer,

  last_captures: Vec<Option<Capture>>,

  /// Buffer that holds the depth image transformed to the color coordinate space.
  /// Used in color mode only.
  transformed_depth_images: Vec<Option<Image>>,

  /// In color mode, this is just a shallow copy of the latest color image.
  /// In depth mode, this is a buffer that holds the colorization of the depth image.
  point_cloud_colorizations: Vec<Option<Image>>,

  /// Holds the XYZ point cloud as a texture.
  /// Format is XYZA, where A (the alpha channel) is unused.
  pub xyz_textures: Vec<Texture>,

  color_xy_tables: Vec<Image>,
  depth_xy_tables: Vec<Image>,

  /// Near and far minima/maxima for the current depth sensor mode.
  depth_value_range: ValueRange,

  /// Background clear color for OpenGL.
  clear_color: RgbaF32,

  /// For debugging
  /// If present, use these instead of camera captures.
  debug_static_color_frames: Vec<ImageProxy>,
  debug_static_depth_frames: Vec<ImageProxy>,
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
  /// CTOR
  ///
  pub fn new(num_cameras: usize,
             enable_color_point_cloud: bool,
             initial_colorization_strategy: ColorizationStrategy,
             calibration_data: k4a_sys::k4a_calibration_t,
             clear_color: RgbaF32,
             arcball_camera: Arc<Mutex<MouseCameraArcball>>) -> Self
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

    let expected_value_range = get_depth_mode_range(calibration_data.depth_mode)
        .expect("Should be in correct depth sensor mode.");

    let mut point_cloud_converters = Vec::with_capacity(num_cameras);
    let mut transformed_depth_images = Vec::with_capacity(num_cameras);
    let mut point_cloud_colorizations = Vec::with_capacity(num_cameras);
    let mut xyz_textures = Vec::with_capacity(num_cameras);
    let mut last_captures = Vec::with_capacity(num_cameras);
    let mut color_xy_tables = Vec::with_capacity(num_cameras);
    let mut depth_xy_tables = Vec::with_capacity(num_cameras);

    for _ in 0 .. num_cameras {
      point_cloud_converters.push(GpuPointCloudConverter::new());
      transformed_depth_images.push(None);
      point_cloud_colorizations.push(None);
      last_captures.push(None);
      xyz_textures.push(Texture::new());

      // TODO: generate color xytable only on `enable_color_point_cloud`.
      let color_xy_table = GpuPointCloudConverter::generate_xy_table(
        calibration_data.clone(),
        k4a_sys::k4a_calibration_type_t_K4A_CALIBRATION_TYPE_COLOR,
      ).unwrap();

      let depth_xy_table = GpuPointCloudConverter::generate_xy_table(
        calibration_data.clone(),
        k4a_sys::k4a_calibration_type_t_K4A_CALIBRATION_TYPE_DEPTH,
      ).unwrap();

      color_xy_tables.push(color_xy_table);
      depth_xy_tables.push(depth_xy_table);
    }

    let mut debug_static_color_frames = Vec::new();
    debug_static_color_frames.push(ImageProxy::from_file("output/color_src_0", 0, 0).unwrap());
    debug_static_color_frames.push(ImageProxy::from_file("output/color_src_1", 0, 0).unwrap());

    let mut debug_static_depth_frames = Vec::new();
    debug_static_depth_frames.push(ImageProxy::from_file("output/depth_src_0", 3840, 2160).unwrap());
    debug_static_depth_frames.push(ImageProxy::from_file("output/depth_src_1", 3840, 2160).unwrap());

    let mut visualizer = Self {
      num_cameras,
      arcball_camera: arcball_camera.clone(),
      m_dimensions_width: width,
      m_dimensions_height: height,
      enable_color_point_cloud,
      point_cloud_renderer: PointCloudRenderer::new(num_cameras, arcball_camera.clone()),
      point_cloud_converters,
      frame_buffer: Framebuffer::new_initialized(),
      depth_buffer,
      color_xy_tables,
      depth_xy_tables,
      colorization_strategy: initial_colorization_strategy,
      calibration_data: calibration_data.clone(),
      transformation: Transformation::from_calibration(&calibration_data),
      last_captures,
      transformed_depth_images,
      point_cloud_colorizations,
      xyz_textures,
      depth_value_range: expected_value_range,
      clear_color,
      debug_static_color_frames,
      debug_static_depth_frames,
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
  pub fn update_texture(&mut self, texture: &ViewerImage, mut captures: Vec<Capture>) -> Result<()> {
    self.update_texture_id(texture.texture_id(), captures)
  }

  ///
  /// Take the latest capture, calculate updates to the xyz texture, then render the point cloud to
  /// the output texture.
  ///
  pub fn update_texture_id(&mut self, texture_id: GLuint, mut captures: Vec<Capture>) -> Result<()> {
    // Update the point cloud renderer with the latest point data
    self.update_point_clouds(captures)?;

    // Set up rendering to a texture
    unsafe {
      gl::BindRenderbuffer(gl::RENDERBUFFER, self.depth_buffer.id());
      gl::BindFramebuffer(gl::FRAMEBUFFER, self.frame_buffer.id());
    }

    let _cleanup_guard = CleanupGuard {};

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
      gl::ClearColor(
        self.clear_color.red,
        self.clear_color.green,
        self.clear_color.blue,
        self.clear_color.alpha,
      );
      gl::ClearDepth(1.0);

      gl::Clear(gl::COLOR_BUFFER_BIT | gl::DEPTH_BUFFER_BIT);
    }

    match self.arcball_camera.lock() {
      Ok(arcball) => {
        let view: [[f32; 4]; 4] = (arcball.get_view_matrix()).into();
        let perspective: [[f32; 4]; 4] = (arcball.get_perspective_matrix()).into();
        self.point_cloud_renderer.update_view_projection(view, perspective);
      },
      Err(_) => {},
    }

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
  fn update_point_clouds(&mut self, mut captures: Vec<Capture>) -> Result<()> {
    if captures.len() != self.num_cameras {
      println!("Length of captures in insufficient (unplug the cameras from USB and retry): {}", captures.len());
      return Ok(());
    }

    for (camera_index, capture) in captures.drain(0 .. self.num_cameras)
        .into_iter()
        .enumerate() {
      self.update_point_clouds_for_camera(camera_index, capture)?;
    }

    let mut color_captures = Vec::new();

    let color_frames = if self.debug_static_color_frames.len() > 0 {
      &self.debug_static_color_frames
    } else {
      // TODO: wrt k4a::Image.clone(), k4a should use ref counting. (I did this one other place a few commits ago.
      //  Hope it's not ref leaking.)
      let colorizations: Vec<ImageProxy>  = self.point_cloud_colorizations.iter()
          .map(|img| img.as_ref().map(|img| img.clone()).unwrap()) // Potential ref leak #1
          .map(|image| ImageProxy::from_k4a_image(&image)) // Potential ref leak #2
          .collect();

      color_captures = colorizations;
      &color_captures
    };

    self.point_cloud_renderer.update_point_clouds(
      &color_frames,
      &self.xyz_textures
    ).map_err(|err| PointCloudVisualizerError::PointCloudRendererError(err))
  }

  fn update_point_clouds_for_camera(&mut self, camera_index: usize, capture: Capture) -> Result<()> {
    //
    // Depth Image extractor
    //

    let mut depth_image = match capture.get_depth_image() {
      Ok(img) => ImageProxy::consume_k4a_image(img),
      Err(_e) => {
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
        // TODO: TEMP SUPPORT MULTI-CAMERA
        if let Some(transformed_depth_image) = self.transformed_depth_images.get_mut(camera_index)
            .unwrap()
            .as_mut() {
          unsafe {

            let result = k4a_sys::k4a_transformation_depth_image_to_color_camera(
              self.transformation.get_handle(),
              depth_image.get_handle(),
              transformed_depth_image.get_handle(),
            );

            if result != k4a_sys::k4a_buffer_result_t_K4A_BUFFER_RESULT_SUCCEEDED {
              return Err(PointCloudVisualizerError::DepthToColorConversionFailed);
            }

            depth_image = ImageProxy::from_k4a_image(transformed_depth_image);
          }
        }
      }
    }

    //
    // Convert depth image to depth texture
    //

    let use_depth_image = self.debug_static_depth_frames.get(camera_index)
        .unwrap_or(&depth_image);

    let result = self.point_cloud_converters.get(camera_index).unwrap().convert(
      &use_depth_image,
      &mut self.xyz_textures.get_mut(camera_index).unwrap(), // TODO: TEMP MULTI CAMERA SUPPORT
      camera_index
    );

    if let Err(err) = result {
      return Err(PointCloudVisualizerError::PointCloudComputeError(err));
    }

    // TODO: TEMP MULTI CAMERA SUPPORT
    if let Some(mut inner) = self.last_captures.get_mut(camera_index) {
      *inner = Some(capture);
    }

    if self.colorization_strategy == ColorizationStrategy::Color {
      let color_image = maybe_color_image.expect("logic above should ensure present");
      // TODO: TEMP MULTI CAMERA SUPPORT
      if let Some(mut inner) = self.point_cloud_colorizations.get_mut(camera_index) {
        *inner = Some(color_image);
      }

    } else {
      // This creates a color spectrum based on depth.
      let dst_length = use_depth_image.get_width_pixels() * use_depth_image.get_height_pixels();

      unsafe {
        // src: DepthPixel
        let src_pixel_buffer = use_depth_image.get_buffer();
        let typed_src_pixel_buffer = src_pixel_buffer as *const DepthPixel;

        // dst: BgraPixel
        let dst_pixel_buffer = self.point_cloud_colorizations.get_mut(camera_index).unwrap() // TODO TEMP MULTI-CAMERA SUPPORT
            .as_ref()
            .expect("point cloud color image must be set")
            .get_buffer();

        let typed_dst_pixel_buffer = dst_pixel_buffer as *mut BgraPixel;

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

    Ok(())
  }

  ///
  ///
  ///
  pub fn set_colorization_strategy(&mut self, strategy: ColorizationStrategy) -> Result<()> {
    for i in 0 .. self.num_cameras {
      self.set_colorization_strategy_for_camera(i, strategy)?;
    }
    Ok(())
  }

  fn set_colorization_strategy_for_camera(&mut self, camera_index: usize, strategy: ColorizationStrategy) -> Result<()> {
    if strategy == ColorizationStrategy::Color && !self.enable_color_point_cloud {
      return Err(PointCloudVisualizerError::UnsupportedMode);
    }

    self.colorization_strategy = strategy;
    self.point_cloud_renderer.set_enable_shading(strategy == ColorizationStrategy::Shaded);

    if strategy == ColorizationStrategy::Color {
      let width = self.calibration_data.color_camera_calibration.resolution_width;
      let height = self.calibration_data.color_camera_calibration.resolution_height;
      let stride = width * size_of::<DepthPixel>() as i32;

      // TODO: TEMP MULTI-CAMERA SUPPORT
      if let Some(mut transformed_depth_image) = self.transformed_depth_images.get_mut(camera_index) {
        *transformed_depth_image = Some(Image::create(
          ImageFormat::Depth16,
          width as u32,
          height as u32,
          stride as u32,
        ).expect("Construction should work FIXME"));
      }

      for point_cloud_converter in self.point_cloud_converters.iter_mut() {
        point_cloud_converter.set_active_xy_table(&self.color_xy_tables.get(camera_index).unwrap())?; // TODO: TEMP MULTI-CAMERA SUPPORT
      }

    } else {
      let width = self.calibration_data.depth_camera_calibration.resolution_width as u32;
      let height = self.calibration_data.depth_camera_calibration.resolution_height as u32;
      let stride = width as i32 * size_of::<BgraPixel>() as i32;

      // TODO: TEMP MULTI-CAMERA SUPPORT
      if let Some(mut point_cloud_colorization) = self.point_cloud_colorizations.get_mut(camera_index) {
        *point_cloud_colorization = Some(Image::create(
          ImageFormat::ColorBgra32,
          width,
          height,
          stride as u32,
        ).expect("Construction should work FIXME"));
      }

      for point_cloud_converter in self.point_cloud_converters.iter_mut() {
        point_cloud_converter.set_active_xy_table(&self.depth_xy_tables.get(camera_index).unwrap())?; // TODO: TEMP MULTI-CAMERA SUPPORT
      }
    }

    self.xyz_textures.get_mut(0).unwrap().reset(); // TODO: TEMP MULTI-CAMERA SUPPORT

    // TODO: TEMP MULTI-CAMERA SUPPORT
    if let Some(capture) = self.last_captures.get_mut(camera_index).unwrap().as_ref() {
      let capture = (*capture).clone();
      // TODO: TEMP MULTI-CAMERA SUPPORT
      let mut captures = Vec::new();
      captures.push(capture);
      self.update_point_clouds(captures);
    }

    Ok(())
  }
}
