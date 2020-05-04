/// We can't send trait 'Texture2dDataSource' impl 'RawImage2d' as it requires its data has
/// the same lifetime, so here we collect it together here.
pub struct TextureData2d<'a> {
  pub raw_data: Vec<u8>,
  pub dimensions: (u32, u32),
  pub raw_image: RawImage2d<'a, u8>,
}

impl <'a> TextureData2d<'a> {
  pub fn from_k4a_color_image(k4a_color_image: &Image) -> Self {
    let dynamic_image = depth_to_image(k4a_color_image)
        .expect("Should convert");
    let rgba_image = dynamic_image.to_rgba();
    let dimensions = rgba_image.dimensions();
    let raw_data= rgba_image.into_raw();

    let texture = glium::texture::RawImage2d::from_raw_rgba_reversed(
      &raw_data,
      dimensions);

    TextureData2d {
      raw_data,
      dimensions,
      raw_image: texture,
    }
  }
}

pub fn capture_thread_to_texture(frame: Arc<Mutex<Option<TextureData2d>>>) {
  let installed_devices = device_get_installed_count();
  println!("Installed devices: {}", installed_devices);

  let device = Device::open(0).unwrap();
  println!("Device: {:?}", device);

  let serial_number = device.get_serial_number().unwrap();
  println!("Device: {:?}", serial_number);

  println!("Starting cameras...");
  device.start_cameras().unwrap();

  loop {
    let mut captured_image = None;

    let capture = device.get_capture(1000)
        .expect("Should be able to get frame capture.");

    match capture.get_color_image() {
      Ok(image) => {
        captured_image = Some(image);
      }
      _ => {
        continue; // We didn't grab a frame.
      },
    }

    let image = captured_image.unwrap();

    let texture_data_2d = TextureData2d::from_k4a_color_image(&image);

    match frame.lock() {
      Ok(mut lock) => {
        *lock = Some(texture_data_2d)
      },
      Err(_) => {
        continue; // Wat.
      },
    }
  }
}

pub fn grab_single_frame() -> DynamicImage {
  let installed_devices = device_get_installed_count();
  println!("Installed devices: {}", installed_devices);
  {
    let device = Device::open(0).unwrap();
    println!("Device: {:?}", device);
    let serial_number = device.get_serial_number().unwrap();
    println!("Device: {:?}", serial_number);

    println!("Starting cameras...");
    device.start_cameras().unwrap();

    let mut captured_image = None;
    loop {
      let capture = device.get_capture(1000).ok().unwrap();

      match capture.get_color_image() {
        Ok(image) => {
          captured_image = Some(image);
          break;
        }
        _ => {},
      }
    }

    let image = captured_image.unwrap();

    let image_image = depth_to_image(&image).expect("depth_to_image should work");

    device.stop_cameras();

    return image_image;
  }
}
