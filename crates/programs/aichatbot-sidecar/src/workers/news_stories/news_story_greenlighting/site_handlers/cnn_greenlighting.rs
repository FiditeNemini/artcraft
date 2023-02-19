use enums::common::sqlite::skip_reason::SkipReason;
use sqlite_queries::queries::by_table::news_story_productions::list::news_story_production_item::NewsStoryProductionItem;

pub fn cnn_greenlighting(target: &NewsStoryProductionItem) -> Option<SkipReason> {

  if target.original_news_canonical_url.contains("/deals/")
      || target.original_news_canonical_url.contains("cnn-underscored") {
    // We got a 3-minute long ad for Levi's with the "/deals/" URL.
    // CNN underscored is nothing but ads: https://www.cnn.com/cnn-underscored
    return Some(SkipReason::Advertisement);
  }

  if target.original_news_canonical_url.contains("/videos/") {
    // Video content tends to have little text
    return Some(SkipReason::VideoContent);
  }

  None
}