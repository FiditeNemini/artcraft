use image::DynamicImage;
use image::imageops::FilterType;

pub fn resize_preserving_aspect(source_image: &DynamicImage, new_width: u32, new_height: u32) -> DynamicImage {
  source_image.resize(new_width, new_height, FilterType::Lanczos3)
}

#[cfg(test)]
mod tests {
  use image::DynamicImage;

  use errors::AnyhowResult;
  use testing::test_file_path::test_file_path;

  use crate::resize_preserving_aspect::resize_preserving_aspect;

  fn open_test_image(filename: &str) -> AnyhowResult<DynamicImage> {
    let path = test_file_path(filename)?;
    Ok(image::open(path)?)
  }

  fn open_tall_image() -> AnyhowResult<DynamicImage> {
    let image = open_test_image("test_data/image/mochi.jpg").unwrap();
    assert!(image.width() < image.height());
    assert_eq!(image.width(), 753);
    assert_eq!(image.height(), 1000);
    Ok(image)
  }

  fn open_wide_image() -> AnyhowResult<DynamicImage> {
    let image = open_test_image("test_data/image/juno.jpg").unwrap();
    assert!(image.width() > image.height());
    assert_eq!(image.width(), 1000);
    assert_eq!(image.height(), 750);
    Ok(image)
  }

  #[test]
  fn downsize_wide_image_preserving_aspect() {
    let image = open_wide_image().unwrap();
    assert!(image.width() > image.height());

    let resized = resize_preserving_aspect(&image, 500, 500);
    assert!(resized.width() > resized.height());
    assert_eq!(resized.width(), 500);
    assert_eq!(resized.height(), 375);
  }

  #[test]
  fn downsize_tall_image_preserving_aspect() {
    let image = open_tall_image().unwrap();
    assert!(image.width() < image.height());

    let resized = resize_preserving_aspect(&image, 500, 500);
    assert!(resized.width() < resized.height());
    assert_eq!(resized.width(), 377);
    assert_eq!(resized.height(), 500);
  }

  #[test]
  fn enlarge_wide_image_preserving_aspect() {
    let image = open_wide_image().unwrap();
    assert!(image.width() > image.height());

    let resized = resize_preserving_aspect(&image, 1200, 1200);
    assert!(resized.width() > resized.height());
    assert_eq!(resized.width(), 1200);
    assert_eq!(resized.height(), 900);
  }

  #[test]
  fn enlarge_tall_image_preserving_aspect() {
    let image = open_tall_image().unwrap();
    assert!(image.width() < image.height());

    let resized = resize_preserving_aspect(&image, 1200, 1200);
    assert!(resized.width() < resized.height());
    assert_eq!(resized.width(), 904);
    assert_eq!(resized.height(), 1200);
  }
}
