use crate::AnyhowResult;
use anyhow::anyhow;
use k4a_sys_temp;
use kinect::{Transformation, Image, Calibration, ImageFormat};
use std::mem::size_of;

/// Transform Depth images into Color Camera space.
pub struct DepthTransformer {
  transformation: Transformation,
  output_width: u32,
  output_height: u32,
  output_stride_bytes: u32,

  // In-place memory buffer
  reusable_buffer: Image,
}

impl DepthTransformer {

  pub fn new(calibration: &Calibration) -> Self {
    let transformation = Transformation::from_calibration(&calibration);

    let output_width = transformation.color_resolution.width as u32;
    let output_height = transformation.color_resolution.height as u32;
    let output_stride_bytes = output_width * size_of::<libc::uint16_t>() as u32; // NB: Depth pixel

    let reusable_buffer = Image::create(
      ImageFormat::Depth16,
      output_width,
      output_height,
      output_stride_bytes,
    ).map_err(|e| anyhow!("Can't create the image: {:?}", e))
        .expect("Can't create"); // TODO

    Self {
      transformation,
      output_width,
      output_height,
      output_stride_bytes,
      reusable_buffer,
    }
  }

  pub fn transform(&self, depth_image: &Image) -> AnyhowResult<Image> {
    let transform_h = self.transformation.get_handle();
    let depth_image_h = depth_image.get_handle();

    //println!("Width, height, stride: {}, {}, {}", self.output_width, self.output_height, self.output_stride_bytes);

    let output_image = Image::create(
      ImageFormat::Depth16,
      self.output_width,
      self.output_height,
      self.output_stride_bytes,
    ).map_err(|e| anyhow!("Can't create the image: {:?}", e))?;

    //println!("Image created");

    let output_image_h = output_image.get_handle();
    //println!("About to transform...");

    let result = unsafe {
      k4a_sys_temp::k4a_transformation_depth_image_to_color_camera(
        transform_h,
        depth_image_h,
        output_image_h,
      )
    };
    //println!("Transformed");

    if result != k4a_sys_temp::k4a_buffer_result_t_K4A_BUFFER_RESULT_SUCCEEDED {
      return Err(anyhow!("Depth transformation failed."));
    }

    Ok(output_image)
  }

  // TODO
  //pub fn transform_in_place(&mut self) {
  //}
}
