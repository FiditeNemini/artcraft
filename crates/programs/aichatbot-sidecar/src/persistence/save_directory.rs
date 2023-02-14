use std::path::{Path, PathBuf};
use log::info;
use path_absolutize::Absolutize;
use errors::{anyhow, AnyhowResult};
use hashing::sha256::sha256_hash_string::sha256_hash_string;
use tokens::tokens::news_stories::NewsStoryToken;
use crate::persistence::hashed_directory_path::hashed_directory_path;

#[derive(Clone)]
pub struct SaveDirectory {
  directory: PathBuf,
}

impl SaveDirectory {

  pub fn new<P: AsRef<Path>>(directory: P) -> Self {
    Self {
      directory: directory.as_ref().to_path_buf()
    }
  }

  // TODO: Move web pages for news under "news_stories/{hashed_url_path}/"
  pub fn directory_for_webpage_url(&self, url: &str) -> AnyhowResult<PathBuf> {
    let url_hash = sha256_hash_string(url)?;
    let directory_path= hashed_directory_path(&url_hash);

    let directory = self.directory.clone()
        .join("webpages/")
        .join(directory_path)
        .join(url_hash);

    Ok(directory)
  }

  // TODO: Move web pages for news under "news_stories/{hashed_url_path}/audio/"
  //  This requires associating the job with the URL.
  pub fn directory_for_audio(&self, news_story_token: &NewsStoryToken) -> AnyhowResult<PathBuf> {
    let entropy_part = news_story_token.entropy_suffix();
    let directory_path= hashed_directory_path(&entropy_part);

    let directory = self.directory.clone()
        .join("audio/")
        .join(directory_path)
        .join(news_story_token.as_str());

    Ok(directory)
  }

  pub fn html_file_for_webpage_url(&self, url: &str) -> AnyhowResult<PathBuf> {
    Ok(self.directory_for_webpage_url(url)?.join("webpage.html"))
  }

  pub fn scrape_summary_file_for_webpage_url(&self, url: &str) -> AnyhowResult<PathBuf> {
    Ok(self.directory_for_webpage_url(url)?.join("scrape_summary.yaml"))
  }

  pub fn rendition_file_for_webpage_url(&self, url: &str) -> AnyhowResult<PathBuf> {
    Ok(self.directory_for_webpage_url(url)?.join("gpt_rendition.yaml"))
  }

  pub fn speakable_monologue_file_for_webpage_url(&self, url: &str) -> AnyhowResult<PathBuf> {
    Ok(self.directory_for_webpage_url(url)?.join("speakable_monologue.yaml"))
  }

  pub fn audio_wav_file_for_news_story(&self, news_story_token: &NewsStoryToken, sequence_order: i64) -> AnyhowResult<PathBuf> {
    let filename = format!("{}.wav", sequence_order);
    Ok(self.directory_for_audio(news_story_token)?.join(filename))
  }

  /// This is just the first directory structure, which is sequential audio files.
  /// We'll be using a database and well-formed filesystem layout later.
  pub fn get_audio_files_dir_v1(&self) -> PathBuf {
    let result = self.directory.join("audio_files");
    let result = result.absolutize()
        .map(|file| file.to_path_buf())
        .unwrap_or(result);
    result
  }
}
