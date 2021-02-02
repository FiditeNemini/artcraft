use cgmath::num_traits::Float;
use crate::AnyhowResult;
use crate::zeromq::point::Point;
use k4a_sys_temp as k4a_sys;
use kinect::Image;
use kinect::ImageFormat;
use std::mem::size_of;
use crate::zeromq::color::Color;

pub struct PointCloudResult {
    pub point_cloud_image: Image,
    pub point_count: u32,
}

/// This has been adapted from libk4a sources (MIT-licensed).
pub fn calculate_point_cloud(depth_image: &Image, xy_table_image: &Image) -> AnyhowResult<PointCloudResult> {
    let width = depth_image.get_width_pixels();
    let height = depth_image.get_height_pixels();

    let point_cloud_image= Image::create(
        ImageFormat::Custom,
        width as u32,
        height as u32,
        width as u32 * size_of::<k4a_sys::k4a_float3_t>() as u32,
    )?;

    let point_cloud_data = point_cloud_image.get_buffer() as *mut k4a_sys::k4a_float3_t;
    let xy_table_data = xy_table_image.get_buffer() as *mut k4a_sys::k4a_float2_t;
    let depth_data = depth_image.get_buffer() as *mut u16; // uint16_t

    let depth_data_length = (width * height) as isize;

    let mut point_count = 0;

    for i in 0 .. depth_data_length {
        unsafe {
            // TODO: This is missing `isnan` checks.
            //  if (depth_data[i] != 0 && !isnan(xy_table_data[i].xy.x) && !isnan(xy_table_data[i].xy.y))
            if (*depth_data.offset(i)) != 0 {
                (*point_cloud_data.offset(i)).xyz.x = (*xy_table_data.offset(i)).xy.x * ((*depth_data.offset(i)) as f32);
                (*point_cloud_data.offset(i)).xyz.y = (*xy_table_data.offset(i)).xy.y * ((*depth_data.offset(i)) as f32);
                (*point_cloud_data.offset(i)).xyz.z = (*depth_data.offset(i)) as f32;
                point_count += 1;
            } else {
                (*point_cloud_data.offset(i)).xyz.x = f32::nan();
                (*point_cloud_data.offset(i)).xyz.y = f32::nan();
                (*point_cloud_data.offset(i)).xyz.z = f32::nan();
            }
        }
    }

    Ok(PointCloudResult {
        point_cloud_image,
        point_count,
    })
}

// Directly return as a vector.
pub fn calculate_point_cloud2(depth_image: &Image, xy_table_image: &Image, color: Color) -> AnyhowResult<Vec<Point>> {
    let width = depth_image.get_width_pixels();
    let height = depth_image.get_height_pixels();

    let xy_table_data = xy_table_image.get_buffer() as *mut k4a_sys::k4a_float2_t;
    let depth_data = depth_image.get_buffer() as *mut u16; // uint16_t

    let depth_data_length = (width * height) as isize;

    let mut points = Vec::new();

    for i in 0 .. depth_data_length {
        unsafe {
            // TODO: This is missing `isnan` checks.
            //  if (depth_data[i] != 0 && !isnan(xy_table_data[i].xy.x) && !isnan(xy_table_data[i].xy.y))
            if (*depth_data.offset(i)) != 0 {
                let x = (*xy_table_data.offset(i)).xy.x * ((*depth_data.offset(i)) as f32);
                let y = (*xy_table_data.offset(i)).xy.y * ((*depth_data.offset(i)) as f32);
                let z = (*depth_data.offset(i)) as f32;
                points.push(Point::at(x, y, z, color));
            }
        }
    }

    Ok(points)
}
