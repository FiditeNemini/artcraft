use enums::common::sqlite::skip_reason::SkipReason;
use enums::common::sqlite::web_content_type::WebContentType;

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

  /// If a possible skip reason was detected, we can choose to bail out.
  /// At this stage, only the URL, RSS metadata, etc. can inform this.
  pub maybe_skip_reason: Option<SkipReason>,
}
