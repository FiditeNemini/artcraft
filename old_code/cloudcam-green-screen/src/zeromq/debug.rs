use cgmath::num_traits::Float;
use crate::zeromq::point::Point;

/// Print the minima and maxima along each dimension.
pub fn print_pointcloud_maxima(points: &Vec<Point>) {
    let mut max_x = f32::min_value();
    let mut min_x = f32::max_value();
    let mut max_y = f32::min_value();
    let mut min_y = f32::max_value();
    let mut max_z = f32::min_value();
    let mut min_z = f32::max_value();

    for pt in points.iter() {
        if pt.x < min_x {
            min_x = pt.x;
        }
        if pt.x > max_x {
            max_x = pt.x;
        }
        if pt.y < min_y {
            min_y = pt.y;
        }
        if pt.y > max_y {
            max_y = pt.y;
        }
        if pt.z < min_z {
            min_z = pt.z;
        }
        if pt.z > max_z {
            max_z = pt.z;
        }
    }

    // minmax x : -2612.5303, 4902.1655 | y: -3491.938, 1000.92487 | z: 163, 5494
    // minmax x : -2615.739, 4918.527 | y: -3507.2483, 1007.1275 | z: 163, 5518
    println!("minmax x : {}, {} | y: {}, {} | z: {}, {}",
             min_x, max_x, min_y, max_y, min_z, max_z);
}
