use crate::assets::renderable_object::RenderableObject;
use gl::types::*;
use nalgebra::{Vector4, Rotation3, Translation3, Matrix4, Vector3};
use std::ffi::CString;
use std::os::raw::c_char;
use crate::opengl::wrapper::uniform::Uniform;

pub struct PositionableObject {
  pub renderable_object: RenderableObject,

  // Transformation data for the object

  pub scale: Vector3<f32>,
  pub rotation: Vector4<f32>,
  pub translation: Vector3<f32>,

  pub rotation_typed: Rotation3<f32>,
  pub translation_typed: Translation3<f32>,
  pub is_transformed: bool,
}

impl PositionableObject {

  pub fn new(renderable_object: RenderableObject) -> Self {
    Self {
      renderable_object,
      scale: Vector3::new(1.0, 1.0, 1.0),
      rotation: Vector4::default(),
      translation: Vector3::default(),
      rotation_typed: Rotation3::identity(),
      translation_typed: Translation3::identity(),
      is_transformed: true,
    }
  }

  pub fn rotate(&mut self, x: f32, y: f32, z: f32) {
    self.rotation.x = x;
    self.rotation.y = y;
    self.rotation.z = z;
  }

  pub fn rotate_x(&mut self, x: f32) {
    self.rotation.x = x;
  }

  pub fn rotate_y(&mut self, y: f32) {
    self.rotation.y = y;
  }

  pub fn rotate_z(&mut self, z: f32) {
    self.rotation.z = z;
  }

  pub fn scale_nonuniform(&mut self, x: f32, y: f32, z: f32) {
    self.scale.x = x;
    self.scale.y = y;
    self.scale.z = z;
  }

  pub fn scale(&mut self, scale: f32) {
    self.scale.x = scale;
    self.scale.y = scale;
    self.scale.z = scale;
  }

  pub fn translate(&mut self, x: f32, y: f32, z: f32) {
    self.translation.x = x;
    self.translation.y = y;
    self.translation.z = z;
  }

  pub fn translate_x(&mut self, x: f32) {
    self.translation.x = x;
  }

  pub fn translate_y(&mut self, y: f32) {
    self.translation.y = y;
  }

  pub fn translate_z(&mut self, z: f32) {
    self.translation.z = z;
  }

  pub fn draw(&self, model_transform_id: Uniform) {
    let mut transformation = Matrix4::identity();
    let rotation = Matrix4::from_euler_angles(self.rotation.x, self.rotation.y, self.rotation.z);

    transformation.append_nonuniform_scaling_mut(&self.scale);
    transformation = transformation * rotation;
    transformation.append_translation_mut(&self.translation);

    //println!("matrix: {:?}", transformation);
    //println!("translation: {:?}", &self.translation);

    let mat_ptr = transformation.as_ptr();

    unsafe {
      gl::UniformMatrix4fv(model_transform_id.id(), 1, gl::FALSE, mat_ptr);
    }

    self.renderable_object.draw();
  }
}
