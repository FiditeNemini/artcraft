use std::ops::Deref;
use crate::payloads::web_scraping_target::WebScrapingTarget;
use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use errors::{anyhow, AnyhowResult};
use log::{error, warn};
use once_cell::sync::Lazy;
use rss::Channel;
use scraper::{Html, Selector};
use crate::payloads::web_scraping_result::{OriginalHtmlWithWebScrapingResult, WebScrapingResult};

/// The main article content container
static ARTICLE_CONTENT_SELECTOR : Lazy<Selector> = Lazy::new(|| {
  Selector::parse(".article-content").expect("this selector should parse")
});

/// Paragraphs within the article
static PARAGRAPH_SELECTOR : Lazy<Selector> = Lazy::new(|| {
  // NB: The "div >" removes mysterious inclusion of Twitter <iframe>s
  // (not sure why those are included, as the dom doesn't include <p>'s)
  Selector::parse("div > p").expect("this selector should parse")
});

/// The title of the article
static TITLE_SELECTOR : Lazy<Selector> = Lazy::new(|| {
  Selector::parse(".article__title").expect("this selector should parse")
});

pub async fn techcrunch_article_scraper(url: &str) -> AnyhowResult<OriginalHtmlWithWebScrapingResult> {
  let downloaded_document= reqwest::get(url)
      .await?
      .bytes()
      .await?;

  let downloaded_document = String::from_utf8_lossy(downloaded_document.deref()).to_string();
  let document = Html::parse_document(&downloaded_document);

  let mut article_title = None;

  if let Some(title) = document.select(&TITLE_SELECTOR).next() {
    let mut pieces = Vec::new();

    for mut text in title.text() {
      text = text.trim();
      if !text.is_empty() {
        pieces.push(text.to_string());
      }
    }

    let title = pieces.join(" ").trim().to_string();

    article_title = Some(title);
  }

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

  Ok(OriginalHtmlWithWebScrapingResult {
    original_html: downloaded_document,
    result: WebScrapingResult {
      url: url.to_string(),
      web_content_type: WebContentType::TechCrunchArticle,
      maybe_title: article_title,
      maybe_author: None,
      paragraphs: paragraphs.clone(),
      body_text: paragraphs.join("\n\n"),
      maybe_heading_image_url: None,
      maybe_featured_image_url: None,
    }
  })
}
