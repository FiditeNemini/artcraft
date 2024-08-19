use url::Url;

use errors::AnyhowResult;

pub fn aws_bucket_url_from_str_path(
  bucket_path: &str,
) -> AnyhowResult<Url> {
  let url = format!("https://storage.googleapis.com/vocodes-public{}", bucket_path);
  let url = Url::parse(&url)?;
  Ok(url)
}

#[cfg(test)]
mod tests {
  use url::Url;

  use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;

  use crate::http_server::web_utils::bucket_urls::aws_bucket_url_from_media_path::aws_bucket_url_from_media_path;

  #[test]
  fn test() {
    let bucket_path = MediaFileBucketPath::from_object_hash("test", Some("pre_"), Some(".ext"));

    assert_eq!(aws_bucket_url_from_media_path(&bucket_path).unwrap(),
               Url::parse("https://storage.googleapis.com/vocodes-public/media/t/e/s/test/pre_test.ext").unwrap());
  }
}