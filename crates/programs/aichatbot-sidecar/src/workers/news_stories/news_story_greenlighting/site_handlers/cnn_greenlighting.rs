use enums::common::sqlite::skip_reason::SkipReason;
use sqlite_queries::queries::by_table::news_story_productions::list::news_story_production_item::NewsStoryProductionItem;

pub fn cnn_greenlighting(target: &NewsStoryProductionItem) -> Option<SkipReason> {

  if target.original_news_canonical_url.contains("/deals/") {
    return Some(SkipReason::Advertisement);
  }

  None
}