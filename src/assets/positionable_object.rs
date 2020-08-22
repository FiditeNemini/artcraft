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
      scale: Vector3::default(),
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

  /*pub fn get_transformation(&self) -> Matrix4<f32> {
    let mut transformation = Matrix4::identity();
    //let transformation = transformation * &self.scale;
    //transformation.append_nonuniform_scaling(&self.scale);
    //transformation.append_translation(&self.translation);
    transformation
  }*/

  /*pub fn get_transformation_for_shader(&self) -> *const GLfloat {
    let transformation = self.get_transformation();
    transformation.as_ptr()
  }*/

  pub fn draw(&self, model_transform_id: Uniform) {
      //let name : CString = CString::new("view").expect("string is correct");
      //let name_ptr : *const c_char = name.as_ptr() as *const c_char;

      //let loc = gl::GetUniformLocation(shader_id, name_ptr);
      //println!("uniform location: {}", loc);

      //let mat_ptr = self.get_transformation_for_shader();

      //;gl::UniformMatrix4fv(loc, 1, gl::TRUE, mat_ptr);

      let mut transformation = Matrix4::identity();
      transformation.append_translation_mut(&self.translation);

      println!("matrix: {:?}", transformation);
      println!("translation: {:?}", &self.translation);

      let mat_ptr = transformation.as_ptr();

    unsafe {
      gl::UniformMatrix4fv(model_transform_id.id(), 1, gl::FALSE, mat_ptr);
    }

    self.renderable_object.draw();
  }
}
