use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use errors::AnyhowResult;
use web_scrapers::sites::cnn::cnn_article_scraper::cnn_article_scraper;
use web_scrapers::sites::techcrunch::techcrunch_article_scraper::techcrunch_article_scraper;

pub async fn ingest_url_scrape_and_save(url: &str, web_content_type: WebContentType) -> AnyhowResult<()> {
  let scraping_result = match web_content_type {
    WebContentType::CnnArticle => cnn_article_scraper(url).await?,
    WebContentType::TechCrunchArticle => techcrunch_article_scraper(url).await?,
    _ => return Ok(()), // TODO: Implement the rest
  };

  Ok(())
}
