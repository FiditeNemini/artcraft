use std::fs::OpenOptions;
use std::io::Write;
use std::path::Path;
use reqwest::Url;
use reqwest::Client;
use errors::AnyhowResult;

const USER_AGENT: &str = "storyteller-client/1.0";

/// Downloads a file. Returns the path if downloaded correctly.
pub async fn simple_http_download<P: AsRef<Path>>(url: &Url, download_path: P) -> AnyhowResult<()> {
  let client = Client::builder()
      .gzip(true)
      .build()?;

  let response = client.get(url.clone()) // NB: No IntoUrl for &Url.
      .header("User-Agent", USER_AGENT)
      .header("Accept", "*/*")
      //.header("Accept-Encoding", "gzip, deflate, br")
      .send()
      .await?;

  //let response : Response = reqwest::get(url).await?;
  let bytes = response.bytes().await?;

  let mut file = OpenOptions::new()
      .create(true) // To create a new file
      .write(true)
      .truncate(true)
      .open(download_path)?;

  file.write_all(&bytes)?;

  //let mut out = File::create(download_path)?;
  //std::io::copy(&mut bytes, &mut file)?;

  Ok(())
}
