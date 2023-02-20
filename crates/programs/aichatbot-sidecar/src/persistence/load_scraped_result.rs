use crate::persistence::save_directory::SaveDirectory;
use errors::AnyhowResult;
use web_scrapers::payloads::web_scraping_result::ScrapedWebArticle;

pub async fn load_scraped_result(url: &str, save_directory: &SaveDirectory) -> AnyhowResult<ScrapedWebArticle> {
  let scrape_yaml_filename = save_directory.scrape_summary_file_for_webpage_url(url)?;
  let mut file = std::fs::File::open(&scrape_yaml_filename)?;
  let scraping_result : ScrapedWebArticle = serde_yaml::from_reader(file)?;
  Ok(scraping_result)
}
