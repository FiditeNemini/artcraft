use enums::common::sqlite::awaitable_job_status::AwaitableJobStatus;
use tokens::tokens::news_stories::NewsStoryToken;

pub struct NewsStoryProductionItem {
  pub id: i64,
  pub news_story_token: NewsStoryToken,
  pub original_news_canonical_url: String,
  pub overall_production_status: AwaitableJobStatus,
  pub llm_rendition_status: AwaitableJobStatus,
  pub llm_rendition_attempts: i64,
  pub audio_generation_status: AwaitableJobStatus,
}
