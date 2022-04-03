//! Useful matrix functions

pub const fn translation_matrix_4x4_flat(x: f32, y: f32, z: f32) -> [f32; 16] {
  [
    1.0, 0.0, 0.0, x,
    0.0, 1.0, 0.0, y,
    0.0, 0.0, 1.0, z,
    0.0, 0.0, 0.0, 1.0,
  ]
}

pub const fn identity_matrix_4x4() -> [[f32; 4]; 4] {
  [
    [1.0,  0.0,  0.0,  0.0],
    [0.0,  1.0,  0.0,  0.0],
    [0.0,  0.0,  1.0,  0.0],
    [0.0,  0.0,  0.0,  1.0],
  ]
}

pub const fn identity_matrix_4x4_flat() -> [f32; 16] {
  [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
  ]
}

pub const fn zero_matrix_4x4_flat() -> [f32; 16] {
  return [
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
  ];
}

/// This is the view matrix k4aviewer starts with
pub const fn initial_view_matrix_4x4() -> [[f32; 4]; 4] {
  [
    [-1.0,         0.0,    8.74228e-08, 0.0],
    [0.0,          1.0,    0.0,         0.0],
    [-8.74228e-08, 0.0,    -1.0,        0.0],
    [2.62268e-07,  1.0,    -5.0,        1.0],
  ]
}

/// This is the view matrix k4aviewer starts with
pub const fn initial_view_matrix_4x4_flat() -> [f32; 16] {
  [
    -1.0,         0.0,    8.74228e-08, 0.0,
    0.0,          1.0,    0.0,         0.0,
    -8.74228e-08, 0.0,    -1.0,        0.0,
    2.62268e-07,  1.0,    -5.0,        1.0,
  ]
}

/// This is the projection matrix k4aviewer starts with
pub const fn initial_projection_matrix_4x4() -> [[f32; 4]; 4] {
  [
    [1.41272,    0.0,      0.0,      0.0],
    [0.0,        1.56969,  0.0,      0.0],
    [0.0,        0.0,      -1.002,   -1.0],
    [0.0,        0.0,      -0.2002,  0.0],
  ]
}

/// This is the projection matrix k4aviewer starts with
pub const fn initial_projection_matrix_4x4_flat() -> [f32; 16] {
  [
    1.41272,    0.0,      0.0,      0.0,
    0.0,        1.56969,  0.0,      0.0,
    0.0,        0.0,      -1.002,   -1.0,
    0.0,        0.0,      -0.2002,  0.0,
  ]
}
