use crate::common_extractors::extract_title::extract_title;
use crate::payloads::web_scraping_result::{OriginalHtmlWithWebScrapingResult, WebScrapingResult};
use crate::payloads::web_scraping_target::WebScrapingTarget;
use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use errors::{anyhow, AnyhowResult};
use log::{error, warn};
use once_cell::sync::Lazy;
use rss::Channel;
use scraper::{Html, Selector};
use std::ops::Deref;

/// The main article content container
static ARTICLE_CONTENT_SELECTOR : Lazy<Selector> = Lazy::new(|| {
  Selector::parse(".article-content").expect("this selector should parse")
});

/// Paragraphs within the article
static PARAGRAPH_SELECTOR : Lazy<Selector> = Lazy::new(|| {
  // NB: Techcrunch content issue:
  // The "div >" removes mysterious inclusion of Twitter <iframe>s
  // (not sure why those are included, as the dom doesn't include <p>'s)
  Selector::parse("div > p").expect("this selector should parse")
});

/// The title of the article
pub static TECHCRUNCH_TITLE_SELECTOR: Lazy<Selector> = Lazy::new(|| {
  Selector::parse(".article__title").expect("this selector should parse")
});

/// The article featured image
pub static TECHCRUNCH_FEATURED_IMAGE_SELECTOR: Lazy<Selector> = Lazy::new(|| {
  Selector::parse(".article__featured-image").expect("this selector should parse")
});

pub async fn techcrunch_article_scraper(url: &str) -> AnyhowResult<OriginalHtmlWithWebScrapingResult> {
  let downloaded_document= reqwest::get(url)
      .await?
      .bytes()
      .await?;

  let downloaded_document = String::from_utf8_lossy(downloaded_document.deref()).to_string();
  let document = Html::parse_document(&downloaded_document);

  let mut paragraphs = Vec::new();

  if let Some(article_content_div) = document.select(&ARTICLE_CONTENT_SELECTOR).next() {
    for paragraph in article_content_div.select(&PARAGRAPH_SELECTOR).into_iter() {

      let mut paragraph_assembly = Vec::new();

      for text in paragraph.text() {
        let stripped = text.trim();
        if !stripped.is_empty() {
          paragraph_assembly.push(stripped.to_string());
        }
      }

      let paragraph_full_text = paragraph_assembly.join(" ")
          .trim()
          .to_string();

      if !paragraph_full_text.is_empty() {
        paragraphs.push(paragraph_full_text);
      }
    }
  }

  let maybe_title = extract_title(&document, &TECHCRUNCH_TITLE_SELECTOR);

  let body_text = paragraphs.join("\n\n");

  Ok(OriginalHtmlWithWebScrapingResult {
    original_html: downloaded_document,
    result: WebScrapingResult {
      url: url.to_string(),
      web_content_type: WebContentType::TechCrunchArticle,
      maybe_title,
      maybe_author: None, // TODO
      paragraphs,
      body_text,
      maybe_heading_image_url: None, // TODO
      maybe_featured_image_url: None, // TODO
    }
  })
}
