use crate::payloads::web_scraping_target::WebScrapingTarget;
use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use errors::AnyhowResult;
use log::warn;
use rss::Channel;

const RSS_WORLD_NEWS : &'static str = "https://www.theguardian.com/world/rss";

const RSS_TECHNOLOGY : &'static str = "https://www.theguardian.com/technology/rss";

pub async fn theguardian_scraper_test() -> AnyhowResult<Vec<WebScrapingTarget>> {
  let content = reqwest::get(RSS_WORLD_NEWS)
      .await?
      .bytes()
      .await?;

  let channel = Channel::read_from(&content[..])?;

  let mut targets = Vec::with_capacity(channel.items.len());

  for item in channel.items {
    println!("\n\nitem: {:?}", item);

    let canonical_url = match item.link {
      Some(url) => url.clone(),
      None => {
        warn!("Skipping item due to not having a URL");
        continue;
      }
    };

    let maybe_thumbnail_url = item.extensions.get("media")
        .map(|media| media.get("content"))
        .flatten()
        .map(|extensions| extensions.get(0))
        .flatten()
        .map(|extension| extension.attrs.get("url"))
        .flatten()
        .map(|url| url.to_string());

    let maybe_image_url = item.extensions.get("media")
        .map(|media| media.get("content"))
        .flatten()
        .map(|extensions| extensions.get(1))
        .flatten()
        .map(|extension| extension.attrs.get("url"))
        .flatten()
        .map(|url| url.to_string());

    targets.push(WebScrapingTarget {
      canonical_url,
      web_content_type: WebContentType::TheGuardianArticle,
      maybe_title: item.title.clone(),
      maybe_full_image_url: maybe_image_url,
      maybe_thumbnail_image_url: maybe_thumbnail_url,
    });
  }

  Ok(targets)
}
