use enums::by_table::web_scraping_targets::web_content_type::WebContentType;

// TODO: Include the article publish date(!)

/// From RSS feeds and index pages, we can deduce a list of WebScrapingTargets.
/// These will be inserted into the database for later downstream processing.
#[derive(Clone, Debug)]
pub struct WebScrapingTarget {
  pub canonical_url: String,
  pub web_content_type: WebContentType,
  pub maybe_title: Option<String>,
  pub maybe_full_image_url: Option<String>,
  pub maybe_thumbnail_image_url: Option<String>,
}
