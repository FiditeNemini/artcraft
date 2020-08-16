use anyhow::Result as AnyhowResult;
use kinect::capture::device_capturer::CaptureProvider;
use point_cloud::debug::capture_proxy::CaptureProxy;
use point_cloud::debug::image_proxy::ImageProxy;
use kinect::k4a_sys_wrapper::ImageFormat;

pub struct FakeDeviceCaptureProvider {
  num_cameras: usize,
  captures: Vec<CaptureProxy>,
}

impl FakeDeviceCaptureProvider {
  pub fn new() -> AnyhowResult<Self> {
    // TODO: Dimensions are wrong
    let color = ImageProxy::from_file("output/color_src_0", 0, 0, 0, ImageFormat::ColorBgra32)?;
    let depth = ImageProxy::from_file("output/depth_src_0", 3840, 2160, 7680, ImageFormat::Depth16)?;
    //let depth = ImageProxy::from_file("output/depth_src_0", 640, 576, 1280, ImageFormat::Depth16)?;
    let frame_1 = CaptureProxy::from_image_proxy_pair(color, depth);

    // TODO: Dimensions are wrong
    let color = ImageProxy::from_file("output/color_src_1", 0, 0, 0, ImageFormat::ColorBgra32)?;
    let depth = ImageProxy::from_file("output/depth_src_1", 3840, 2160, 7680, ImageFormat::Depth16)?;
    //let depth = ImageProxy::from_file("output/depth_src_1", 640, 576, 1280, ImageFormat::Depth16)?;
    let frame_2 = CaptureProxy::from_image_proxy_pair(color, depth);

    let mut captures = Vec::new();
    captures.push(frame_1);
    captures.push(frame_2);

    Ok(Self {
      num_cameras: 2,
      captures,
    })
  }
}

impl CaptureProvider for FakeDeviceCaptureProvider {
  fn get_num_cameras(&self) -> usize {
    self.num_cameras
  }

  fn get_captures(&self) -> Option<Vec<CaptureProxy>> {
    let capture_clones = self.captures.iter()
        .map(|capture| capture.clone())
        .collect();
    Some(capture_clones)
  }
}
