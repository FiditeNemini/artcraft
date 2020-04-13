use std::ffi::CString;
use std::mem;
use std::os::raw::c_void;
use std::path::Path;
use std::ptr;
use std::str;
use std::sync::mpsc::Receiver;

use gl;
use gl::types::*;
use glfw::{Action, Context, Key};
use glutin;
use image::{GenericImage, GenericImageView, DynamicImage};
use glutin::event::{Event, WindowEvent};
use glutin::event_loop::{ControlFlow, EventLoop};
use glutin::window::WindowBuilder;
use glutin::ContextBuilder;
use std::mem::size_of;
use std::ptr::null;
use glium::framebuffer::ColorAttachment::Texture;
use std::sync::Arc;
use sensor_control::CaptureProvider;

//use shader::Shader;

// Shader sources
static VERTEX_SHADER_SRC: &'static str = "
#version 150 core

in vec2 position;
in vec3 in_color;
in vec2 tex_coord;

out vec3 Color;
out vec2 Texcoord;

void main() {
    Color = in_color;
    Texcoord = tex_coord;

    // gl_Position = vec4(position, 0.0, 1.0);
    gl_Position = vec4(position.x, position.y, 0.0, 1.0);
}";

static FRAGMENT_SHADER_SRC: &'static str = "
#version 150 core

in vec3 Color;
in vec2 Texcoord;

out vec4 out_color;

//uniform vec3 triangleColor;
uniform sampler2D tex;

void main() {
    //out_color = vec4(1.0, 1.0, 1.0, 1.0);
    //out_color = vec4(triangleColor, 1.0); // Uniform
    //out_color = vec4(Color, 1.0);
    //out_color = texture(tex, Texcoord) * vec4(Color, 1.0);
    out_color = texture(tex, Texcoord);
}";

// Vertex data
// static VERTEX_DATA: [GLfloat; 6] = [0.0, 0.5, 0.5, -0.5, -0.5, -0.5];

static VERTEX_DATA: [GLfloat; 28] = [
  /*// Triangle 1
  -0.5, 0.5,
  0.5, 0.5,
  0.5, -0.5,
  // Triangle 2 -- doesn't work
  0.5, -0.5,
  -0.5, 0.5,
  -0.5, -0.5,*/

  // from open.gl tutorial
  /*0.0,  0.5, // Vertex 1 (X, Y)
  0.5, -0.5, // Vertex 2 (X, Y)
  -0.5, -0.5  // Vertex 3 (X, Y)*/

  // colored triangle from open.gl tutorial
  /*0.0,  0.5, 1.0, 0.0, 0.0, // Vertex 1: Red
  0.5, -0.5, 0.0, 1.0, 0.0, // Vertex 2: Green
  -0.5, -0.5, 0.0, 0.0, 1.0,  // Vertex 3: Blue*/

  // From open.gl tutorial - square
  //  Position      Color      Texcoords
  -0.5,  0.5, 1.0,  0.0, 0.0,  0.0, 0.0, // Top-left
  0.5,  0.5, 0.0,   1.0, 0.0,  1.0, 0.0, // Top-right
  0.5, -0.5, 0.0,   0.0, 1.0,  1.0, 1.0, // Bottom-right
  -0.5, -0.5, 1.0,  1.0, 1.0,  0.0, 1.0, // Bottom-left
];

static ELEMENTS: [GLint; 6] = [
  // From open.gl tutorial
  0, 1, 2,
  2, 3, 0,
];

// From open.gl tutorial
static TEXTURE_CHECKERBOARD : [GLfloat; 12] = [
  0.0, 0.0, 0.0,   1.0, 1.0, 1.0,
  1.0, 1.0, 1.0,   0.0, 0.0, 0.0,
];

pub fn run(capture_provider: Arc<CaptureProvider>) {
  let event_loop = EventLoop::new();
  let window = WindowBuilder::new();
  let gl_window = ContextBuilder::new()
      .build_windowed(window, &event_loop)
      .unwrap();

  // It is essential to make the context current before calling `gl::load_with`.
  let gl_window = unsafe { gl_window.make_current() }.unwrap();

  // Load the OpenGL function pointers
  gl::load_with(|symbol| gl_window.get_proc_address(symbol));

  // Create GLSL shaders
  let vs = compile_shader(VERTEX_SHADER_SRC, gl::VERTEX_SHADER);
  let fs = compile_shader(FRAGMENT_SHADER_SRC, gl::FRAGMENT_SHADER);
  let program = link_program(vs, fs);

  let mut vbo = 0;
  let mut vao = 0;
  let mut ebo = 0;
  let mut tex = 0;

  unsafe {
    // Create a Vertex Buffer Object and copy the vertex data to it
    gl::GenBuffers(1, &mut vbo);
    gl::BindBuffer(gl::ARRAY_BUFFER, vbo);
    gl::BufferData(
      gl::ARRAY_BUFFER,
      (VERTEX_DATA.len() * mem::size_of::<GLfloat>()) as GLsizeiptr,
      mem::transmute(&VERTEX_DATA[0]),
      gl::STATIC_DRAW,
    );

    // Element buffer
    gl::GenBuffers(1, &mut ebo);
    gl::BindBuffer(gl::ELEMENT_ARRAY_BUFFER, ebo);
    gl::BufferData(
      gl::ELEMENT_ARRAY_BUFFER,
      (ELEMENTS.len() * mem::size_of::<GLfloat>()) as GLsizeiptr,
      mem::transmute(&ELEMENTS[0]),
      gl::STATIC_DRAW,
    );

    // Texture
    gl::GenTextures(1, &mut tex);
    gl::BindTexture(gl::TEXTURE_2D, tex);

    //let filename = "sneslogo.png";
    let filename = "n64logo.png";
    //let filename = "sample.png";
    let img = image::open(&Path::new(filename))
        .expect("failed to load")
        .to_rgba();

    /*let format = match img {
      /*image::ImageRgb8(_) => gl::RGB,
      image::ImageRgba8(_) => gl::RGBA,*/
      DynamicImage::ImageRgb8(_) =>  gl::RGB, // RGB8: types::GLenum = 0x8051;
      DynamicImage::ImageRgba8(_) => gl::RGBA, // RGBA: types::GLenum = 0x1908;
      _ => panic!("What is this format?"),
      /*ImageLuma8(GrayImage) => {},
      ImageLumaA8(GrayAlphaImage) => {},
      ImageBgr8(BgrImage) => {},
      ImageBgra8(BgraImage) => {},
      ImageLuma16(Gray16Image) => {},
      ImageLumaA16(GrayAlpha16Image) => {},
      ImageRgb16(Rgb16Image) => {},
      ImageRgba16(Rgba16Image) => {},*/
    };*/

    let width = img.dimensions().0 as i32;
    let height = img.dimensions().1 as i32;
    //let raw_img = img.into_raw();
    //let img_ptr: *const c_void = raw_img.as_ptr() as *const c_void;
    let data = img.into_raw();

    println!("Loaded image: {}x{}", width, height);
    //println!("Format: {:?}", format);

    gl::TexImage2D(
      gl::TEXTURE_2D,
      0,
      gl::RGBA as i32,
      //format as i32,
      width,
      height,
      0,
      gl::RGBA,
      //format,
      gl::UNSIGNED_BYTE,
      &data[0] as *const u8 as *const c_void,
    );

    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_S, gl::REPEAT as i32);
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_T, gl::REPEAT as i32);
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::LINEAR as i32);
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::LINEAR as i32);

    // Create Vertex Array Object
    gl::GenVertexArrays(1, &mut vao);
    gl::BindVertexArray(vao);

    // Use shader program
    gl::UseProgram(program);
    gl::BindFragDataLocation(program, 0, CString::new("out_color").unwrap().as_ptr());

    // Specify the layout of the vertex data
    let pos_attr = gl::GetAttribLocation(program, CString::new("position").unwrap().as_ptr());
    gl::EnableVertexAttribArray(pos_attr as GLuint);
    gl::VertexAttribPointer(
      pos_attr as GLuint,
      2,
      gl::FLOAT,
      gl::FALSE as GLboolean,
      get_stride::<f32>(7),
      get_pointer_offset::<f32>(0),
    );

    // Specify the layout of the vertex data
    let color_attr = gl::GetAttribLocation(program, CString::new("in_color").unwrap().as_ptr());
    gl::EnableVertexAttribArray(color_attr as GLuint);
    gl::VertexAttribPointer(
      color_attr as GLuint,
      3,
      gl::FLOAT,
      gl::FALSE as GLboolean,
      get_stride::<f32>(7),
      get_pointer_offset::<f32>(2),
    );

    // Specify the layout of the vertex data
    let tex_attr = gl::GetAttribLocation(program, CString::new("tex_coord").unwrap().as_ptr());
    gl::EnableVertexAttribArray(tex_attr as GLuint);
    gl::VertexAttribPointer(
      tex_attr as GLuint,
      2,
      gl::FLOAT,
      gl::FALSE as GLboolean,
      get_stride::<f32>(7),
      get_pointer_offset::<f32>(5),
    );

    let triangle_color_attr =  gl::GetUniformLocation(program, CString::new("triangleColor").unwrap().as_ptr());
    gl::Uniform3f(triangle_color_attr, 1.0, 0.0, 1.0);
  }

  event_loop.run(move |event, window, control_flow| {
    //*control_flow = ControlFlow::Wait;
    match event {
      Event::LoopDestroyed => return,
      Event::WindowEvent { event, .. } => match event {
        WindowEvent::CloseRequested => {
          // Cleanup
          unsafe {
            gl::DeleteProgram(program);
            gl::DeleteShader(fs);
            gl::DeleteShader(vs);
            gl::DeleteBuffers(1, &vbo);
            gl::DeleteVertexArrays(1, &vao);
          }
          *control_flow = ControlFlow::Exit
        },
        _ => (),
      },
      Event::RedrawRequested(_) => {
        unsafe {
          // Clear the screen to black
          gl::ClearColor(0.3, 0.3, 0.3, 1.0);
          gl::Clear(gl::COLOR_BUFFER_BIT);
          // Draw a triangle from the 3 vertices
          //gl::DrawArrays(gl::TRIANGLES, 0, 3);

          gl::DrawElements(
            gl::TRIANGLES,
            ELEMENTS.len() as GLsizei,
            gl::UNSIGNED_INT,
            std::mem::transmute(&ELEMENTS[0])
          );
        }
        gl_window.swap_buffers().unwrap();
      },
      _ => (),
    }

    // TODO: This belongs in a worker thread with buffers on both producer and consumer.
    if let Some(capture) = capture_provider.get_capture() {
      if let Ok(image) = capture.get_color_image() {
        let width = image.get_width_pixels() as i32;
        let height = image.get_height_pixels() as i32;
        println!("Size: {}x{}", width, height);

        let format = image.get_format();
        println!("format: {:?}", format);

        let buffer = image.get_buffer();

        unsafe {
          gl::BindTexture(gl::TEXTURE_2D, tex);
          gl::TexImage2D(
            gl::TEXTURE_2D,
            0,
            gl::RGBA as i32,
            width,
            height,
            0,
            gl::RGBA,
            gl::UNSIGNED_BYTE,
            buffer as *const c_void,
          );

          gl::ClearColor(0.3, 0.3, 0.3, 1.0);
          gl::Clear(gl::COLOR_BUFFER_BIT);

          gl::DrawElements(
            gl::TRIANGLES,
            ELEMENTS.len() as GLsizei,
            gl::UNSIGNED_INT,
            std::mem::transmute(&ELEMENTS[0])
          );
        }
        gl_window.swap_buffers().unwrap();
      }
    }
  });
}

fn compile_shader(src: &str, ty: GLenum) -> GLuint {
  let shader;
  unsafe {
    shader = gl::CreateShader(ty);
    // Attempt to compile the shader
    let c_str = CString::new(src.as_bytes()).unwrap();
    gl::ShaderSource(shader, 1, &c_str.as_ptr(), ptr::null());
    gl::CompileShader(shader);

    // Get the compile status
    let mut status = gl::FALSE as GLint;
    gl::GetShaderiv(shader, gl::COMPILE_STATUS, &mut status);

    // Fail on error
    if status != (gl::TRUE as GLint) {
      let mut len = 0;
      gl::GetShaderiv(shader, gl::INFO_LOG_LENGTH, &mut len);
      let mut buf = Vec::with_capacity(len as usize);
      buf.set_len((len as usize) - 1); // subtract 1 to skip the trailing null character
      gl::GetShaderInfoLog(
        shader,
        len,
        ptr::null_mut(),
        buf.as_mut_ptr() as *mut GLchar,
      );
      panic!(
        "{}",
        str::from_utf8(&buf)
            .ok()
            .expect("ShaderInfoLog not valid utf8")
      );
    }
  }
  shader
}

fn link_program(vs: GLuint, fs: GLuint) -> GLuint {
  unsafe {
    let program = gl::CreateProgram();
    gl::AttachShader(program, vs);
    gl::AttachShader(program, fs);
    gl::LinkProgram(program);
    // Get the link status
    let mut status = gl::FALSE as GLint;
    gl::GetProgramiv(program, gl::LINK_STATUS, &mut status);

    // Fail on error
    if status != (gl::TRUE as GLint) {
      let mut len: GLint = 0;
      gl::GetProgramiv(program, gl::INFO_LOG_LENGTH, &mut len);
      let mut buf = Vec::with_capacity(len as usize);
      buf.set_len((len as usize) - 1); // subtract 1 to skip the trailing null character
      gl::GetProgramInfoLog(
        program,
        len,
        ptr::null_mut(),
        buf.as_mut_ptr() as *mut GLchar,
      );
      panic!(
        "{}",
        str::from_utf8(&buf)
            .ok()
            .expect("ProgramInfoLog not valid utf8")
      );
    }
    program
  }
}

/// Calculate the stride width for OpenGL
/// Useful for `gl::VertexAttribPointer`.
fn get_stride<T>(size: usize) -> gl::types::GLint {
  (size * std::mem::size_of::<T>()) as gl::types::GLint
}

/// Calculate the offset for OpenGL
/// Useful for `gl::VertexAttribPointer`.
fn get_pointer_offset<T>(offset: usize) -> *const gl::types::GLvoid {
  match offset {
    0 => null(),
    _ => (offset * std::mem::size_of::<T>()) as *const gl::types::GLvoid,
  }
}
