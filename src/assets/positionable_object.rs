use crate::assets::renderable_object::RenderableObject;
use gl::types::*;
use nalgebra::{Vector4, Rotation3, Translation3, Matrix4, Vector3};
use std::ffi::CString;
use std::os::raw::c_char;

pub struct PositionableObject {
  pub renderable_object: RenderableObject,

  // Transformation data for the object

  pub scale: Vector3<f32>,
  pub rotation: Vector4<f32>,
  pub translation: Vector3<f32>,

  pub rotation_typed: Rotation3<f32>,
  pub translation_typed: Translation3<f32>,
}

impl PositionableObject {

  pub fn new(renderable_object: RenderableObject) -> Self {
    Self {
      renderable_object,
      scale: Vector3::default(),
      rotation: Vector4::default(),
      translation: Vector3::default(),
      rotation_typed: Rotation3::identity(),
      translation_typed: Translation3::identity(),
    }
  }

  pub fn rotate(&mut self, x: f32, y: f32, z: f32) {
    self.rotation.x = x;
    self.rotation.y = y;
    self.rotation.z = z;
  }

  pub fn scale(&mut self, x: f32, y: f32, z: f32) {
    self.scale.x = x;
    self.scale.y = y;
    self.scale.z = z;
  }

  pub fn translate(&mut self, x: f32, y: f32, z: f32) {
    self.translation.x = x;
    self.translation.y = y;
    self.translation.z = z;
  }

  pub fn get_transformation(&self) -> Matrix4<f32> {
    let mut transformation = Matrix4::identity();
    //let transformation = transformation * &self.scale;
    //transformation.append_nonuniform_scaling(&self.scale);
    //transformation.append_translation(&self.translation);
    transformation
  }

  pub fn get_transformation_for_shader(&self) -> *const f32 {
    let transformation = self.get_transformation();
    transformation.as_ptr()
  }

  pub fn draw(&self, shader_id: GLuint) {
    unsafe {
      let name : CString = CString::new("view").expect("string is correct");
      let name_ptr : *const c_char = name.as_ptr() as *const c_char;

      let loc = gl::GetUniformLocation(shader_id, name_ptr);
      println!("uniform location: {}", loc);

      println!("matrix: {:?}", self.get_transformation());

      let mat_ptr = self.get_transformation_for_shader();

      //gl::UniformMatrix4fv(loc, 1, gl::TRUE, mat_ptr);
    }

    self.renderable_object.draw();
  }
}
