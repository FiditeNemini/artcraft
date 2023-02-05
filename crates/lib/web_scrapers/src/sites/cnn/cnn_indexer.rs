use crate::payloads::web_scraping_target::WebScrapingTarget;
use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use errors::AnyhowResult;
use log::warn;
use rss::Channel;

// NB: Contains nearly 70 items
const RSS_TOP_STORIES : &'static str = "http://rss.cnn.com/rss/cnn_topstories.rss";

const RSS_WORLD : &'static str = "http://rss.cnn.com/rss/cnn_world.rss";

const RSS_US : &'static str = "http://rss.cnn.com/rss/cnn_us.rss";

const RSS_TECH : &'static str = "http://rss.cnn.com/rss/cnn_tech.rss";

pub async fn cnn_scraper_test() -> AnyhowResult<Vec<WebScrapingTarget>> {
  let content = reqwest::get(RSS_WORLD)
      .await?
      .bytes()
      .await?;

  let channel = Channel::read_from(&content[..])?;

  let mut targets = Vec::with_capacity(channel.items.len());

  for item in channel.items {
    let canonical_url = match item.link {
      Some(url) => url.clone(),
      None => {
        warn!("Skipping item due to not having a URL");
        continue;
      }
    };

    let maybe_image_url = item.extensions.get("media")
        .map(|media| media.get("group"))
        .flatten()
        .map(|group| group.get(0))
        .flatten()
        .map(|extension| extension.children.get("content"))
        .flatten()
        .map(|extensions| extensions.get(0)) // NB: First image is biggest
        .flatten()
        .map(|extension| extension.attrs.get("url"))
        .flatten()
        .map(|url| url.to_string());

    targets.push(WebScrapingTarget {
      canonical_url,
      web_content_type: WebContentType::CnnArticle,
      maybe_title: item.title.clone(),
      maybe_full_image_url: maybe_image_url,
      maybe_thumbnail_image_url: None,
    });
  }

  Ok(targets)
}
