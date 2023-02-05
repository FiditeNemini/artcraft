use std::ops::Deref;
use crate::payloads::web_scraping_target::WebScrapingTarget;
use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use errors::{anyhow, AnyhowResult};
use log::{error, warn};
use rss::Channel;
use scraper::{Html, Selector};
use crate::payloads::web_scraping_result::WebScrapingResult;

pub async fn cnn_article_scraper(url: &str) -> AnyhowResult<WebScrapingResult> {
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
  let article_content_selector = Selector::parse(".article__content")
      .map_err(|e| {
        error!("Could not parse selector: {:?}", e);
        anyhow!("Could not parse selector: {:?}", e)
      })?;

  let selector2 = Selector::parse("p.paragraph")
      .map_err(|e| {
        error!("Could not parse selector: {:?}", e);
        anyhow!("Could not parse selector: {:?}", e)
      })?;


  let matches = document.select(&article_content_selector);

  for mat in matches.into_iter() {

    let matches2 = mat.select(&selector2);

    for mat2 in matches2.into_iter() {
      println!("\n\n{:?}\n\n", mat2);
    }
  }



  Ok(WebScrapingResult {
    url: url.to_string(),
    web_content_type: WebContentType::CnnArticle,
    maybe_title: None,
    maybe_author: None,
    paragraphs: vec![],
    body_text: "".to_string(),
    maybe_heading_image_url: None,
    maybe_featured_image_url: None,
  })
}
