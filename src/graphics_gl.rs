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
use image::{GenericImage, GenericImageView};
use glutin::event::{Event, WindowEvent};
use glutin::event_loop::{ControlFlow, EventLoop};
use glutin::window::WindowBuilder;
use glutin::ContextBuilder;

//use shader::Shader;

// Vertex data
static VERTEX_DATA: [GLfloat; 6] = [0.0, 0.5, 0.5, -0.5, -0.5, -0.5];

// Shader sources
static VS_SRC: &'static str = "
#version 150
in vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}";

static FS_SRC: &'static str = "
#version 150
out vec4 out_color;
void main() {
    out_color = vec4(1.0, 1.0, 1.0, 1.0);
}";

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



pub fn run() {
  /*//noinspection RsBorrowChecker
  let mut glfw = glfw::init(glfw::FAIL_ON_ERRORS).unwrap();

  glfw.window_hint(glfw::WindowHint::ContextVersion(3, 3));
  glfw.window_hint(glfw::WindowHint::OpenGlProfile(glfw::OpenGlProfileHint::Core));

  let (mut window, events) = glfw
      .create_window(800, 600, "Hello this is window", glfw::WindowMode::Windowed)
      .expect("Failed to create GLFW window.");

  window.set_key_polling(true);
  window.make_current();
  window.set_framebuffer_size_polling(true);

  while !window.should_close() {
    glfw.poll_events();
    for (_, event) in glfw::flush_messages(&events) {
      handle_window_event(&mut window, event);
    }
  }*/

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
  let vs = compile_shader(VS_SRC, gl::VERTEX_SHADER);
  let fs = compile_shader(FS_SRC, gl::FRAGMENT_SHADER);
  let program = link_program(vs, fs);

  let mut vao = 0;
  let mut vbo = 0;

  unsafe {
    // Create Vertex Array Object
    gl::GenVertexArrays(1, &mut vao);
    gl::BindVertexArray(vao);

    // Create a Vertex Buffer Object and copy the vertex data to it
    gl::GenBuffers(1, &mut vbo);
    gl::BindBuffer(gl::ARRAY_BUFFER, vbo);
    gl::BufferData(
      gl::ARRAY_BUFFER,
      (VERTEX_DATA.len() * mem::size_of::<GLfloat>()) as GLsizeiptr,
      mem::transmute(&VERTEX_DATA[0]),
      gl::STATIC_DRAW,
    );

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
      0,
      ptr::null(),
    );
  }

  event_loop.run(move |event, _, control_flow| {
    *control_flow = ControlFlow::Wait;
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
          gl::DrawArrays(gl::TRIANGLES, 0, 3);
        }
        gl_window.swap_buffers().unwrap();
      },
      _ => (),
    }
  });

  /*gl::load_with(|symbol| window.get_proc_address(symbol) as *const _);

  let (ourShader, VBO, VAO, EBO, texture) = unsafe {
    // build and compile our shader program
    // ------------------------------------
    let ourShader = Shader::new(
      "src/_1_getting_started/shaders/4.1.texture.vs",
      "src/_1_getting_started/shaders/4.1.texture.fs");

    // set up vertex data (and buffer(s)) and configure vertex attributes
    // ------------------------------------------------------------------
    // HINT: type annotation is crucial since default for float literals is f64
    let vertices: [f32; 32] = [
      // positions       // colors        // texture coords
      0.5,  0.5, 0.0,   1.0, 0.0, 0.0,   1.0, 1.0, // top right
      0.5, -0.5, 0.0,   0.0, 1.0, 0.0,   1.0, 0.0, // bottom right
      -0.5, -0.5, 0.0,   0.0, 0.0, 1.0,   0.0, 0.0, // bottom left
      -0.5,  0.5, 0.0,   1.0, 1.0, 0.0,   0.0, 1.0  // top left
    ];
    let indices = [
      0, 1, 3,  // first Triangle
      1, 2, 3   // second Triangle
    ];
    let (mut VBO, mut VAO, mut EBO) = (0, 0, 0);
    gl::GenVertexArrays(1, &mut VAO);
    gl::GenBuffers(1, &mut VBO);
    gl::GenBuffers(1, &mut EBO);

    gl::BindVertexArray(VAO);

    gl::BindBuffer(gl::ARRAY_BUFFER, VBO);
    gl::BufferData(gl::ARRAY_BUFFER,
      (vertices.len() * mem::size_of::<GLfloat>()) as GLsizeiptr,
      &vertices[0] as *const f32 as *const c_void,
      gl::STATIC_DRAW);

    gl::BindBuffer(gl::ELEMENT_ARRAY_BUFFER, EBO);
    gl::BufferData(gl::ELEMENT_ARRAY_BUFFER,
      (indices.len() * mem::size_of::<GLfloat>()) as GLsizeiptr,
      &indices[0] as *const i32 as *const c_void,
      gl::STATIC_DRAW);

    let stride = 8 * mem::size_of::<GLfloat>() as GLsizei;
    // position attribute
    gl::VertexAttribPointer(0, 3, gl::FLOAT, gl::FALSE, stride, ptr::null());
    gl::EnableVertexAttribArray(0);
    // color attribute
    gl::VertexAttribPointer(1, 3, gl::FLOAT, gl::FALSE, stride, (3 * mem::size_of::<GLfloat>()) as *const c_void);
    gl::EnableVertexAttribArray(1);
    // texture coord attribute
    gl::VertexAttribPointer(2, 2, gl::FLOAT, gl::FALSE, stride, (6 * mem::size_of::<GLfloat>()) as *const c_void);
    gl::EnableVertexAttribArray(2);

    // load and create a texture
    // -------------------------
    let mut texture = 0;
    gl::GenTextures(1, &mut texture);
    gl::BindTexture(gl::TEXTURE_2D, texture); // all upcoming GL_TEXTURE_2D operations now have effect on this texture object
    // set the texture wrapping parameters
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_S, gl::REPEAT as i32); // set texture wrapping to gl::REPEAT (default wrapping method)
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_T, gl::REPEAT as i32);
    // set texture filtering parameters
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::LINEAR as i32);
    gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::LINEAR as i32);
    // load image, create texture and generate mipmaps
    let img = image::open(&Path::new("resources/textures/container.jpg")).expect("Failed to load texture");
    let data = img.raw_pixels();
    gl::TexImage2D(gl::TEXTURE_2D,
      0,
      gl::RGB as i32,
      img.width as i32,
      img.height as i32,
      0,
      gl::RGB,
      gl::UNSIGNED_BYTE,
      &data[0] as *const u8 as *const c_void);
    gl::GenerateMipmap(gl::TEXTURE_2D);

    (ourShader, VBO, VAO, EBO, texture)
  };

  // render loop
  // -----------
  while !window.should_close() {
    // events
    // -----
    process_events(&mut window, &events);

    // render
    // ------
    unsafe {
      gl::ClearColor(0.2, 0.3, 0.3, 1.0);
      gl::Clear(gl::COLOR_BUFFER_BIT);

      // bind Texture
      gl::BindTexture(gl::TEXTURE_2D, texture);

      // render container
      ourShader.useProgram();
      gl::BindVertexArray(VAO);
      gl::DrawElements(gl::TRIANGLES, 6, gl::UNSIGNED_INT, ptr::null());
    }

    // glfw: swap buffers and poll IO events (keys pressed/released, mouse moved etc.)
    // -------------------------------------------------------------------------------
    window.swap_buffers();
    glfw.poll_events();
  }

  // optional: de-allocate all resources once they've outlived their purpose:
  // ------------------------------------------------------------------------
  unsafe {
    gl::DeleteVertexArrays(1, &VAO);
    gl::DeleteBuffers(1, &VBO);
    gl::DeleteBuffers(1, &EBO);
  }*/
}

// NOTE: not the same version as in common.rs!
fn process_events(window: &mut glfw::Window, events: &Receiver<(f64, glfw::WindowEvent)>) {
  for (_, event) in glfw::flush_messages(events) {
    match event {
      glfw::WindowEvent::FramebufferSize(width, height) => {
        // make sure the viewport matches the new window dimensions; note that width and
        // height will be significantly larger than specified on retina displays.
        unsafe { gl::Viewport(0, 0, width, height) }
      }
      glfw::WindowEvent::Key(Key::Escape, _, Action::Press, _) => window.set_should_close(true),
      _ => {}
    }
  }
}

fn handle_window_event(window: &mut glfw::Window, event: glfw::WindowEvent) {
  match event {
    glfw::WindowEvent::Key(Key::Escape, _, Action::Press, _) => window.set_should_close(true),
    _ => {}
  }
}