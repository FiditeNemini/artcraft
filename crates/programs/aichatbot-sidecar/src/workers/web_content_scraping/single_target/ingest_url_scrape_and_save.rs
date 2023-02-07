use crate::persistence::save_directory::SaveDirectory;
use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use errors::AnyhowResult;
use std::io::Write;
use web_scrapers::sites::cnn::cnn_article_scraper::cnn_article_scraper;
use web_scrapers::sites::techcrunch::techcrunch_article_scraper::techcrunch_article_scraper;

pub async fn ingest_url_scrape_and_save(url: &str, web_content_type: WebContentType, save_directory: &SaveDirectory) -> AnyhowResult<()>
{
  let scraping_result = match web_content_type {
    WebContentType::CnnArticle => cnn_article_scraper(url).await?,
    WebContentType::TechCrunchArticle => techcrunch_article_scraper(url).await?,
    _ => return Ok(()), // TODO: Implement the rest
  };

  println!("\n\nScraping result: {:?}", scraping_result.result);

  println!("\n\nScraping result: {}", scraping_result.result.body_text);

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

  Ok(())
}
