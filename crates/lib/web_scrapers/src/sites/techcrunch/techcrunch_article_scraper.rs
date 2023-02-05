use std::ops::Deref;
use crate::payloads::web_scraping_target::WebScrapingTarget;
use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use errors::{anyhow, AnyhowResult};
use log::{error, warn};
use rss::Channel;
use scraper::{Html, Selector};
use crate::payloads::web_scraping_result::WebScrapingResult;

pub async fn techcrunch_article_scraper(url: &str) -> AnyhowResult<WebScrapingResult> {
  let downloaded_document= reqwest::get(url)
      .await?
      .bytes()
      .await?;

  // TODO: Save raw html download
  let content = String::from_utf8_lossy(downloaded_document.deref()).to_string();
  let document = Html::parse_document(&content);

  //println!("Document: {:?}", document);

  //let selector = Selector::parse(".article__content")
  //let selector = Selector::parse("p.paragraph")
  let selector = Selector::parse(".article-content")
      .map_err(|e| {
        error!("Could not parse selector: {:?}", e);
        anyhow!("Could not parse selector: {:?}", e)
      })?;

  let p_selector = Selector::parse("p")
      .map_err(|e| {
        error!("Could not parse selector: {:?}", e);
        anyhow!("Could not parse selector: {:?}", e)
      })?;

  let mut paragraphs = Vec::new();

  if let Some(article_content_div) = document.select(&selector).next() {

    for paragraph in article_content_div.select(&p_selector).into_iter() {

      //println!("\n\n=================\n\n");
      //println!("\n\n{:?}\n\n", paragraph.inner_html());

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

      //println!("\n\n=================\n\n");
    }
  }

  for paragraph in paragraphs {
    println!("\n\nParagraph: {:?}", &paragraph);

  }




  Ok(WebScrapingResult {
    web_content_type: WebContentType::CnnArticle,
    maybe_title: None,
    maybe_author: None,
    body_text: "".to_string(),
    maybe_heading_image_url: None,
    maybe_featured_image_url: None,
  })
}
