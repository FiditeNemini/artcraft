use std::error::Error;
use std::fmt::{Display, Formatter};
use reqwest::Url;
use errors::AnyhowResult;
use crate::payloads::web_scraping_result::WebScrapingResult;
use crate::scrape_supported_webpage::ScrapeUtilityError::UrlParseError;
use crate::sites::cbsnews::cbsnews_article_scraper::cbsnews_article_scraper;
use crate::sites::cnn::cnn_article_scraper::cnn_article_scraper;
use crate::sites::gizmodo::gizmodo_article_scraper::gizmodo_article_scraper;
use crate::sites::kotaku::kotaku_article_scraper::kotaku_article_scraper;
use crate::sites::techcrunch::techcrunch_article_scraper::techcrunch_article_scraper;
use crate::sites::theguardian::theguardian_article_scraper::theguardian_article_scraper;

#[derive(Debug, Clone)]
pub enum ScrapeUtilityError {
  UrlParseError,
  NoHostnameError,
  UnknownUrl,
  // TODO: Make inner reason more strongly typed.
  ScrapingError { reason: String },
}

impl Display for ScrapeUtilityError {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

impl Error for ScrapeUtilityError {}

pub async fn scrape_supported_webpage(url: &str) -> Result<WebScrapingResult, ScrapeUtilityError> {
  let parsed_url = Url::parse(url)
      .map_err(|_err| UrlParseError)?;

  let hostname = parsed_url.host()
      .ok_or(ScrapeUtilityError::NoHostnameError)?
      .to_string();

  let maybe_result = match hostname.as_ref() {
    "cbsnews.com" | "www.cbsnews.com" => cbsnews_article_scraper(url).await,
    "cnn.com" | "www.cnn.com" => cnn_article_scraper(url).await,
    "gizmodo.com" | "www.gizmodo.com" => gizmodo_article_scraper(url).await,
    "kotaku.com" | "www.kotaku.com" => kotaku_article_scraper(url).await,
    "techcrunch.com" | "www.techcrunch.com" => techcrunch_article_scraper(url).await,
    "theguardian.com" | "www.theguardian.com" => theguardian_article_scraper(url).await,
    _ => return Err(ScrapeUtilityError::UnknownUrl),
  };

  maybe_result.map_err(|err| ScrapeUtilityError::ScrapingError { reason: err.to_string() })
}
