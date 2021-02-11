
pub mod zeromq;
pub use anyhow::Result as AnyhowResult;
use anyhow::anyhow;
use crate::zeromq::xy_table::create_xy_table;
use k4a_sys_temp as k4a_sys;
use kinect::{Device, DeviceConfiguration};
use std::thread;
use std::time::Duration;
use crate::zeromq::cpu_calculate_point_cloud::calculate_point_cloud;

fn main() -> AnyhowResult<()> {
    let device = Device::open(0)?;

    let mut config = DeviceConfiguration::init_disable_all();
    config.0.depth_mode = k4a_sys::k4a_depth_mode_t_K4A_DEPTH_MODE_WFOV_2X2BINNED;
    config.0.camera_fps = k4a_sys::k4a_fps_t_K4A_FRAMES_PER_SECOND_30;

    let calibration = device.get_calibration(config.0.depth_mode, config.0.color_resolution)?;

    let xy_table = create_xy_table(&calibration)?;

    device.start_cameras(&config)?;

    loop {
        println!("Get capture");

        let capture = device.get_capture(500)?;

        let depth_image = capture.get_depth_image()
            .ok_or(anyhow!("capture not present"))?;

        let point_cloud = calculate_point_cloud(&depth_image, &xy_table)?;

        println!("Number points: {}", point_cloud.point_count);
    }

    Ok(())
}
