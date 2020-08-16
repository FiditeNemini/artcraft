use anyhow::Result as AnyhowResult;
use kinect::capture::device_capturer::CaptureProvider;
use point_cloud::debug::capture_proxy::CaptureProxy;
use point_cloud::debug::image_proxy::ImageProxy;
use kinect::k4a_sys_wrapper::{ImageFormat, Calibration};

pub struct FakeDeviceCaptureProvider {
  num_cameras: usize,
  captures: Vec<CaptureProxy>,
  calibration: Calibration,
}

impl FakeDeviceCaptureProvider {
  pub fn new() -> AnyhowResult<Self> {
    // TODO: Color dimension stride is wrong (and maybe others)
    let color = ImageProxy::from_file("output/color_frame_1", 3840, 2160, 0, ImageFormat::ColorBgra32)?;
    let depth = ImageProxy::from_file("output/depth_frame_1", 640, 576, 1280, ImageFormat::Depth16)?;
    let frame_1 = CaptureProxy::from_image_proxy_pair(color, depth);

    // TODO: Color dimension stride is wrong (and maybe others)
    let color = ImageProxy::from_file("output/color_frame_1", 3840, 2160, 0, ImageFormat::ColorBgra32)?;
    let depth = ImageProxy::from_file("output/depth_frame_1", 640, 576, 1280, ImageFormat::Depth16)?;
    let frame_2 = CaptureProxy::from_image_proxy_pair(color, depth);

    let mut captures = Vec::new();
    captures.push(frame_1);
    captures.push(frame_2);

    let mut calibration = Calibration::default();

    // NB: Experimentally determined "constants" from real devices
    // These are necessary to compute the depth camera transform into color camera space.
    calibration.0.color_resolution = 5;
    calibration.0.depth_mode = 2;
    calibration.0.depth_camera_calibration.resolution_width = 640;
    calibration.0.depth_camera_calibration.resolution_height = 576;
    calibration.0.depth_camera_calibration.metric_radius = 1.7399998;
    calibration.0.depth_camera_calibration.extrinsics.rotation = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0];
    calibration.0.depth_camera_calibration.extrinsics.translation = [0.0, 0.0, 0.0];
    calibration.0.depth_camera_calibration.intrinsics.type_ = 4;
    calibration.0.depth_camera_calibration.intrinsics.parameter_count = 14;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.cx = 325.4652;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.cy = 339.75952;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.fx = 503.72073;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.fy = 503.82776;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.k1 = 5.7966313;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.k2 = 4.1091304;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.k3 = 0.22066948;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.k4 = 6.1226273;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.k5 = 6.053665;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.k6 = 1.1403816;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.codx = 0.0;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.cody = 0.0;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.p2 = -0.00003910405;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.p1 = -0.00009726079;
    calibration.0.depth_camera_calibration.intrinsics.parameters.param.metric_radius = 0.0;

    calibration.0.color_camera_calibration.resolution_width = 3840;
    calibration.0.color_camera_calibration.resolution_height = 2160;
    calibration.0.color_camera_calibration.metric_radius = 1.7;
    calibration.0.color_camera_calibration.extrinsics.rotation = [0.99998903, -0.0045318827, 0.001187322, 0.0044161947, 0.9964592, 0.08396203, -0.001563624, -0.08395587, 0.99646825];
    calibration.0.color_camera_calibration.extrinsics.translation = [-32.02683, -2.3786376, 3.9904723];
    calibration.0.color_camera_calibration.intrinsics.type_ = 4;
    calibration.0.color_camera_calibration.intrinsics.parameter_count = 14;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.cx = 1919.9363;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.cy = 1105.1877;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.fx = 1832.5886;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.fy = 1832.6873;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.k1 = 0.4812507;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.k2 = -2.5299993;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.k3 = 1.4068391;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.k4 = 0.36012942;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.k5 = -2.355542;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.k6 = 1.3372931;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.codx = 0.0;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.cody = 0.0;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.p2 = -0.00037526494;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.p1 = 0.00054938474;
    calibration.0.color_camera_calibration.intrinsics.parameters.param.metric_radius = 0.0;
    calibration.0.extrinsics = [
      [
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0],
          translation: [0.0, 0.0, 0.0]
        },
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [0.99998903, -0.0045318827, 0.001187322, 0.0044161947, 0.9964592, 0.08396203, -0.001563624, -0.08395587, 0.99646825],
          translation: [-32.02683, -2.3786376, 3.9904723]
        },
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [0.00908543, 0.1157082, -0.99324167, -0.9999575, -0.0005106917, -0.009206355, -0.001572491, 0.9932831, 0.11569864],
          translation: [0.0, 0.0, 0.0]
        },
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [0.004534903, 0.112131886, -0.993683, -0.9999893, -0.00040909834, -0.004609848, -0.00092342496, 0.99369323, 0.11212883],
          translation: [-51.077, 3.2191863, 1.8031791]
        }
      ],
      [
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [0.99998903, 0.0044161947, -0.001563624, -0.0045318827, 0.9964592, -0.08395587, 0.001187322, 0.08396203, 0.99646825],
          translation: [32.043224, 2.560097, -3.7386374]
        },
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [1.0, 0.00000000026193447, 0.0, 0.00000000026193447, 1.0, -0.000000007450581, 0.0, -0.000000007450581, 1.0],
          translation: [0.0000038146973, 0.0, 0.0]
        },
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [0.007381657, 0.031944036, -0.99946237, -0.9999551, -0.005697875, -0.007567407, -0.005936545, 0.9994734, 0.03190054],
          translation: [4.300721, -32.00875, 2.0599582]
        },
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [0.0028468627, 0.028323233, -0.99959475, -0.99998194, -0.005210849, -0.0029956135, -0.005293583, 0.9995853, 0.028307885],
          translation: [-46.929596, -28.807508, 3.8983316]
        }
      ],
      [
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [0.00908543, -0.9999575, -0.001572491, 0.1157082, -0.0005106917, 0.9932831, -0.99324167, -0.009206355, 0.11569864],
          translation: [0.0, 0.0, 0.0]
        },
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [0.007381657, -0.9999551, -0.005936545, 0.031944036, -0.005697875, 0.9994734, -0.99946237, -0.007567407, 0.03190054],
          translation: [-32.02683, -2.3786376, 3.9904723]
        },
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [0.99999994, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.99999994],
          translation: [0.0, 0.0, 0.0]
        },
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [0.99998313, 0.0045562233, -0.003596194, -0.0045539755, 0.99998945, 0.00063277053, 0.0035990402, -0.0006163829, 0.99999326],
          translation: [-51.077, 3.2191863, 1.8031791]
        }
      ],
      [
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [0.004534903, -0.9999893, -0.00092342496, 0.112131886, -0.00040909834, 0.99369323, -0.993683, -0.004609848, 0.11212883],
          translation: [3.452446, 3.9368703, -50.941692]
        },
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [0.0028468627, -0.99998194, -0.005293583, 0.028323233, -0.005210849, 0.9995853, -0.99959475, -0.0029956135, 0.028307885],
          translation: [-28.652746, -2.717628, -47.10723]
        },
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [0.99998313, -0.0045539755, 0.0035990402, 0.0045562233, 0.99998945, -0.0006163829, -0.003596194, 0.00063277053, 0.99999326],
          translation: [51.08431, -2.9853227, -1.9888868]
        },
        k4a_sys::_k4a_calibration_extrinsics_t {
          rotation: [0.99999994, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.99999994],
          translation: [-0.0000038146973, 0.00000023841858, 0.00000011920929] }
      ]
    ];

    Ok(Self {
      num_cameras: 2,
      captures,
      calibration,
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

  fn get_calibration(&self) -> &Calibration {
    &self.calibration
  }
}
