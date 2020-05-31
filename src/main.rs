use anyhow::Result as AnyhowResult;
use anyhow::bail;
use log::{info, warn};
use md5::{Md5, Digest};
use s3::bucket::Bucket;
use s3::creds::Credentials;
use s3::region::Region;
use s3::serde_types::Object;
use std::fs::File;
use std::path::{PathBuf, Path};
use std::{fs, io, env};
use std::str::FromStr;

struct BucketDownloader {
	bucket: Bucket,
	destination_directory: PathBuf,
	temp_directory: PathBuf,
}

impl BucketDownloader {
	pub fn create(
		bucket: Bucket,
		destination_directory: &str,
		temp_directory: &str) -> AnyhowResult<Self>
	{
		let destination_directory = PathBuf::from(destination_directory);
		let temp_directory = PathBuf::from(temp_directory);

		Self::check_directory(&destination_directory)?;
		Self::check_directory(&temp_directory)?;

		Ok(Self {
			bucket,
      destination_directory,
			temp_directory,
		})
	}

	fn check_directory(path: &PathBuf) -> AnyhowResult<()> {
		if !path.exists() {
			bail!("Path doesn't exist: {:?}", path);
		}
		if !path.is_dir() {
			bail!("Path isn't a directory: {:?}", path);
		}
    Ok(())
	}

	pub fn download_matching(&self, path: &str) -> AnyhowResult<()> {
		let results = self.bucket.list_blocking("".to_string(), None)?;

		let mut objects = Vec::new();

		for (list, code) in results {
      if code != 200 {
				bail!("Response from S3 bucket was not okay: {}", code);
			}

			if list.is_truncated {
				// TODO: Handle pagination
				warn!("Results returned are paginated. This isn't handled yet!");
			}

			for content in list.contents {
				objects.push(content.clone());
			}
		}

		for object in objects.iter() {
			info!("all objects: {:?}", object.key);
		}

		let objects : Vec<Object> = objects.into_iter()
			.filter(|o| o.key.starts_with(path))
			.filter(|o| o.size > 0)
			.collect();

		for object in objects.iter() {
			self.download_object(object)?;
		}

		Ok(())
	}

  fn download_object(&self, object: &Object) -> AnyhowResult<()> {
    if self.object_already_downloaded(object) {
			info!("Object already downloaded: {}", object.key);
			return Ok(());
		}
		self.download_object_to_temp(object)?;
		self.move_temp_to_downloads(object)?;
    Ok(())
	}

	fn object_already_downloaded(&self, object: &Object) -> bool {
		let mut path = object.key.clone();
		if path.starts_with("/") {
			path = path[1..].into();
		}

		let download_path = self.destination_directory.join(path);
		if !download_path.exists() {
			info!("Download path does not already exist: {:?}", download_path);
			return false;
		}

		let file_hash = Self::hash_file_contents(&download_path).unwrap(); // TODO
		let object_hash = Self::hash_object(object);

		// NB: Multipart-uploaded objects do not have an accurate md5 hash.
		// Read more: https://stackoverflow.com/a/29350548
		if !file_hash.eq_ignore_ascii_case(&object_hash) {
			info!("File hash '{}' does not match object hash '{}' for file {}",
						file_hash, object_hash, object.key);
			return false;
		}

		true
	}

	fn download_object_to_temp(&self, object: &Object) -> AnyhowResult<()> {
		info!("Downloading object: {}", object.key);

		let temp_file_path = self.temp_download_path(object);
		let mut temp_file = File::create(temp_file_path)?;

		let code = self.bucket.get_object_stream_blocking(&object.key, &mut temp_file)?;
		if code != 200 {
			bail!("Couldn't download object. Code = {}", code);
		}

		Ok(())
	}

	fn move_temp_to_downloads(&self, object: &Object) -> AnyhowResult<()> {
		let full_download_path = self.permanent_download_path(object);
    let download_directory_base = Self::base_directory(&full_download_path);

    if !download_directory_base.exists() {
			info!("Creating directory: {:?}", download_directory_base);
			fs::create_dir_all(download_directory_base)?;
		}

		let temp_file_path = self.temp_download_path(object);

		fs::rename(&temp_file_path, full_download_path)?;
    Ok(())
	}

	fn temp_download_path(&self, object: &Object) -> PathBuf {
		let object_hash = Self::hash_object(object);
		self.temp_directory.join(&object_hash)
	}

	fn permanent_download_path(&self, object: &Object) -> PathBuf {
		self.destination_directory.join(&object.key)
	}

	fn base_directory(path: &Path) -> PathBuf {
		let mut path = path.to_path_buf();
		path.pop();
		path
	}

	fn hash_file_contents(path: &Path) -> AnyhowResult<String> {
		let mut file = fs::File::open(path)?;
		let mut hasher = Md5::new();
		let _n = io::copy(&mut file, &mut hasher)?;
		let hash = hasher.result();
    let hex_encoded = hex::encode(hash);
    Ok(hex_encoded)
	}

	fn hash_object(object: &Object) -> String {
		// NB: E-tag contains quotes, so we remove them
		object.e_tag
			.trim_start_matches("\"")
			.trim_end_matches("\"")
			.to_string()
	}
}

// TODO: Some of these should be yaml/toml configs
const ENV_ACCESS_KEY : &'static str = "ACCESS_KEY";
const ENV_SECRET_KEY : &'static str = "SECRET_KEY";
const ENV_REGION : &'static str = "REGION";
const ENV_BUCKET_NAME : &'static str = "BUCKET_NAME";
const ENV_DOWNLOAD_DIR : &'static str = "DOWNLOAD_DIR";
const ENV_TEMP_DIR : &'static str = "TEMP_DIR";
const ENV_MATCH_PATH : &'static str = "MATCH_PATH";

fn get_env(env_name: &str) -> AnyhowResult<String> {
	match env::var(env_name).as_ref().ok() {
		None => bail!("Must set env var {}", env_name),
		Some(s) => Ok(s.to_string()),
	}
}

pub fn main() -> AnyhowResult<()> {
	std::env::set_var("RUST_LOG", "info");
	env_logger::init();

	info!("starting");

	let access_key = get_env(ENV_ACCESS_KEY)?;
	let secret_key = get_env(ENV_SECRET_KEY)?;
	let region = get_env(ENV_REGION)?;
	let bucket_name = get_env(ENV_BUCKET_NAME)?;
	let download_dir = get_env(ENV_DOWNLOAD_DIR)?;
	let temp_dir = get_env(ENV_TEMP_DIR)?;
	let match_path = get_env(ENV_MATCH_PATH)?;

	let credentials = Credentials::new_blocking(
		Some(&access_key),
		Some(&secret_key),
		None,
		None,
		None,
	)?;

	let region = Region::from_str(&region)?;
	let bucket = Bucket::new(&bucket_name, region, credentials)?;

	let bucket_downloader = BucketDownloader::create(bucket, &download_dir, &temp_dir)?;

	bucket_downloader.download_matching(&match_path)?;

	info!("Done");

	Ok(())
}
