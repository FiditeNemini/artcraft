use crate::persistence::save_directory::SaveDirectory;
use enums::common::sqlite::web_content_type::WebContentType;
use errors::AnyhowResult;
use std::io::Write;
use web_scrapers::payloads::web_scraping_result::WebScrapingResult;
use web_scrapers::scrape_supported_webpage::scrape_supported_webpage;

pub async fn ingest_url_scrape_and_save(
  url: &str,
  _web_content_type: WebContentType,
  save_directory: &SaveDirectory
) -> AnyhowResult<Option<WebScrapingResult>>
{
  let scraping_result = scrape_supported_webpage(url).await?;

  {
    let directory = save_directory.directory_for_webpage_url(url)?;
    std::fs::create_dir_all(&directory)?;
  }

  {
    let html_filename = save_directory.html_file_for_webpage_url(url)?;
    let mut file = std::fs::File::create(&html_filename)?;
    file.write_all(scraping_result.original_html.as_bytes())?;
  }

  {
    let yaml_filename = save_directory.scrape_summary_file_for_webpage_url(url)?;
    let mut file = std::fs::File::create(&yaml_filename)?;
    serde_yaml::to_writer(file, &scraping_result.result)?;
  }

  Ok(Some(scraping_result))
}
