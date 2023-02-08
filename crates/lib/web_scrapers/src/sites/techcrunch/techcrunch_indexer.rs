use bytes::Bytes;
use crate::payloads::web_scraping_target::WebScrapingTarget;
use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use errors::AnyhowResult;
use log::warn;
use rss::Channel;
use std::ops::Deref;

// NB: Feed contains ~20 items.
const MAIN_RSS_FEED : &'static str = "https://techcrunch.com/feed/";

const VENTURE_FEED : &'static str = "https://techcrunch.com/category/venture/feed/";

const STARTUPS_FEED : &'static str = "https://techcrunch.com/category/startups/feed/";

#[derive(Copy, Clone, Debug, EnumIter, EnumCount)]
pub enum TechcrunchFeed {
  Main,
  Venture,
  Startups,
}

impl TechcrunchFeed {
  fn url(&self) -> &'static str {
    match self {
      TechcrunchFeed::Main => MAIN_RSS_FEED,
      TechcrunchFeed::Venture => VENTURE_FEED,
      TechcrunchFeed::Startups => STARTUPS_FEED,
    }
  }
}

pub async fn techcrunch_indexer(feed: TechcrunchFeed) -> AnyhowResult<Vec<WebScrapingTarget>> {
  let content = reqwest::get(feed.url())
      .await?
      .bytes()
      .await?;

  // NB: TechCrunch's venture feed contains an "&bull;" HTML entity that makes the RSS client choke
  let content = String::from_utf8_lossy(content.deref());
  let content = content.replace("&bull;", "");
  let content = Bytes::from(content);

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

    // NB: TechCrunch doesn't have images, but there are sometimes some embedded in article payloads
    //let maybe_image_url = item.extensions.get("media")
    //    .map(|media| media.get("group"))
    //    .flatten()
    //    .map(|group| group.get(0))
    //    .flatten()
    //    .map(|extension| extension.children.get("content"))
    //    .flatten()
    //    .map(|extensions| extensions.get(0)) // NB: First image is biggest
    //    .flatten()
    //    .map(|extension| extension.attrs.get("url"))
    //    .flatten()
    //    .map(|url| url.to_string());

    targets.push(WebScrapingTarget {
      canonical_url,
      web_content_type: WebContentType::TechCrunchArticle,
      maybe_title: item.title.clone(),
      maybe_full_image_url: None,
      maybe_thumbnail_image_url: None,
      maybe_skip_reason: None, // NB: None known for TechCrunch at this stage (yet)
    });
  }

  Ok(targets)
}
