use enums::common::sqlite::skip_reason::SkipReason;
use enums::common::sqlite::web_content_type::WebContentType;
use errors::AnyhowResult;
use web_scrapers::payloads::web_scraping_result::{ScrapedWebArticle, WebScrapingResult};

pub async fn filter_scraped_result_heuristics(web_scrape_result: &WebScrapingResult) -> AnyhowResult<Option<SkipReason>> {
  // TODO: Write some heuristics to determine if we should skip the article.

  let scrape_result = &web_scrape_result.result;

  // Must have a title
  if lacks_title(scrape_result) {
    return Ok(Some(SkipReason::EmptyContent))
  }

  if lacks_body(scrape_result) {
    return Ok(Some(SkipReason::EmptyContent))
  }

  if has_politics(scrape_result) {
    return Ok(Some(SkipReason::FilteredTopicPolitics))
  }

  if is_boring_techcrunch_article(scrape_result) {
    return Ok(Some(SkipReason::NobodyCares))
  }

  Ok(None)
}

fn lacks_title(scrape_result: &ScrapedWebArticle) -> bool {
  if let Some(title) = scrape_result.maybe_title.as_deref() {
    title.trim().is_empty()
  } else {
    true
  }
}

fn lacks_body(scrape_result: &ScrapedWebArticle) -> bool {
  scrape_result.body_text.trim().is_empty()
}

fn has_politics(scrape_result: &ScrapedWebArticle) -> bool {
  let contents = scrape_result.body_text.to_lowercase();

  if contents.contains("marjorie") && contents.contains("greene") {
    return true;
  }

  false
}

/// Filter out no-name startups
fn is_boring_techcrunch_article(scrape_result: &ScrapedWebArticle) -> bool {
  if !scrape_result.web_content_type.eq(&WebContentType::TechCrunchArticle) {
    return false;
  }

  if let Some(title) = scrape_result.maybe_title.as_deref() {
    if title.contains("$")
        || title.contains("raises")
        || title.contains("VC")
        || title.contains("startup")
        || title.contains("deck")
        || title.contains("pitch")
    {
      return true; // Lazy heuristic
    }
  }

  false
}
