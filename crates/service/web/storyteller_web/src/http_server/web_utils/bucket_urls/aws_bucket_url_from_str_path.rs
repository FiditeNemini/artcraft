use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;

pub fn aws_bucket_url_from_str_path(
  bucket_path: &str,
) -> String {
  let path = bucket_path;
  format!("https://example.com{}", path)
}

#[cfg(test)]
mod tests {
  use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;

  use crate::http_server::web_utils::bucket_urls::aws_bucket_url_from_media_path::aws_bucket_url_from_media_path;

  #[test]
  fn test() {
    let bucket_path = MediaFileBucketPath::from_object_hash("test", Some("pre_"), Some(".ext"));

    assert_eq!(aws_bucket_url_from_media_path(&bucket_path),
               "https://example.com/media/t/e/s/test/pre_test.ext".to_string());
  }
}