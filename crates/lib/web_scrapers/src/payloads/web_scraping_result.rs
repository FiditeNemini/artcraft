use enums::common::sqlite::web_content_type::WebContentType;

// TODO: Rename this to not confuse with `Result<T, E>`.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WebScrapingResult {
  /// Surface the original HTML to callers that care about it.
  pub original_html: String,

  /// Output of *successful* scraping.
  pub result: ScrapedWebArticle,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ScrapedWebArticle {
  /// Location the article came from
  pub url: String,

  /// What this is and where it came from.
  pub web_content_type: WebContentType,

  /// From page title or heading
  pub maybe_title: Option<String>,

  /// Some pages have subtitles under the main title.
  pub maybe_subtitle: Option<String>,

  /// The author of the  article
  pub maybe_author: Option<String>,

  /// The paragraphs
  pub paragraphs: Vec<String>,

  /// The paragraphs joined by newlines.
  pub body_text: String,

  /// A heading image (at top), if present
  pub maybe_heading_image_url: Option<String>,

  /// A featured image (somewhere in the body), if present
  pub maybe_featured_image_url: Option<String>,

  // TODO: Add publish date
  // pub maybe_publish_date_utc: Option<DateTime<Utc>>
}

// TODO: Other types - threaded discussions (HN, Reddit), video essays (CNN, YouTube), etc.
//  then return these in an enum container.
pub struct ScrapedThreadedDiscussion {
}

pub struct ScrapedVideo {
}
