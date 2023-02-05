use enums::by_table::web_scraping_targets::web_content_type::WebContentType;

// TODO: Add publish date

#[derive(Clone, Debug)]
pub struct WebScrapingResult {

  /// What this is and where it came from.
  pub web_content_type: WebContentType,

  /// From page title or heading
  pub maybe_title: Option<String>,

  /// The author of the  article
  pub maybe_author: Option<String>,

  /// The paragraphs
  pub body_text: String,

  /// A heading image (at top), if present
  pub maybe_heading_image_url: Option<String>,

  /// A featured image (somewhere in the body), if present
  pub maybe_featured_image_url: Option<String>,

  // TODO
  // pub maybe_publish_date_utc: Option<DateTime<Utc>>
}
