use crate::AnyhowResult;
use k4a_sys_temp as k4a_sys;
use kinect::{Calibration, Image, ImageFormat};
use std::mem::size_of;
use std::os::raw::c_int;

/**
 * Creates an XY depth lookup table. (Taken from MIT-licensed `fastpointcloud.exe` in the K4A libs; doc below)
 *
 * The Azure Kinect Fastpointcloud example computes a 3d point cloud from a depth map. The example precomputes a lookup table
 * by storing x- and y-scale factors for every pixel. At runtime, the 3d X-coordinate of a pixel in millimeters is derived
 * by multiplying the pixel's depth value with the corresponding x-scale factor. The 3d Y-coordinate is obtained by
 * multiplying with the y-scale factor.
 *
 * This method represents an alternative to calling k4a_transformation_depth_image_to_point_cloud() and lends itself
 * to efficient implementation on the GPU.
 */
pub fn create_xy_table_from_depth_calibration(calibration: &Calibration) -> AnyhowResult<Image> {
  let width = calibration.depth_camera_resolution_width();
  let height = calibration.depth_camera_resolution_height();
  create_xy_table(calibration, width, height)
}

pub fn create_xy_table_from_color_calibration(calibration: &Calibration) -> AnyhowResult<Image> {
    let width = calibration.color_camera_resolution_width();
    let height = calibration.color_camera_resolution_height();
    create_xy_table(calibration, width, height)
}

pub fn create_xy_table(calibration: &Calibration, width: i32, height: i32) -> AnyhowResult<Image> {
    let image = Image::create(
        ImageFormat::Custom,
        width as u32,
        height as u32,
        width as u32 * size_of::<k4a_sys::k4a_float2_t>() as u32,
    )?;

    let typed_buffer = image.get_buffer() as *mut k4a_sys::k4a_float2_t;

    let mut p = k4a_sys::k4a_float2_t {
        xy: k4a_sys::k4a_float2_t__xy {
            x: 0.0,
            y: 0.0,
        }
    };

    let mut ray = k4a_sys::k4a_float3_t {
        xyz: k4a_sys::k4a_float3_t__xyz {
            x: 0.0,
            y: 0.0,
            z: 0.0,
        }
    };

    let mut idx = 0;

    for y in 0 .. height {
        p.xy.y = y as f32;

        for x in 0 .. width {
            p.xy.x = x as f32;

            let mut valid: c_int = -1;
            let result = unsafe {
                k4a_sys::k4a_calibration_2d_to_3d(
                    &calibration.0,
                    &p, // source point 2d
                    1.0, // source depth mm
                    k4a_sys::k4a_calibration_type_t_K4A_CALIBRATION_TYPE_DEPTH, // source camera
                    k4a_sys::k4a_calibration_type_t_K4A_CALIBRATION_TYPE_DEPTH, // target camera
                    &mut ray, // target point3d mm
                    &mut valid // set to 1 when valid result, 0 when coordinate is not valid
                )
            };

            if valid == 1 {
                unsafe {
                    (*typed_buffer.offset(idx)).xy.x = ray.xyz.x;
                    (*typed_buffer.offset(idx)).xy.y = ray.xyz.y;
                }
            } else {
                unsafe {
                    (*typed_buffer.offset(idx)).xy.x = 0.0;
                    (*typed_buffer.offset(idx)).xy.y = 0.0;
                }
            }

            idx += 1;
        }
    }

    Ok(image)
}