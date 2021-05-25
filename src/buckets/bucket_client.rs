use anyhow::bail;
use log::info;
use log::warn;
use s3::bucket::Bucket;
use s3::creds::Credentials;
use s3::region::Region;
use std::io::Read;
use std::path::{PathBuf, Path};
use std::str::FromStr;
use tokio::io::{AsyncBufRead, BufReader, AsyncReadExt};
use tokio::io::AsyncBufReadExt;
use tokio::fs::File;

#[derive(Clone)]
pub struct BucketClient {
  bucket: Bucket,

  /// If set, put all files under this root path.
  optional_bucket_root: Option<String>,
}

impl BucketClient {

  pub fn create(
    access_key: &str,
    secret_key: &str,
    region_name: &str,
    bucket_name: &str,
    optional_bucket_root: Option<&str>) -> anyhow::Result<Self>
  {
    let credentials = Credentials::new(
      Some(&access_key),
      Some(&secret_key),
      None,
      None,
      None,
    )?;
    // NB: The GCS buckets aren't supported by default.
    let region = Region::Custom {
      region: region_name.to_owned(),
      endpoint: "https://storage.googleapis.com".to_owned(),
    };
    let mut bucket = Bucket::new(&bucket_name, region, credentials)?;

    bucket.set_path_style();
    bucket.set_subdomain_style();

    let optional_bucket_root = optional_bucket_root.map(|s| s.to_string());

    Ok(Self {
      bucket,
      optional_bucket_root,
    })
  }

  fn get_rooted_object_name(&self, object_name: &str) -> String {
    match &self.optional_bucket_root {
      None => object_name.to_string(),
      Some(root) => format!("{}/{}", root, object_name),
    }
  }

  pub async fn upload_file(&self, object_name: &str, bytes: &[u8]) -> anyhow::Result<()> {
    info!("Filename for bucket: {}", object_name);

    let object_name = self.get_rooted_object_name(object_name);
    info!("Rooted filename for bucket: {}", object_name);

    let (body_bytes, code) = self.bucket.put_object(&object_name, bytes).await?;

    info!("upload code: {}", code);

    if code != 200 {
      let body = String::from_utf8(body_bytes)?;
      warn!("upload body: {}", body);
    }

    Ok(())
  }

  pub async fn upload_file_with_content_type(&self, object_name: &str, bytes: &[u8], content_type: &str) -> anyhow::Result<()> {
    info!("Filename for bucket: {}", object_name);

    let object_name = self.get_rooted_object_name(object_name);
    info!("Rooted filename for bucket: {}", object_name);

    let (body_bytes, code) = self.bucket.put_object_with_content_type(&object_name, bytes, content_type).await?;

    info!("upload code: {}", code);

    if code != 200 {
      let body = String::from_utf8(body_bytes)?;
      warn!("upload body: {}", body);
    }

    Ok(())
  }

  // NB: New version has blocking client rather than blocking calls.
  // pub fn upload_file_blocking(&self, object_name: &str, bytes: &[u8]) -> anyhow::Result<()> {
  //   info!("Filename for bucket: {}", object_name);
  //
  //   let (_, code) = self.bucket.put_object_blocking(object_name, bytes)?;
  //
  //   info!("upload code: {}", code);
  //
  //   Ok(())
  // }

  pub async fn upload_filename(&self, object_name: &str, filename: &Path) -> anyhow::Result<()> {
    /*let mut file = File::open(filename).await?;
    let mut reader = BufReader::new(file);

    info!("Uploading...");

    let code = self.bucket.put_object_stream(&mut reader, object_name).await?;

    info!("upload code: {}", code);

    Ok(())
    */

    // TODO: does a newer version of this crate handle streaming/buffering file contents?
    let mut file = File::open(filename).await?;
    let mut buffer : Vec<u8> = Vec::new();
    file.read_to_end(&mut buffer).await?;

    info!("Uploading...");

    self.upload_file(object_name, &buffer).await
  }

  pub async fn upload_filename_with_content_type(&self, object_name: &str, filename: &Path, content_type: &str) -> anyhow::Result<()> {
    // TODO: does a newer version of this crate handle streaming/buffering file contents?
    let mut file = File::open(filename).await?;
    let mut buffer : Vec<u8> = Vec::new();
    file.read_to_end(&mut buffer).await?;

    info!("Uploading with content type...");

    self.upload_file_with_content_type(object_name, &buffer, content_type).await
  }

  // NB: New version has blocking client rather than blocking calls.
  // pub fn upload_filename_blocking(&self, object_name: &str, filename: &Path) -> anyhow::Result<()> {
  //   // TODO: does a newer version of this crate handle streaming/buffering file contents?
  //   let mut file = File::open(filename)?;
  //   let mut buffer : Vec<u8> = Vec::new();
  //   file.read_to_end(&mut buffer)?;
  //
  //   self.upload_file_blocking(object_name, &buffer)
  // }

  pub async fn download_file(&self, path: &str) -> anyhow::Result<Vec<u8>> {
    info!("downloading from bucket: {}", path);
    let (bytes, code) = self.bucket.get_object(path).await?;

    match code {
      404 => bail!("File not found in bucket: {}", path),
      _ => {},
    }

    info!("download code: {}", code);
    Ok(bytes)
  }

  // NB: New version has blocking client rather than blocking calls.
  // pub fn download_file_blocking(&self, path: &str) -> anyhow::Result<Vec<u8>> {
  //   info!("downloading from bucket: {}", path);
  //   let (bytes, code) = self.bucket.get_object_blocking(path)?;
  //
  //   match code {
  //     404 => bail!("File not found in bucket: {}", path),
  //     _ => {},
  //   }
  //
  //   info!("download code: {}", code);
  //   Ok(bytes)
  // }
}
